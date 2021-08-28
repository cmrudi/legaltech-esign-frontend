import React, { useState, useRef } from "react";
import SignaturePad from "react-signature-canvas";
import { useTranslation } from "react-i18next";
import {
  useCheckbox,
  useFile,
  useFormInput,
  useProgressBar,
} from "../../../helpers/hooks";
import EditIcon from "@material-ui/icons/EditRounded";
import CloudUploadIcon from "@material-ui/icons/CloudUploadRounded";
import TextFieldsIcon from "@material-ui/icons/TextFieldsRounded";
import "./signaturemodal.scss";
import DragDropWithProgressBar from "../ImageUpload/DragDropWithProgressBar";
import { isFileValid } from "helpers/validator";
import BasicInputLabel, { BasicSelect } from "../InputLabel/basic";
import { FONTLIST } from "helpers/constant";
import { useSnackbar } from "contexts/SnackbarContext";
import { addSignature } from "api/auth";
import { convertToImg } from "helpers/utils";

const TextWrite = ({ t, formItemData, fontData }) => {
  return (
    <>
      <BasicInputLabel label={t("form.name")} data={formItemData} />
      <BasicInputLabel
        label={t("form.preview")}
        isShow
        data={formItemData}
        fontFamily={fontData?.value}
      />
      <BasicSelect data={fontData} label={t("form.font")} list={FONTLIST} />
    </>
  );
};

const SignatureModal = ({ isInitial }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const checkbox = useCheckbox();

  // const [error, setError] = useState(null);
  // const [success, setSuccess] = useState(null);
  const { addSnackbar } = useSnackbar();
  // const [loading, setLoading] = useState(false);

  // const [imageURL, setImageURL] = useState(null);
  const signCanvas = useRef({});
  // const clear = () => signCanvas.current?.clear();

  const data = useFile();
  const progress = useProgressBar();

  const formItemData = useFormInput("");

  const fontData = useFormInput(FONTLIST[0][0]);
  // const formItemDisplay = useMemo(
  //   () => (
  //     <span
  //       className="form-item-display"
  //       style={{ fontFamily: fontData?.value }}
  //     >
  //       {formItemData?.value}
  //     </span>
  //   ),
  //   [formItemData, fontData]
  // );

  const addingSignature = async (fileData) => {
    try {
      const res = await addSignature(fileData, isInitial);
      if (res?.data) {
        //     handle_data_docs(true, atr, "fileData", res.data);
        //     setAvailableLevel((a) => a + 1);
        progress.set(100);
        addSnackbar(t("sign.selectDocument.uploadFileSuccess"), "success");
        //     setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      addSnackbar(String(err));
      progress.set(-1);
    }
  };

  const save = async () => {
    if (![0, 1, 2].includes(tab)) return;
    try {
      if (tab === 0) {
        const temp = signCanvas.current
          .getTrimmedCanvas()
          .toDataURL("image/png");
        await addingSignature(temp);
      }
      if (tab === 1) await handleUploadFile();
      if (tab === 2) {
        const doc = document.getElementById("showed-font-input-tag");
        const res = await convertToImg(doc);
        await addingSignature(res);
      }
    } catch (err) {
      addSnackbar(String(err));
      progress.set(-1);
    }
  };

  const handleUploadFile = async () => {
    if (!data?.file || data?.file === null) return;
    if (progress.value !== 0) return;
    try {
      const bool = isFileValid(data?.file, [".pdf", ".docx"], 3000);
      if (bool) {
        progress.set(1);
        await addingSignature(data?.file);
      }
    } catch (err) {
      addSnackbar(String(err));
      progress.set(-1);
    }
  };

  const handleDeleteFile = async () => {
    // try {
    //   if (!fileData?.uid || fileData?.uid === null)
    //     throw new Error(t("form.error.fileNotUploadedYet"));
    //   const res = await deleteDoc(fileData?.uid);
    //   if (res?.data) {
    //     data?.setFile(null);
    //     data?.filePicker.current.focus();
    //     data.filePicker.current.value = null;
    //     handle_data_docs(false, atr, "fileData");
    //     progress.set(0);
    //     setSuccess(t("sign.selectDocument.deleteFileSuccess"));
    //     setTimeout(() => setSuccess(false), 3000);
    //   }
    // } catch (err) {
    //   progress.set(-1);
    //   setError(String(err));
    //   setTimeout(() => setError(false), 3000);
    // }
  };

  return (
    <>
      <div className="row whole-signature-modal">
        <div className="col col-3">
          {[
            ["settings.signature.draw", <EditIcon />],
            ["settings.signature.upload", <CloudUploadIcon />],
            ["settings.signature.textText", <TextFieldsIcon />],
          ].map((text, i) => (
            <div className="tab-area" key={i} onClick={() => setTab(i)}>
              {text[1]}
              <span>{t(text[0])}</span>
            </div>
          ))}
        </div>
        <div className="col col-9">
          <div className="signature-container">
            {tab === 0 && (
              <>
                <SignaturePad
                  ref={signCanvas}
                  canvasProps={{
                    className: "signature-canvas",
                  }}
                />
                <div className="handle-text">
                  <div className="edit-icon">
                    <EditIcon />
                  </div>
                  <hr />
                </div>
                {/* {imageURL && (
                  <img
                    src={imageURL}
                    alt="my signature"
                    style={{
                      display: "block",
                      margin: "0 auto",
                      border: "1px solid black",
                      width: "150px",
                    }}
                  />
                )} */}
              </>
            )}

            {tab === 1 && (
              <div className="dd-wpb-container">
                <DragDropWithProgressBar
                  data={data}
                  handleDeleteFile={handleDeleteFile}
                  progress={progress}
                />
              </div>
            )}

            {tab === 2 && (
              <div className="signature-popup-text-container">
                <TextWrite
                  formItemData={formItemData}
                  t={t}
                  fontData={fontData}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center signature-below">
        <div className="left-saying">
          <span>
            <input type="checkbox" {...checkbox} />
            <label>{t("settings.signature.iUnderstand")}</label>
          </span>
        </div>
        <div className="button-container">
          <button onClick={save} className="btn btn-black circled">
            Save
          </button>
          {/* <button onClick={clear}>Clear</button> */}
        </div>
      </div>
    </>
  );
};
export default SignatureModal;
