import React from "react";
import { useTranslation } from "react-i18next";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";

import "./index.scss";
import { useModal } from "contexts/ModalContext";
import { useFormInput } from "helpers/hooks";

const FasterThanPrinting = () => {
  const { t } = useTranslation();
  const { setInnerComponent, show, showIcon, size, bg } = useModal();

  return (
    <div className="faster-than-printing-container">
      <h5 className="head">{t("popup.wa.fasterThan")}</h5>
      <div className="desc">
        <div>{t("popup.wa.docsBeenSent")}</div>
        <div>{t("popup.wa.checkTheStatus")}</div>
      </div>
      <hr />
      <div className="desc">
        <div>{t("popup.wa.easyReq")}</div>
      </div>
      <div>
        <button
          className="send-wa"
          onClick={() => {
            setInnerComponent(<SendWhatsapp />);
            // setInnerComponent(<SignatureModal />);
            size?.set("unset");
            bg?.set("light");
            show?.set(true);
            showIcon?.set(true);
          }}
        >
          <WhatsAppIcon className="success-color" />

          <span>{t("popup.wa.sendViaWA")}</span>
        </button>
      </div>
    </div>
  );
};

export default FasterThanPrinting;

export const SendWhatsapp = () => {
  const { t } = useTranslation();
  const name = useFormInput("");
  const wa = useFormInput("");

  return (
    <div className="send-whatsapp-container">
      <div className="top">{t("popup.wa.sendFaster")}</div>
      <div className="input-area d-flex justify-content-between align-items-center">
        <input {...name} />
        <input {...wa} />
      </div>
      <div className="bottom-text-area">
        <span className="">
          <WhatsAppIcon />
        </span>
        <span className="mx-2">
          {t("popup.wa.template1")} {name?.value}
          {t("popup.wa.template2")} {wa?.value}
        </span>
      </div>
      <div className="mt-5 item-right">
        <button className="btn btn-black squared">{t("general.send")}</button>
      </div>
    </div>
  );
};