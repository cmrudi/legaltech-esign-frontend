import React, { useCallback, useState, useEffect, useMemo } from "react";

import "./document.scss";

import PDFSigner, { LeftArea } from "./PDFSigner";

import { useSnackbar } from "contexts/SnackbarContext";
import { getDocImages, getAllFields, updateFields } from "api/docs";
import SignNav from "./SignNav";
import SignFoot from "./SignNav/Foot";
import { useProgressBar } from "helpers/hooks";
import { useHistory, useParams } from "react-router";
import { FRONTEND_URL } from "helpers/constant";
import SignAuditTrail from "./SignAuditTrail";
import { addToDevFields, getFrontendDateFormat } from "helpers/transformer";
import SignToolbar from "./SignToolbar";
import { useAuth } from "contexts/AuthContext";
import { isValidEmail } from "helpers/validator";
import { useTranslation } from "react-i18next";
import { useData } from "contexts/DataContext";
import { useModal } from "contexts/ModalContext";

const Document = () => {
  const { fileUId } = useParams();
  const { push } = useHistory();

  const [loading, setLoading] = useState(false);

  const [fields, setFields] = useState([]);
  const [placeFieldImages, setPlaceFieldImages] = useState([]);
  const [fileData, setFileData] = useState(false);

  const { auth: currentSigner } = useAuth();
  const { setSignData } = useData();
  const { openVerifySignature } = useModal();

  const { addSnackbar } = useSnackbar();
  const imgProgress = useProgressBar();
  const fieldProgress = useProgressBar();

  const [scale, setScale] = useState(100);

  const fetchAllFields = useCallback(async () => {
    if (fieldProgress.value !== 0) return;
    if (!fileUId || fileUId === undefined) {
      push(`${FRONTEND_URL.docs}`);
      return;
    }
    if (fields && fields.length > 0) return;
    if (loading) return;

    try {
      fieldProgress.set(1);
      setLoading(true);
      const res = await getAllFields(fileUId);
      if (res) {
        let finalField = res?.fields?.map((field) => {
          let curPage = document.getElementById(
            "one-sign-image-area-" + field?.pageNum
          );
          let pagePosition = curPage?.getBoundingClientRect();
          return { ...field, pagePosition };
        });
        let temp = addToDevFields(finalField, res?.doc?.nextflow);
        setFields(temp);
        fieldProgress.set(100);
        setFileData(res?.doc);
      }
    } catch (e) {
      fieldProgress.set(-1);
      addSnackbar(String(e));
      // setTimeout(() => push(`${FRONTEND_URL.docs}`), 3000);
    } finally {
      setLoading(false);
    }
  }, [fileUId, loading, addSnackbar, push, setFields, fields, fieldProgress]);

  const initial_image_url = useMemo(
    () => currentSigner?.initial_finished_url ?? "",
    [currentSigner]
  );
  const signature_image_url = useMemo(
    () => currentSigner?.signature_finished_url ?? "",
    [currentSigner]
  );

  const getValue = (type) => {
    if (type === "name") return currentSigner?.fullname;
    if (type === "date") return getFrontendDateFormat();
    if (type === "initial") return initial_image_url;
    if (type === "signature") return signature_image_url;
    return currentSigner?.[type] ?? "";
  };

  const fetchAllImages = useCallback(async () => {
    if (imgProgress.value !== 0) return;
    if (!fileUId || fileUId === undefined) {
      push(`${FRONTEND_URL.docs}`);
      return;
    }
    if (placeFieldImages && placeFieldImages.length > 0) return;
    if (loading) return;

    try {
      imgProgress.set(1);
      setLoading(true);
      const res = await getDocImages(fileUId);
      if (res) {
        imgProgress.set(100);
        setPlaceFieldImages(res);
        setLoading(false);
      }
    } catch (e) {
      imgProgress.set(-1);
      addSnackbar(String(e));
      setLoading(false);
      // setTimeout(() => push(`${FRONTEND_URL.docs}`), 3000);
    }
  }, [addSnackbar, fileUId, placeFieldImages, push, imgProgress, loading]);

  useEffect(() => {
    fetchAllImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTheseFieldsSame = useCallback((oneField, twoField) => {
    return oneField?.uuid === twoField?.uuid;
  }, []);

  const scrollToPage = useCallback((pageNum = 1, align = "center") => {
    let currentPage = document.getElementById(`one-sign-image-area-${pageNum}`);
    currentPage?.scrollIntoView({
      behavior: "smooth",
      block: align,
      inline: align,
    });
  }, []);

  const { t } = useTranslation();

  const handleSubmit = async (finalFields) => {
    try {
      const res = await updateFields(fileUId, finalFields);
      return res;
    } catch (err) {
      addSnackbar(String(err));
    }
  };

  const isAllFieldDone = useMemo(() => {
    for (let field of fields) {
      if (!field?.required) continue;
      const special =
        ["signature", "initial"].includes(String(field?.type).toLowerCase()) &&
        currentSigner?.email === field?.signer?.email;
      if (special) {
        if (
          initial_image_url === "" &&
          String(field?.type).toLowerCase() === "initial"
        )
          return false;
        if (
          signature_image_url === "" &&
          String(field?.type).toLowerCase() === "signature"
        )
          return false;
      }
      if (
        String(field?.type).toLowerCase() === "email" &&
        currentSigner?.email === field?.signer?.email &&
        !isValidEmail(field?.value)
      )
        return false;
      if (String(field?.value).trim() === "") return false;
      if (!field?.isEditing) return false;
    }
    return true;
  }, [fields, currentSigner?.email, initial_image_url, signature_image_url]);

  // useEffect(() => console.log("isdone", isAllFieldDone));

  const handleNext = () => {
    // const finalFields = fields?.map((field) => {
    //   const special =
    //     ["signature", "initial"].includes(
    //       String(field?.type).toLowerCase()
    //     ) && currentSigner?.email === field?.signer?.email;

    //   if (special) {
    //     if (
    //       initial_image_url === "" &&
    //       String(field?.type).toLowerCase() === "initial"
    //     )
    //       throw new Error("You have initial that you need to fill first!");
    //     if (
    //       signature_image_url === "" &&
    //       String(field?.type).toLowerCase() === "signature"
    //     )
    //       throw new Error("You have signature that you need to fill first!");
    //   }
    //   if (
    //     String(field?.type).toLowerCase() === "email" &&
    //     currentSigner?.email === field?.signer?.email &&
    //     !isValidEmail(field?.value)
    //   )
    //     throw new Error("Fix your email!");

    //   if (String(field?.value).trim() === "")
    //     throw new Error(`Fix your ${field?.type}`);
    //   if (!field?.isEditing) throw new Error(`Fix your ${field?.type}`);

    //   return {
    //     id: field?.id,
    //     value: field?.value,
    //   };
    // });

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (field?.isEditing) {
        continue;
      }
      if (!field?.idEditing && field?.required) {
        const currentField = document.getElementById(
          `sign-field-${field.uuid}`
        );
        currentField.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
        return;
      }
    }

    const finalFields = fields?.map((field) => {
      return {
        id: field?.id,
        value: field?.value,
      };
    });

    if (isAllFieldDone) {
      try {
        setLoading(true);
        const res = handleSubmit(finalFields);
        if (res) {
          setSignData(res);
          openVerifySignature({
            onClickCTA: () => {
              addSnackbar(t("sign.placeFields.placeFieldSuccess"), "success");
              push(`${FRONTEND_URL.documentAuditTrail}/${fileUId}`);
            },
            isSign: true,
            fileUID: fileData?.uid,
          });
        }
      } catch (e) {
        addSnackbar(String(e));
        setLoading(false);
      }
    }
  };

  return (
    <>
      <SignNav />
      <div className={"sign-place-field-area"}>
        <SignToolbar
          handleNext={handleNext}
          setScale={setScale}
          scale={scale}
          isAllFieldDone={isAllFieldDone}
          scrollToPage={scrollToPage}
        />

        <LeftArea
          setFields={setFields}
          fields={fields}
          isTheseFieldsSame={isTheseFieldsSame}
          currentSigner={currentSigner}
          getValue={getValue}
        />

        <PDFSigner
          getValue={getValue}
          setFields={setFields}
          scale={scale}
          fileData={fileData}
          fetchAllFields={fetchAllFields}
          fields={fields}
          placeFieldImages={placeFieldImages}
          isTheseFieldsSame={isTheseFieldsSame}
        />
        <SignAuditTrail
          fileData={fileData}
          placeFieldImages={placeFieldImages}
          scrollToPage={scrollToPage}
        />
        {/* 
          <RightSnippetArea
            currentField={currentField}
            setCurrentField={setCurrentField}
            fields={fields}
          /> */}

        <SignFoot />
      </div>
    </>
  );
};

export default Document;
