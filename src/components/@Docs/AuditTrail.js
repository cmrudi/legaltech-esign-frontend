import CustomizedTimeline from "components/commons/Timeline";
import { DRAFT_STATUS, FRONTEND_URL } from "helpers/constant";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const AuditTrail = ({ activeDoc, auditTrails }) => {
  const { t } = useTranslation();
  const auditData = useMemo(
    () => auditTrails[activeDoc?.value?.uid],
    [activeDoc, auditTrails]
  );

  const auditTrailLink = useMemo(() => {
    const currentHost = window.location.host;
    const auditTrailUrl = `http://${currentHost}${FRONTEND_URL.documentAuditTrail}/${activeDoc?.value?.uid}`;
    return auditTrailUrl;
    // window.open(auditTrailUrl);
  }, [activeDoc]);

  return (
    <div className="audit-trail">
      <div className="item-between">
        <strong className="">{t("docs.auditTrail.title")}</strong>
      </div>
      <div className="wrap-audit">
        <div className="pt-1 pb-2" style={{ fontSize: "0.8rem" }}>
          {activeDoc?.value?.status !== DRAFT_STATUS.COMPLETED ? (
            <span
              style={{
                fontWeight: "bolder",
                textDecoration: "unset",
                fontSize: "0.8rem",
              }}
            >
              {activeDoc?.value?.filename}
            </span>
          ) : (
            <a
              href={auditTrailLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
              style={{ fontWeight: "bolder", textDecoration: "unset" }}
            >
              {activeDoc?.value?.filename}
            </a>
          )}
        </div>
        <CustomizedTimeline data={auditData} />
        {/* <button className="btn btn-primary btn-sm">
            {t("general.view")}
          </button> */}
      </div>
    </div>
  );
};

export default AuditTrail;
