import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFile, useProgressBar } from "../../../helpers/hooks";
import { useData } from "../../../contexts/DataContext";

import DragDrop from "../../commons/ImageUpload/DragDrop";
import FloatingButton from "../commons/FloatingButton";
import Progressbar from "../../../components/commons/Progressbar";

import { deleteDoc, addDoc, replaceDoc } from "../../../api/docs";
import { isFileValid } from "../../../helpers/validator";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";
import "./selectDocument.scss";
import { useSnackbar } from "contexts/SnackbarContext";
import { useHistory } from "react-router-dom";

const SelectDocument = ({ atr, activeItemId }) => {
  const { t } = useTranslation();
  const { addSnackbar } = useSnackbar();
  const data = useFile();
  const { handle_data_docs, getItemData } = useData();
  const { push } = useHistory();

  const fileData = getItemData(atr, "fileData");
  useEffect(() => {
    console.log(fileData);
  }, [fileData]);

  const progress = useProgressBar();

  const shallNext = () => {
    if (fileData) return false;
    return progress.value !== 100;
  };

  const handleUploadFile = useCallback(async () => {
    if (!data?.file || data?.file === null) return;
    if (progress.value !== 0) return;
    try {
      const bool = isFileValid(data?.file, [".pdf", ".docx"], 3000);
      if (bool) {
        progress.set(1);
        let res;
        if (fileData) {
          res = await replaceDoc(
            data?.file,
            data?.file?.name,
            fileData.id,
            String(atr).toUpperCase()
          );
        } else {
          res = await addDoc(
            data?.file,
            data?.file?.name,
            String(atr).toUpperCase()
          );
        }
        if (res?.data) {
          handle_data_docs(true, atr, "fileData", res.data);
          progress.set(100);
          addSnackbar(t("sign.selectDocument.uploadFileSuccess"), "success");
        }
      }
    } catch (err) {
      addSnackbar(String(err));
      progress.set(-1);
    }
  }, [data?.file, handle_data_docs, progress, t, fileData, atr, addSnackbar]);

  useEffect(() => {
    handleUploadFile();
    return () => handleUploadFile();
  }, [handleUploadFile]);

  const handleDeleteFile = async () => {
    try {
      if (!fileData?.id || fileData?.id === null)
        throw new Error(t("form.error.fileNotUploadedYet"));
      const res = await deleteDoc(fileData?.id);
      if (res?.data) {
        data?.setFile(null);
        data?.filePicker.current.focus();
        data.filePicker.current.value = null;
        handle_data_docs(false, atr, "fileData");
        progress.set(0);
        addSnackbar(t("sign.selectDocument.deleteFileSuccess"), "success");
      }
    } catch (err) {
      progress.set(-1);
      addSnackbar(String(err));
    }
  };

  return (
    <div className="container container-center sign-select-document-container">
      <div className="first-child">
        <h4 className="bold">{t("sign.selectDocument.whatNeed")}</h4>
        <div className="mt-5 bold mb-2">{t("sign.selectDocument.text")}</div>
        <DragDrop
          data={data}
          progress={progress}
          // disabled={progress.value === 100}
        />

        <div className="mt-5 bold mb-2">
          {t("sign.selectDocument.docsUSelected")}
        </div>
        {fileData && !data?.file && (
          <>
            <div className="item-left">
              <DescriptionOutlinedIcon className="file-icon" />
              <div className="px-2">{fileData?.filename}</div>
              <div className="mx-2 cursor-pointer">
                <CancelOutlinedIcon
                  onClick={handleDeleteFile}
                  className="delete-red"
                />
              </div>
            </div>
            <div className="mt-3">
              <Progressbar progress={100} />
            </div>
          </>
        )}
        {data?.file && (
          <>
            <div className="item-left">
              <DescriptionOutlinedIcon className="file-icon" />
              <div className="px-2">{data?.file?.name}</div>
              <div className="mx-2 cursor-pointer">
                <CancelOutlinedIcon
                  className="delete-red"
                  onClick={handleDeleteFile}
                />
              </div>
            </div>
            <div className="mt-3">
              <Progressbar progress={progress.value} />
            </div>
          </>
        )}
      </div>

      <FloatingButton
        onClickNext={() => {
          push(`${atr}#${activeItemId + 1}`);
        }}
        disabled={shallNext()}
      />
    </div>
  );
};

export default SelectDocument;
