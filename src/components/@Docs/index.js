import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../contexts/DataContext";
import { useFormInput, useRefreshedData } from "../../helpers/hooks";
import { getAllDocs } from "../../api/auth";
import Snackbar from "../commons/Snackbar";
import searchIcon from "../../assets/bnw/Search Icon.svg";
import Table from "./Table";
import AuditTrail from "./AuditTrail";
import "./docs.css";
import { useHistory } from "react-router-dom";
import { FRONTEND_URL } from "../../helpers/constant";

const Docs = () => {
  const { t } = useTranslation();
  const { handle_data_docs, docs, setDocs } = useData();
  const query = useFormInput("");
  const [error, setError] = useState(false);
  const history = useHistory();

  const { value: displayedDocs, set: setDisplayedDocs } = useRefreshedData(
    docs ?? []
  );
  // const setDisplayedDocs = displayedDocs.set;
  const activeDoc = useRefreshedData(false);

  const fetchingDocs = useCallback(async () => {
    if (!docs) {
      try {
        const res = await getAllDocs();
        if (res) {
          setDocs(res);
        }
      } catch (err) {
        setError(String(err));
        setTimeout(() => setError(false), 3000);
      }
    }
  }, [setDocs, docs]);

  useEffect(() => {
    console.log(displayedDocs);
  }, [displayedDocs]);

  useEffect(() => {
    fetchingDocs();
  }, [fetchingDocs]);

  const handleClickingComponent = useCallback(
    (obj) => {
      const key = String(obj?.signType).toLowerCase();
      // dis only for testing

      if (obj?.nextflow && obj.nextflow?.length === 0) {
        handle_data_docs(true, key, "fileData", obj);
        history.push(`${FRONTEND_URL.signing}?for=${key}`);
        //   history.push(`${key}`);
      } else {
        //   history.push(`${FRONTEND_URL.signing}?for=${key}`);
      }
    },
    [handle_data_docs, history]
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
    const trimmedQuery = String(query?.value).trim();
    if (trimmedQuery.length > 1) trimNow(trimmedQuery);
    if (trimmedQuery.length === 0) displayAll();
  }, [query?.value, trimNow, displayAll]);

  // console.log(displayedDocs);
  return (
    <div className="docs mt-2">
      {error && <Snackbar text={error} />}

      {/* <label class="formlabel">
          <span>{t("form.search")}</span>
        </label> */}
      {/* <div className="">
        <button className="btn btn-secondary" onClick={filterDocs}></button>
      </div> */}

      <div className="row">
        <div className="col col-lg-8 col-12">
          <div className="formarea">
            <input className="form-input search-bar" {...query} />
            <span className="search-bar-icon">
              <img src={searchIcon} alt="" />
            </span>
          </div>
          <Table
            handleClickingComponent={handleClickingComponent}
            displayedDocs={displayedDocs}
            activeDoc={activeDoc}
            t={t}
          />
        </div>
        <div className="col col-lg-4 col-12">
          <AuditTrail activeDoc={activeDoc} />
        </div>
      </div>
    </div>
  );
};

export default Docs;
