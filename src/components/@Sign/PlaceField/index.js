import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useData } from "../../../contexts/DataContext";
import "./placefield.scss";
import { v4 as uuid } from "uuid";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Toolbar from "./Toolbar";
import FieldSidebar from "./FieldSidebar";
import PDFViewer, { INIT_FIELD_HEIGHT, INIT_FIELD_WIDTH } from "./PDFViewer";
import RightSnippetArea from "./RightSnippetArea";
import { isValidEmail } from "../../../helpers/validator";

import SuperFloatingButton from "../commons/SuperFloatingButton";
// import { TransformWrapper } from "react-zoom-pan-pinch";

import useClippy from "use-clippy";
import Ajv from "ajv";

import { useSnackbar } from "contexts/SnackbarContext";
import { addFields, getDocImages, addQRCode } from "api/docs";

import { useHistory } from "react-router-dom";
import {
  addColorToArr,
  addToDevFields,
  getFrontendDateFormat,
  transformFormInput,
} from "helpers/transformer";
import { DEFAULT, DOC, FRONTEND_URL } from "helpers/constant";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useProgressBar } from "helpers/hooks";

const schema = {
  type: "object",
  properties: {
    type: { type: "string" },
    x: { type: "number" },
    y: { type: "number" },
    w: { type: "number" },
    h: { type: "number" },
    pageNum: { type: "integer" },
    signer: {
      type: "object",
      properties: {
        value: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        color: { type: "string" },
        backgroundColor: { type: "string" },
        flowtype: { type: "string" },
        label: { type: "string" },
      },
    },
    pagePosition: {
      type: "object",
      properties: {
        x: { type: "number" },
        y: { type: "number" },
        w: { type: "number" },
        height: { type: "number" },
      },
    },
    value: { type: "string" },
    fieldname: { type: "string" },
    required: { type: "boolean" },
    formatting: {
      type: "object",
      properties: { font: { type: "string" }, size: { type: "number" } },
    },
  },
};

const MAX_STACK_SIZE = 40;
export const QR_CODE_RELATIVE_SIZE = 0.1;

const PlaceField = ({ activeItemId, atr }) => {
  const { getItemData, handle_data_docs } = useData();
  const fileData = getItemData(atr, "fileData");

  const { auth } = useAuth();

  const initial_image_url = useMemo(
    () => auth?.initial_finished_url ?? "",
    [auth]
  );
  const signature_image_url = useMemo(
    () => auth?.signature_finished_url ?? "",
    [auth]
  );

  const { addSnackbar } = useSnackbar();
  const { push } = useHistory();

  const { fullname, email } = auth;
  const imgProgress = useProgressBar();
  const fieldProgress = useProgressBar();

  const listSigners = useMemo(
    () =>
      transformFormInput(
        addColorToArr(
          atr !== DOC.me
            ? fileData?.nextflow?.filter((a) => a.flowtype === "SIGN")
            : [{ name: fullname, email }]
        )
      ),
    [fileData, fullname, email, atr]
  );
  const [currentSigner, setCurrentSigner] = useState({});
  useEffect(() => {
    setCurrentSigner(listSigners?.length > 0 ? listSigners[0] : {});
  }, [listSigners]);

  const fields = useMemo(
    () => getItemData(atr, "placeFieldFields") ?? [],
    [getItemData, atr]
  );

  const placeFieldImages = useMemo(
    () => getItemData(atr, "placeFieldImages") ?? [],
    [getItemData, atr]
  );
  const setFields = useCallback(
    (val) => handle_data_docs(true, atr, "placeFieldFields", val),
    [handle_data_docs, atr]
  );

  const [scale, setScale] = useState(100);
  const [currentField, setCurrentField] = useState(null);
  const [qrCodePosition, setQrCodePosition] = useState(1);
  const [stateStack, setStateStack] = useState([[]]);
  const [stackIdx, setStackIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState(1);

  useEffect(() => {
    if (fileData) {
      if (fileData?.uid === undefined) push(`${FRONTEND_URL.docs}`);
    } else push(`${FRONTEND_URL.docs}`);
  }, [fileData, push]);

  const fetchAllFields = useCallback(async () => {
    if (fieldProgress.value !== 0) return;
    if (fields && fields.length > 0) return;

    let finalField = fileData?.fields?.map((field) => {
      let curPage = document.getElementById("one-image-area-" + field?.pageNum);
      let pagePosition = curPage?.getBoundingClientRect();
      return { ...field, pagePosition };
    });
    let temp = addToDevFields(finalField, fileData?.nextflow);
    setFields(temp);
    fieldProgress.set(1);
    // updatePlaceFields({
    //   fields: addToDevFields(fileData?.fields, fileData?.nextflow),
    // });
    // fieldProgress.set(100);
    setQrCodePosition(fileData?.qrcode);
    // } else {
    //   try {
    //     const res = await getAllFields(fileData?.uid);
    //     if (res) {
    //       fieldProgress.set(100);
    //       updatePlaceFields({ fields: res });
    //     }
    //   } catch (e) {
    //     fieldProgress.set(-1);
    //     addSnackbar(String(e));
    //   }
    // }
  }, [fileData, setFields, fields, fieldProgress]);

  const fetchAllImages = useCallback(async () => {
    if (imgProgress.value !== 0) return;
    if (!fileData?.uid || fileData?.uid === undefined) return;
    if (placeFieldImages && placeFieldImages.length > 0) return;
    if (loading) return;

    try {
      imgProgress.set(1);
      setLoading(true);
      const res = await getDocImages(fileData?.uid);
      if (res) {
        imgProgress.set(100);
        handle_data_docs(true, atr, "placeFieldImages", res);
      }
    } catch (e) {
      imgProgress.set(-1);
      addSnackbar(String(e));
    } finally {
      setLoading(false);
    }
  }, [
    fileData,
    addSnackbar,
    handle_data_docs,
    atr,
    placeFieldImages,
    imgProgress,
    loading,
  ]);

  const isTheseFieldsSame = useCallback((oneField, twoField) => {
    return oneField?.uuid === twoField?.uuid;
  }, []);

  const isTheSelectedFieldSameAsThisField = useCallback(
    (oneField) => {
      return oneField?.uuid === currentField?.uuid;
    },
    [currentField]
  );

  const [isShow, setIsShow] = useState(true);

  useEffect(() => {
    fetchAllImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToPage = useCallback(
    (pageNum = visibility, align = "center") => {
      let currentPage = document.getElementById(`one-image-area-${pageNum}`);
      currentPage?.scrollIntoView({
        behavior: "smooth",
        block: align,
        inline: align,
      });
    },
    [visibility]
  );

  const { t } = useTranslation();

  const handleNext = async () => {
    try {
      // const myFields = document.getElementsByClassName("my placeholder");
      // if (myFields.length > 0) throw new Error("Open all your fields!");

      const finalFields = fields?.map((field) => {
        const special =
          ["signature", "initial"].includes(
            String(field?.type).toLowerCase()
          ) && auth?.email === field?.signer?.email;

        if (special) {
          if (
            initial_image_url === "" &&
            String(field?.type).toLowerCase() === "initial"
          )
            throw new Error("You have initial that you need to fill first!");
          if (
            signature_image_url === "" &&
            String(field?.type).toLowerCase() === "signature"
          )
            throw new Error("You have signature that you need to fill first!");
        }
        if (
          String(field?.type).toLowerCase() === "email" &&
          auth?.email === field?.signer?.email &&
          !isValidEmail(field?.value)
        )
          throw new Error("Fix your email!");

        return {
          fieldname: field?.fieldname,
          x: field?.x,
          y: field?.y,
          w: field?.w,
          h: field?.h,
          pageNum: field?.pageNum,
          type: field?.type,
          assignedTo: field?.signer?.email,
          required: field?.required,
          formatting: field?.formatting,
          value: !special
            ? field?.value
            : String(field?.type).toLowerCase() === "initial"
            ? initial_image_url
            : signature_image_url,
          // value: !special
          //   ? field?.value
          //   : !["initial", "signature"].includes(
          //       String(field?.type).toLowerCase()
          //     )
          //   ? convertToImg(field)
          //   : String(field?.type).toLowerCase() === "initial"
          //   ? initial_image_url
          //   : signature_image_url,
        };
      });

      const res = await addFields(fileData?.uid, finalFields);
      if (res) {
        const newRes = await addQRCode(
          fileData?.filename,
          fileData?.uid,
          String(atr).toUpperCase(),
          qrCodePosition
        );
        if (newRes) {
          handle_data_docs(true, atr, "fileData", newRes);
          push(`${atr}#${activeItemId + 1}`);
          addSnackbar(t("sign.placeFields.placeFieldSuccess"), "success");
        }
      }
    } catch (err) {
      addSnackbar(String(err));
    }
  };
  const [clipboard, setClipboard] = useClippy();

  const copyPasteHandler = (e) => {
    if (e.key === "c" && e.ctrlKey) {
      try {
        copyField();
        e.preventDefault();
      } catch (e) {}
    }
    if (e.key === "v" && e.ctrlKey) {
      try {
        pasteField();
        e.preventDefault();
      } catch (e) {}
    }
  };

  const copyField = useCallback(() => {
    setClipboard(JSON.stringify(currentField));
  }, [currentField, setClipboard]);

  // useEffect(() => {
  //   console.log("newStack");
  //   console.log(stateStack);
  // }, [stateStack]);

  const pushToStack = useCallback(
    (fields) => {
      let newStack = stateStack.slice(0, stackIdx + 1);
      if (newStack.length + 1 >= MAX_STACK_SIZE) newStack.shift();
      newStack = [...newStack, JSON.parse(JSON.stringify(fields))];
      setStackIdx(stackIdx + 1);
      setStateStack(newStack);
    },
    [stateStack, setStateStack, setStackIdx, stackIdx]
  );

  const pasteField = useCallback(() => {
    try {
      const ajv = new Ajv();
      let data = JSON.parse(clipboard);
      const validate = ajv.compile(schema);
      if (validate(data) && typeof data === "object") {
        data.x = 0.5 - 0.5 * data.w;
        data.y = 0.5 - 0.5 * data.w;
        data.uuid = String(data?.uuid) + String(uuid());
        data.pageNum = visibility;
        scrollToPage();
        pushToStack([...fields, data]);
        setFields([...fields, data]);
      }
    } catch (e) {
      throw e;
    }
  }, [clipboard, fields, setFields, pushToStack, scrollToPage, visibility]);

  const undoField = useCallback(() => {
    if (stateStack.length > 1 && stackIdx > 0) {
      // console.log("undo");
      setFields(JSON.parse(JSON.stringify(stateStack[stackIdx - 1])));
      setStackIdx((i) => i - 1);
      scrollToPage();
    }
  }, [stateStack, stackIdx, setFields, setStackIdx, scrollToPage]);

  const redoField = useCallback(() => {
    // console.log("redo");
    if (stackIdx + 1 < stateStack.length) {
      setFields(JSON.parse(JSON.stringify(stateStack[stackIdx + 1])));
      setStackIdx((i) => i + 1);
      // console.log("redoed");
      scrollToPage();
    }
  }, [stateStack, stackIdx, setFields, setStackIdx, scrollToPage]);

  const undoRedoHandler = useCallback(
    (e) => {
      if (e.key === "z" && e.ctrlKey) {
        try {
          undoField();
          e.preventDefault();
        } catch (e) {}
      }
      if (e.key === "y" && e.ctrlKey) {
        try {
          redoField();
          e.preventDefault();
        } catch (e) {}
      }
    },
    [undoField, redoField]
  );
  useEffect(() => {
    const manipulation = (e) => {
      if (e.key === "z" && e.ctrlKey) {
        try {
          undoField();
          e.preventDefault();
        } catch (e) {}
      }
      if (e.key === "y" && e.ctrlKey) {
        try {
          redoField();
          e.preventDefault();
        } catch (e) {}
      }
      if (e.key === "c" && e.ctrlKey) {
        try {
          copyField();
          e.preventDefault();
        } catch (e) {}
      }
      if (e.key === "v" && e.ctrlKey) {
        try {
          pasteField();
          e.preventDefault();
        } catch (e) {}
      }
    };
    window.addEventListener("keydown", manipulation);
    return () => window.removeEventListener("keydown", manipulation);
  }, [undoField, redoField, copyField, pasteField]);

  const getNewFieldValue = (type) => {
    if (type === "date") return String(getFrontendDateFormat());
    if (type === "name") return auth?.fullname;
    if (type in auth) return auth?.[type];
    return "";
  };

  const addFieldToWorkspace = (type, fieldPosition, pageNum = visibility) => {
    let curPage = document.getElementById("one-image-area-" + pageNum);
    const pagePosition = curPage?.getBoundingClientRect();

    let x = fieldPosition
      ? (fieldPosition?.x - pagePosition.left - INIT_FIELD_WIDTH / 2) /
        pagePosition.width
      : 0.45;
    let y = fieldPosition
      ? (fieldPosition?.y - pagePosition.top - INIT_FIELD_HEIGHT / 2) /
        pagePosition.height
      : 0.45;

    let w = INIT_FIELD_WIDTH / pagePosition.width;
    let h = INIT_FIELD_HEIGHT / pagePosition.height;

    let newField = {
      type: t(String(type)),
      x,
      y,
      w,
      h,
      fieldname: t(String(type)),
      pageNum,
      signer: currentSigner,
      required: ["signature", "initial"].includes(
        String(t(String(type))).toLowerCase()
      ),
      pagePosition,
      value:
        auth?.email !== currentSigner?.email
          ? ""
          : getNewFieldValue(t(String(type)).toLowerCase()),
      formatting: { font: "Arial", size: 12 },
      uuid: uuid(),
    };

    setFields([...fields, newField]);
    pushToStack([...fields, newField]);
  };

  return (
    <>
      <div
        className={"place-field-area"}
        onKeyDown={(e) => {
          copyPasteHandler(e);
          undoRedoHandler(e);
        }}
      >
        {/* <TransformWrapper initialScale={1} panning={{ disabled: !true }}>
          {({
            zoomIn,
            zoomOut,
            resetTransform,
            positionX,
            positionY,
            ...rest
          }) => ( */}
        <>
          <Toolbar
            copyField={copyField}
            pasteField={pasteField}
            undoField={undoField}
            redoField={redoField}
            setQrCodePosition={setQrCodePosition}
            canEdit={placeFieldImages && placeFieldImages?.length > 0}
            visibility={visibility}
            scale={scale}
            setScale={setScale}
            setIsShow={setIsShow}
            // zoomIn={zoomIn}
            // zoomOut={zoomOut}
          />

          <DndProvider backend={HTML5Backend}>
            <FieldSidebar
              atr={atr}
              listSigners={listSigners}
              currentSigner={currentSigner}
              addFieldToWorkspace={addFieldToWorkspace}
              setCurrentSigner={setCurrentSigner}
            />

            <PDFViewer
              fields={fields}
              scale={scale}
              setScale={setScale}
              fetchAllFields={fetchAllFields}
              setIsShow={setIsShow}
              setFields={setFields}
              addFieldToWorkspace={addFieldToWorkspace}
              setVisibility={setVisibility}
              currentSigner={currentSigner}
              stateStack={stateStack}
              currentField={currentField}
              setCurrentField={setCurrentField}
              placeFieldImages={placeFieldImages}
              pushToStack={pushToStack}
              fileName={fileData?.filename ?? DEFAULT.DOC_FILE_NAME}
              qrCodePosition={qrCodePosition}
              qrCodeImg={fileData?.qrcodeImg}
              isTheseFieldsSame={isTheseFieldsSame}
              isTheSelectedFieldSameAsThisField={
                isTheSelectedFieldSameAsThisField
              }
            />

            <RightSnippetArea
              currentField={currentField}
              setCurrentField={setCurrentField}
              visibility={visibility}
              setFields={setFields}
              fields={fields}
              setIsShow={setIsShow}
              placeFieldImages={placeFieldImages}
              fileName={fileData?.filename ?? DEFAULT.DOC_FILE_NAME}
              scrollToPage={scrollToPage}
              isShow={isShow}
              isTheSelectedFieldSameAsThisField={
                isTheSelectedFieldSameAsThisField
              }
              onDelete={() => {
                let temp = fields.filter(
                  (t) => !isTheseFieldsSame(t, currentField)
                );
                setFields(temp);
                pushToStack(temp);
                setCurrentField(null);
              }}
            />
          </DndProvider>
        </>
        {/* )}
        </TransformWrapper> */}
      </div>
      <SuperFloatingButton
        onClickPrev={() => push(`${atr}#${activeItemId - 1}`)}
        onClickNext={handleNext}
        disabledBack={false}
        disabled={fields?.length === 0}
      />
    </>
  );
};

export default PlaceField;
