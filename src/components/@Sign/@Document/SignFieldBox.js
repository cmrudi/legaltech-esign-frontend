import React, { useRef, useMemo } from "react";
import { Rnd } from "react-rnd";
import { useAuth } from "contexts/AuthContext";
import { useModal } from "contexts/ModalContext";
import { getReadableFieldIcon } from "../PlaceField/FieldBox";

const FieldHandle = ({ color, stroke }) => {
  return (
    <svg
      height="10pt"
      width="10pt"
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="3"
        cy="3"
        r="3"
        stroke={stroke}
        strokeWidth="0.1"
        fill={color}
      />
    </svg>
  );
};

const SignFieldBox = ({
  field,
  fields,
  isTheseFieldsSame,
  setFields,
  getValue,
}) => {
  const { auth } = useAuth();
  const { openSignatureModal, show } = useModal();
  // const [isEditing, setIsEditing] = useState(false);

  const initial_image_url = useMemo(
    () => auth?.initial_finished_url ?? "",
    [auth]
  );
  const signature_image_url = useMemo(
    () => auth?.signature_finished_url ?? "",
    [auth]
  );

  const handle = (
    <FieldHandle
      color={field?.signer?.color ?? ""}
      stroke={field?.signer?.color ?? ""}
    />
  );

  const sampleRef = useRef(null);
  sampleRef?.current?.updatePosition({
    x: field.x * field.pagePosition.width,
    y: field.y * field.pagePosition.height,
  });
  sampleRef?.current?.updateSize({
    width: field.w * field.pagePosition.width,
    height: field.h * field.pagePosition.height,
  });

  const fieldElement = useMemo(() => getReadableFieldIcon(field), [field]);
  const minHeight = useMemo(() => {
    const size = field?.formatting?.size;
    if (!size) return `calc(1rem + 2px)`;
    return `${field?.formatting?.size + 6}px`;
  }, [field]);

  return (
    <Rnd
      ref={sampleRef}
      bounds="parent"
      resizeHandleComponent={{
        topLeft: handle,
        topRight: handle,
        bottomLeft: handle,
        bottomRight: handle,
      }}
      disableDragging={true}
      default={{
        x: field.x * field.pagePosition.width,
        y: field.y * field.pagePosition.height,
        width: field.w * field.pagePosition.width,
        height: field.h * field.pagePosition.height,
      }}
      enableResizing={{
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false,
      }}
      onResizeStop={() => {
        return;
      }}
      onDragStop={() => {
        return;
      }}
      minHeight={minHeight}
      style={{ border: 0, zIndex: 888, minHeight: "1rem" }}
      className="draggable-item"
    >
      <span
        className="rnd-content"
        id={`sign-field-${field?.uuid}`}
        onDoubleClick={() => {
          if (auth?.email === field?.signer?.email) {
            if (
              ["signature", "initial"].includes(
                String(field?.type).toLowerCase()
              )
            ) {
              if (
                (!signature_image_url &&
                  String(field?.type).toLowerCase() === "signature") ||
                (!initial_image_url &&
                  String(field?.type).toLowerCase() === "initial")
              ) {
                openSignatureModal({
                  isInitial: String(field?.type).toLowerCase() === "initial",
                  extraCallback: () => {
                    show.set(false);
                    let temp = fields;
                    let ax = temp.map((oneField) => {
                      return {
                        ...oneField,
                        value: !isTheseFieldsSame(oneField, field)
                          ? oneField?.value
                          : String(field?.type).toLowerCase() === "initial"
                          ? initial_image_url
                          : signature_image_url,
                      };
                    });
                    setFields(ax);
                  },
                });
              } else {
                let temp = fields;
                let ax = temp.map((oneField) => {
                  return {
                    ...oneField,
                    isEditing: isTheseFieldsSame(oneField, field)
                      ? true
                      : oneField.isEditing,
                    value: isTheseFieldsSame(oneField, field)
                      ? getValue(String(field?.type).toLowerCase())
                      : oneField.value,
                  };
                });
                setFields(ax);
              }
            } else {
              let temp = fields;
              let ax = temp.map((oneField) => {
                return {
                  ...oneField,
                  isEditing: isTheseFieldsSame(oneField, field)
                    ? true
                    : oneField.isEditing,
                  value: isTheseFieldsSame(oneField, field)
                    ? getValue(String(field?.type).toLowerCase())
                    : oneField.value,
                };
              });
              setFields(ax);
            }
          }
        }}
        style={{
          backgroundColor: field?.isEditing
            ? "transparent"
            : field?.signer?.backgroundColor,
          color: "white",
          minHeight,
        }}
      >
        {!field?.isEditing && (
          <span className="text-uppercase">
            {fieldElement} {field.type}
          </span>
        )}
        {field?.isEditing &&
          !["initial", "signature"].includes(
            String(field?.type).toLowerCase()
          ) && (
            <div className="full-field-box" style={{ minHeight }}>
              <input
                value={field?.value}
                disabled={
                  ["date"].includes(String(field?.type).toLowerCase()) ||
                  !field?.editable
                }
                style={{
                  fontSize: field?.formatting?.size,
                  fontFamily: field?.formatting?.font,
                  border: 0,
                  background: "transparent",
                  minHeight: field?.formatting?.size ?? "1rem",
                }}
                onChange={(e) => {
                  let temp = fields;
                  let ax = temp.map((oneField) => {
                    return {
                      ...oneField,
                      value: isTheseFieldsSame(oneField, field)
                        ? e.target.value
                        : oneField?.value,
                    };
                  });
                  setFields(ax);
                }}
              />
            </div>
          )}
        {field?.isEditing && String(field?.type).toLowerCase() === "signature" && (
          <span className="img-fit-all">
            <img src={signature_image_url} alt="" />
          </span>
        )}
        {field?.isEditing && String(field?.type).toLowerCase() === "initial" && (
          <span className="img-fit-all">
            <img src={initial_image_url} alt="" />
          </span>
        )}
      </span>
    </Rnd>
  );
};

// const QR_CODE_RELATIVE_SIZE = 0.1;
// const INIT_FIELD_WIDTH = 100;

// export const QRCodeBox = ({ qrCodeImg, qrPosition, pageNum }) => {
//   const divPosition = document
//     .getElementById(`one-image-area-${pageNum}`)
//     ?.getBoundingClientRect();
//   const size = QR_CODE_RELATIVE_SIZE * divPosition?.width ?? INIT_FIELD_WIDTH;

//   const offsetLeftPercentage = [1, 4].includes(qrPosition)
//     ? 0.02
//     : 0.98 - QR_CODE_RELATIVE_SIZE;
//   const offsetTop = [1, 2].includes(qrPosition)
//     ? 0.015 * divPosition?.height ?? 0
//     : 0.985 * divPosition?.height - size;

//   return (
//     <img
//       src={qrCodeImg}
//       alt="qrcode"
//       style={{
//         width: isNaN(size) ? INIT_FIELD_WIDTH : size,
//         height: isNaN(size) ? INIT_FIELD_WIDTH : size,
//         position: "absolute",
//         left: isNaN(offsetLeftPercentage * divPosition?.width)
//           ? 0
//           : offsetLeftPercentage * divPosition?.width,
//         top: isNaN(offsetTop) ? 0 : offsetTop,
//       }}
//     />
//   );
// };

export default SignFieldBox;
