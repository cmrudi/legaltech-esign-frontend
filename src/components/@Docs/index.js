import React, { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../contexts/DataContext";
import { useFormInput, useRefreshedData } from "../../helpers/hooks";
import { getAllDocs } from "../../api/docs";
import Table from "./Table";
import AuditTrail from "./AuditTrail";
import "./docs.scss";
import { useHistory } from "react-router-dom";
import SearchIcon from "@material-ui/icons/Search";
import { useSnackbar } from "contexts/SnackbarContext";
import { DOC, DRAFT_STATUS, FRONTEND_URL } from "helpers/constant";
import { downloadFile } from "helpers/transformer";
import { useModal } from "contexts/ModalContext";

const Docs = () => {
  const { t } = useTranslation();
  const { handle_data_docs, docs, setDocs, getAuditTrail, auditTrails } =
    useData();
  const { addSnackbar } = useSnackbar();
  const query = useFormInput("");
  const { push } = useHistory();

  const { value: displayedDocs, set: setDisplayedDocs } = useRefreshedData(
    docs ?? []
  );
  const { openSendWhatsapp } = useModal();
  const [loading, setLoading] = useState(false);

  const activeDoc = useRefreshedData(false);

  const fetchingDocs = useCallback(async () => {
    if (!loading) {
      try {
        const res = await getAllDocs();
        if (res) {
          console.log(res);
          setDocs(res);
        }
      } catch (err) {
        addSnackbar(String(err));
      } finally {
        setLoading(true);
      }
    }
  }, [setDocs, addSnackbar, loading]);

  useEffect(() => {
    fetchingDocs();
  }, [fetchingDocs]);

  const handleClickingComponent = useCallback(
    (obj) => {
      // console.log(obj);
      const key = String(obj?.signType).toLowerCase();
      if (obj?.status === DRAFT_STATUS.COMPLETED) {
        downloadFile(obj?.linkToPdf, obj?.filename);
        return;
      }
      if (obj?.status === DRAFT_STATUS.OUT) {
        if (obj?.nextflow.length > 1) {
          // const people = obj?.nextflow[obj?.currentflow];
          const currentHost = window.location.host;
          const signUrl = `https://${currentHost}${FRONTEND_URL.document}/${obj?.uid}`;
          openSendWhatsapp({ finalUrl: signUrl });
          // openWA(
          //   people.email,
          //   people.name,
          //   t("popup.wa.template1"),
          //   t("popup.wa.template2")
          // );
        }
        return;
      }
      handle_data_docs(true, key, "fileData", obj);
      handle_data_docs(true, key, "placeFieldImages", []);
      handle_data_docs(true, key, "placeFieldFields", []);
      if (obj?.status === DRAFT_STATUS.WAITING) {
        window.open(`${FRONTEND_URL.document}/${obj?.uid}`);
        return;
      }
      // if (obj?.status !== DRAFT_STATUS.DRAFTING) return;
      if (key !== DOC.me) {
        if (obj?.nextflow && obj.nextflow?.length === 0) {
          push(`${key}#${0}`);
        }
        if (obj?.status === DRAFT_STATUS.DRAFTING) {
          push(`${key}#${2}`);
          return;
        }
        if (obj?.nextflow && obj.nextflow?.length > 0) {
          push(`${key}#${1}`);
        }
      }
      if (key === DOC.me) {
        if (obj?.status === DRAFT_STATUS.DRAFTING) {
          push(`${key}#${1}`);
          return;
        }
        if (obj?.nextflow && obj.nextflow?.length === 0) {
          push(`${key}#${0}`);
          return;
        }
        if (obj?.nextflow && obj.nextflow?.length > 0) {
          push(`${key}#${1}`);
        }
      }
    },
    [handle_data_docs, push, openSendWhatsapp]
  );

  const trimNow = useCallback(
    (trimmedQuery) => {
      let temp = docs?.filter((doc) =>
        String(doc?.filename)?.toLowerCase()?.includes(trimmedQuery)
      );
      setDisplayedDocs(temp);
    },
    [setDisplayedDocs, docs]
  );

  const displayAll = useCallback(() => {
    setDisplayedDocs(docs);
  }, [setDisplayedDocs, docs]);

  useEffect(() => {
    const trimmedQuery = String(query?.value).trim().toLowerCase();
    if (trimmedQuery.length > 1) trimNow(trimmedQuery);
    if (trimmedQuery.length === 0) displayAll();
  }, [query?.value, trimNow, displayAll]);

  return (
    <div className="docs mt-2">
      {/* <label class="formlabel">
          <span>{t("form.search")}</span>
        </label> */}
      {/* <div className="">
        <button className="btn btn-secondary" onClick={filterDocs}></button>
      </div> */}

      <div className="row">
        <div className="col col-lg-9 col-12">
          <div className="formarea">
            <input className="form-input search-bar" {...query} />
            <span className="search-bar-icon">
              <SearchIcon />
            </span>
          </div>
          <Table
            handleClickingComponent={handleClickingComponent}
            displayedDocs={displayedDocs}
            activeDoc={activeDoc}
            t={t}
            getAuditTrail={getAuditTrail}
          />
        </div>
        <div className="col col-lg-3 col-12 position-relative">
          <AuditTrail activeDoc={activeDoc} auditTrails={auditTrails} />
        </div>
      </div>
    </div>
  );
};

export default Docs;
