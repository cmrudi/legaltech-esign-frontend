import React, { useState, useRef, useCallback } from "react";
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
import { useAuth } from "contexts/AuthContext";

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

const SignatureModal = ({ isInitial, extraCallback = () => {} }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const checkbox = useCheckbox();

  const { addSnackbar } = useSnackbar();
  const { putAuth } = useAuth();
  const [loading, setLoading] = useState(0);
  const signCanvas = useRef({});

  const data = useFile();
  const progress = useProgressBar();

  const formItemData = useFormInput("");

  const fontData = useFormInput(FONTLIST[0][0]);

  const addingSignature = useCallback(
    async (fileData) => {
      try {
        setLoading(1);
        const res = await addSignature(fileData, isInitial);
        // console.log("RES", res?.data);
        if (res?.data) {
          progress.set(100);
          putAuth(res.data);
          addSnackbar(t("sign.selectDocument.uploadFileSuccess"), "success");
          extraCallback();
        }
      } catch (err) {
        addSnackbar(String(err));
        progress.set(-1);
      } finally {
        progress.set(0);
        setLoading(0);
      }
    },
    [isInitial, progress, putAuth, addSnackbar, t, extraCallback]
  );

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
    if (progress.value > 0 && progress.value < 100) return;
    data.setFile(null);
  };

  // const shallButtonDisabled = useMemo(() => {
  //   if (!checkbox.checked) return true;
  //   if (tab === 2) return String(formItemData.value).length === 0;
  // }, [tab, formItemData, checkbox.checked]);
  const shallButtonDisabled = loading;

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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="d-flex justify-content-between align-items-center signature-below"
      >
        <div className="left-saying">
          <span>
            <input type="checkbox" {...checkbox} required />
            <label>{t("settings.signature.iUnderstand")}</label>
          </span>
        </div>
        <div className="button-container">
          <button
            className="btn btn-black circled"
            disabled={shallButtonDisabled}
          >
            Save
          </button>
          {/* <button onClick={clear}>Clear</button> */}
        </div>
      </form>
    </>
  );
};
export default SignatureModal;
