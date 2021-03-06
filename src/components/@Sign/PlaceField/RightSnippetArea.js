import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import Switch from "@material-ui/core/Switch";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ArrowDropDownRounded";
import DeleteIcon from "@material-ui/icons/DeleteRounded";
// import SwitchCameraIcon from "@material-ui/icons/SwitchCamera";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "90%",
    background: "white",
    "& .MuiAccordion-root:before": {
      height: "0",
    },
    "& .MuiAccordion-root.Mui-expanded": {
      margin: 0,
    },
    "& .MuiAccordionSummary-root.Mui-expanded": {
      minHeight: 48,
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: 0,
    },
    "& .MuiAccordionSummary-content": {
      display: "unset",
    },
  },
  heading: {
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  base: {
    boxShadow: "none",
    padding: "0 15px",
    "& .MuiAccordionSummary-root": {
      padding: 0,
    },
    "& .MuiAccordionDetails-root": {
      padding: "0 0 1rem 0",
    },
  },
}));

const ControlledAccordions = ({
  currentField,
  t,
  setFields,
  fields,
  isTheSelectedFieldSameAsThisField,
  setCurrentField,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Accordion expanded square className={classes.base}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>
            {t("sign.placeFields.right.assignedTo")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {currentField && (
            <input
              value={currentField?.signer?.label}
              disabled
              className="w-100"
            />
          )}
        </AccordionDetails>
      </Accordion>
      <hr />
      <Accordion expanded square className={classes.base}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>
            {t("sign.placeFields.right.required")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>{t("sign.placeFields.right.requiredField")}</div>
            <div>
              <Switch
                checked={currentField?.required}
                disabled={!currentField}
                color="primary"
                onChange={(e) => {
                  let temp = fields;
                  let ax = temp.map((oneField) => {
                    return {
                      ...oneField,
                      required: !isTheSelectedFieldSameAsThisField(oneField)
                        ? oneField.required
                        : ["initial", "signature"].includes(
                            String(currentField?.type).toLowerCase()
                          )
                        ? true
                        : e.target.checked,
                    };
                  });
                  setFields(ax);
                  setCurrentField((field) => {
                    return {
                      ...field,
                      required: ["initial", "signature"].includes(
                        String(currentField?.type).toLowerCase()
                      )
                        ? true
                        : e.target.checked,
                    };
                  });
                }}
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      <hr />
      {["date", "name", "email", "company", "title"].includes(
        String(currentField.type).toLowerCase()
      ) && (
        <>
          <Accordion expanded square className={classes.base}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={classes.heading}>
                {t("sign.placeFields.right.formatting")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {currentField && (
                <>
                  <select
                    value={currentField?.formatting?.size}
                    onChange={(e) => {
                      let temp = fields;
                      let ax = temp.map((oneField) => {
                        return {
                          ...oneField,
                          formatting: {
                            ...oneField.formatting,
                            size: isTheSelectedFieldSameAsThisField(oneField)
                              ? parseInt(e.target.value)
                              : oneField?.formatting?.size,
                          },
                        };
                      });
                      setFields(ax);
                      setCurrentField((field) => {
                        return {
                          ...field,
                          formatting: {
                            font: field.formatting.font,
                            size: parseInt(e.target.value),
                          },
                        };
                      });
                    }}
                    className="w-100"
                  >
                    {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(
                      (a) => (
                        <option value={a} key={a}>
                          {a}
                        </option>
                      )
                    )}
                  </select>
                  <select
                    value={currentField?.formatting?.font}
                    onChange={(e) => {
                      let temp = fields;
                      let ax = temp.map((oneField) => {
                        return {
                          ...oneField,
                          formatting: {
                            ...oneField.formatting,
                            font: isTheSelectedFieldSameAsThisField(oneField)
                              ? e.target.value
                              : oneField?.formatting?.font,
                          },
                        };
                      });
                      setFields(ax);
                      setCurrentField((field) => {
                        return {
                          ...field,
                          formatting: {
                            font: e.target.value,
                            size: field.formatting.size,
                          },
                        };
                      });
                    }}
                    className="w-100"
                  >
                    {["Arial", "Times New Roman", "Helvetica"].map((a) => (
                      <option value={a} key={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </AccordionDetails>
          </Accordion>
          <hr />
        </>
      )}
      <Accordion expanded square className={classes.base}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>
            {t("sign.placeFields.right.fieldName")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {currentField && currentField !== null && (
            <input
              value={currentField?.fieldname}
              onChange={(e) => {
                let temp = fields;
                let ax = temp.map((oneField) => {
                  return {
                    ...oneField,
                    fieldname: isTheSelectedFieldSameAsThisField(oneField)
                      ? e.target.value
                      : oneField.fieldname,
                  };
                });
                setFields(ax);
                setCurrentField((field) => {
                  return { ...field, fieldname: e.target.value };
                });
              }}
              className="w-100"
            />
          )}
        </AccordionDetails>
      </Accordion>
      <hr />
      {/* <Accordion expanded square className={classes.base}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>
            {t("sign.placeFields.right.value")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {currentField && (
            <input
              value={currentField?.value}
              onChange={(e) => {
                let temp = fields;
                let ax = temp.map((oneField) => {
                  return {
                    ...oneField,
                    value: isTheSelectedFieldSameAsThisField(oneField)
                      ? e.target.value
                      : oneField?.value,
                  };
                });
                setFields(ax);
                setCurrentField((field) => {
                  return { ...field, value: e.target.value };
                });
              }}
              className="w-100"
            />
          )}
        </AccordionDetails>
      </Accordion> */}
    </div>
  );
};

const RightSnippetArea = ({
  setCurrentField,
  currentField,
  onDelete,
  setFields,
  fields,
  placeFieldImages,
  fileName,
  scrollToPage,
  setIsShow,
  isTheSelectedFieldSameAsThisField,
  isShow,
  visibility,
}) => {
  const { t } = useTranslation();

  const [temp, setTemp] = useState(1);

  useEffect(() => {
    setTemp(visibility);
  }, [visibility]);

  const DefaultComponent = () => (
    <div className="position-relative">
      <div
        className="pt-2 d-flex justify-content-between align-items-center weird wrapper"
        onClick={() => (currentField ? setIsShow((a) => !a) : setIsShow(true))}
      >
        <div className="lead font-weight-bolder">
          {t("sign.placeFields.right.documents")}
        </div>
      </div>
      <div className="document-show-container">
        <div className="text-center mb-2">{fileName}</div>
        {placeFieldImages?.length > 0
          ? placeFieldImages?.map((image, i) => (
              <div
                key={i}
                className="one-right-place-field-image"
                onClick={() => scrollToPage(i + 1, "start")}
              >
                <img src={image} alt={`Page ${i + 1}`} />
                <div className="bottom-page">Page {i + 1}</div>
              </div>
            ))
          : []}
      </div>
      <div className="fix-below-button">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            scrollToPage(placeFieldImages?.length, "start");
            setTemp(placeFieldImages?.length);
          }}
        >
          {t("sign.placeFields.right.lastPage")}
        </button>
        <span>
          <select
            onChange={(e) => {
              setTemp(e.target.value);
              scrollToPage(e.target.value, "start");
            }}
            value={temp}
          >
            {placeFieldImages?.length > 0 &&
              placeFieldImages?.map((_, i) => (
                <option value={i + 1} key={i}>
                  {i + 1}
                </option>
              ))}
          </select>
          <span>of {placeFieldImages?.length ?? 0} pages</span>
        </span>
      </div>
    </div>
  );

  return (
    <div className="right-sidebar position-fixed">
      {currentField && !isShow ? (
        <>
          <div
            className=""
            onClick={() =>
              currentField ? setIsShow((a) => !a) : setIsShow(true)
            }
          >
            <div className="pt-2 d-flex justify-content-between align-items-center weird wrapper">
              <div className="lead font-weight-bolder">
                {t("sign.placeFields.right.signature")}
              </div>
              {currentField && (
                <div onClick={onDelete}>
                  <DeleteIcon />
                </div>
              )}
              {/* <div onClick={() => setShow((a) => !a)}>
                <SwitchCameraIcon />
              </div> */}
            </div>
          </div>
          <ControlledAccordions
            setCurrentField={setCurrentField}
            currentField={currentField}
            isTheSelectedFieldSameAsThisField={
              isTheSelectedFieldSameAsThisField
            }
            t={t}
            setFields={setFields}
            fields={fields}
          />
        </>
      ) : (
        <DefaultComponent />
      )}
    </div>
  );
};

export default RightSnippetArea;
