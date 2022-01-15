import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import "./index.scss";
// import { useModal } from "contexts/ModalContext";
import { useInput } from "helpers/hooks";
import OtpInput from "react-otp-input";

import { useAuth } from "contexts/AuthContext";
import { useSnackbar } from "contexts/SnackbarContext";
import { sendOTPDoc, verifyOTPDoc } from "api/docs";
import { useModal } from "contexts/ModalContext";
import { useData } from "contexts/DataContext";
import { FRONTEND_URL } from "helpers/constant";

const VerifySignature = (props) => {
  const {
    onClickCTA = () => {},
    body,
    fileUID,
    isAuth = false,
    sendOTPAuthWrapper = () => {},
    verifyOTPAuthWrapper = () => {},
    isSign = false,
  } = props;
  const { t } = useTranslation();
  const { openFasterThanPrinting } = useModal();
  const { auth } = useAuth();
  const [phone, setPhone] = useState("");
  const isSentPhone = useInput(false);
  // const otp = useOTP(6);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { addSnackbar } = useSnackbar();
  const [token, setToken] = useState("");
  const { setDocs, resetDataDocs } = useData();

  useEffect(() => {
    auth?.phone && setPhone(auth?.phone);
  }, [auth]);

  const sendOTPDocWrapper = async () => {
    try {
      setLoading(true);
      const res = await sendOTPDoc(fileUID, phone, body, isSign);
      if (res) {
        setToken(res.token);
        addSnackbar(t("popup.sign.verify.success1"), "success");
        isSentPhone?.set(true);
      }
    } catch (err) {
      addSnackbar(String(err));
    } finally {
      setLoading(!true);
    }
  };

  const verifyOTPDocWrapper = async () => {
    try {
      setLoading(true);
      const res = await verifyOTPDoc(fileUID, otp, token, isSign);
      if (res) {
        onClickCTA();
        addSnackbar(t("popup.sign.verify.success2"), "success");
        isSentPhone?.set(true);
        const currentHost = window.location.host;
        const signUrl = `https://${currentHost}${FRONTEND_URL.document}/${fileUID}`;

        if (!isSign) {
          openFasterThanPrinting({ finalUrl: signUrl });
          resetDataDocs();
          setDocs(false);
        }
      }
    } catch (err) {
      addSnackbar(String(err));
    } finally {
      setLoading(!true);
    }
  };

  // const verifyOTPWrap = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await verifyOTP();
  //     if (res) {
  //       setLoading(1);
  //       addSnackbar(t("popup.verify.success"), "success");
  //       isSentPhone?.set(true);
  //       setCanSend(true)
  //     }
  //   } catch (err) {
  //     addSnackbar(String(err));
  //   } finally {
  //     setLoading(!true);
  //   }
  // };

  useEffect(() => {
    console.log(otp);
  }, [otp]);

  return (
    <div className="verify-signature-container">
      <h5 className="head">{t("popup.sign.verify.head")}</h5>
      <div className="middle">
        <div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <button
            className={`btn btn-${
              isSentPhone?.value ? "light" : "success"
            } squared`}
            onClick={isAuth ? sendOTPAuthWrapper : sendOTPDocWrapper}
            disabled={isSentPhone?.value}
          >
            {isSentPhone?.value ? t("form.sent") : t("form.send")}
          </button>
        </div>
      </div>
      <div className="sec-mid">
        <div className="text">{t("popup.sign.verify.bacod")}</div>
        <div className="otp">
          <OtpInput
            value={otp}
            containerStyle={{ width: "100%", justifyContent: "space-between" }}
            onChange={(value) => setOtp(value)}
            numInputs={6}
            inputStyle={{
              // border: "0",
              fontSize: "1.5rem",
              width: "3rem",
              outline: "none",
              background: "initial",
              border: "1px solid black",
              borderRadius: "2px",
              padding: "0.5rem .5rem",
              margin: "0.5rem",
            }}
            separator={<></>}
          />
          {/* <OTPInput otp={otp} autoFocus={!false} /> */}
        </div>
        <div className="resend-button-area">
          <button
            className="btn btn-light squared"
            disabled={!phone}
            onClick={isAuth ? sendOTPAuthWrapper : sendOTPDocWrapper}
          >
            {t("popup.sign.verify.resend")}
          </button>
        </div>
      </div>
      <div className="button-below">
        <button
          className="btn btn-primary squared"
          disabled={loading || String(otp).length < 6}
          onClick={
            isAuth ? () => verifyOTPAuthWrapper(otp) : verifyOTPDocWrapper
          }
        >
          {t("general.submit")}
        </button>
      </div>
    </div>
  );
};

export default VerifySignature;
