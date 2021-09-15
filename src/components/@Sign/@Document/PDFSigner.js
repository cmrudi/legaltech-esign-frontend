import LoadingBackdrop from "components/commons/LoadingBackdrop";
import React, { Fragment, useState, useEffect } from "react";

import SignFieldBox, { QRCodeBox } from "./SignFieldBox";

export const INIT_FIELD_WIDTH = 100;
export const INIT_FIELD_HEIGHT = 50;

const Page = ({
  data,
  pageNum,
  playableFields,
  qrCodeComponent,
  setPageCount,
}) => {
  return (
    <div className="one-image-area">
      <div
        id={`one-sign-image-area-${pageNum}`}
        style={{ backgroundImage: `url(${data})` }}
        className="one-image"
      >
        <img
          src={data}
          alt=""
          className="invisible"
          onLoad={() => setPageCount((a) => a + 1)}
        />
        {playableFields}
        {qrCodeComponent}
      </div>
    </div>
  );
};

export const LeftArea = () => {
  return (
    <div className="left-sidebar position-fixed">
      <div className="container">
        <div className="row pt-2">
          <div style={{ display: "grid", placeItems: "center" }}>
            <div className="button">
              <button
                onClick={() => {}}
                className="btn-primary button-landing"
                style={{
                  borderRadius: "var(--border-radius)",
                }}
              >
                One click sign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PDFSigner = ({
  fields,
  fileData,
  fetchAllFields,
  setFields,
  placeFieldImages,
  isTheseFieldsSame,
}) => {
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    if (pageCount === placeFieldImages.length && pageCount !== 0)
      fetchAllFields();
  }, [pageCount, placeFieldImages, fetchAllFields]);

  const {
    filename: fileName = "",
    qrcode: qrCodePosition = 2,
    qrcodeImg: qrCodeImg,
  } = fileData;

  useEffect(() => {
    console.table(fields);
  }, [fields]);

  return (
    <div id="main-workspace">
      <div className="fu-wrapper">
        <div className="wrap-again">
          {placeFieldImages && placeFieldImages?.length > 0 ? (
            placeFieldImages?.map((data, i) => {
              const playableFields = fields
                ? fields
                    ?.filter(
                      (field) => field.pageNum === i + 1 && field.editable
                    )
                    .map((field, j) => {
                      return (
                        <SignFieldBox
                          field={field}
                          isTheseFieldsSame={isTheseFieldsSame}
                          key={j}
                          fields={fields}
                          setFields={setFields}
                        />
                      );
                    })
                : [];

              const QRCode = () => (
                <QRCodeBox
                  qrCodeImg={qrCodeImg}
                  qrPosition={qrCodePosition}
                  pageNum={i + 1}
                />
              );

              return (
                <Fragment key={i}>
                  <Page
                    data={data}
                    pageNum={i + 1}
                    setPageCount={setPageCount}
                    playableFields={playableFields}
                    qrCodeComponent={<QRCode />}
                  />
                  <div className="one-image-meta-info">
                    <span>{fileName}</span>
                    <span>
                      Page {i + 1} of {placeFieldImages?.length}
                    </span>
                  </div>
                </Fragment>
              );
            })
          ) : (
            <LoadingBackdrop />
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFSigner;
