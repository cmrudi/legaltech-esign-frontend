import React, { useRef, useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { navigate } from "@reach/router";
// import { selectDocToView } from "./ViewDocumentSlice";
// import { storage } from '../../firebase/firebase';
import WebViewer, { Annotations } from "@pdftron/webviewer";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import "./placefield.css";

const temp =
  "https://storage.googleapis.com/legaltech-esign-develop/develop/doc/aisc_jones_napoleon_pdf1624197842048";

const PlaceField = ({
  activeItem,
  setActiveItem,
  // availableLevel,
  setAvailableLevel,
  atr,
}) => {
  const [instance, setInstance] = useState(null);
  const { auth } = useAuth();

  // JOJO
  const [dropPoint, setDropPoint] = useState(null);

  const { handle_data_docs, getItemData } = useData();
  const fileData = getItemData(atr, "fileData");
  var assignees = getItemData(atr, "signers");

  // !!TODO DELETE kalo udah nambahin di /me
  assignees.push({
    email: "jonathanyudigun@gmail.com",
    name: "Jojo",
    flowtype: "SIGN",
  });
  const assigneesValues = assignees.map((user) => ({
    value: user.email,
    label: user.name,
  }));
  let initialAssignee =
    assigneesValues.length > 0 ? assigneesValues[0] : { value: "", label: "" };
  const [assignee, setAssignee] = useState(initialAssignee);
  // END JOJO

  const viewer = useRef(null);

  useEffect(() => {
    if ((typeof fileData?.linkToPdf === "string" && auth?.id_token) || temp)
      WebViewer(
        {
          path: "webviewer",
          disabledElements: ["ribbons", "toggleNotesButton"],
        },
        viewer.current
      ).then(async (instance) => {
        instance.loadDocument(fileData?.linkToPdf ?? temp, {
          filename: fileData?.filename,
        });
        instance.setToolbarGroup("toolbarGroup-View");
        setInstance(instance);

        // JOJO
        const { iframeWindow } = instance;
        const iframeDoc = iframeWindow.document.body;
        iframeDoc.addEventListener("dragover", dragOver);
        iframeDoc.addEventListener("drop", (e) => {
          drop(e, instance);
        });
        // END JOJO
      });
  }, [fileData, auth?.id_token]);

  // const download = () => {
  //   instance.downloadPdf(true);
  // };

  // const doneViewing = async () => {
  //   console.log("d");
  // };

  // JOJO
  const dragOver = (e) => {
    e.preventDefault();
    return false;
  };

  const drop = (e, instance) => {
    const { docViewer = false } = instance;
    const scrollElement = docViewer?.getScrollViewElement();
    const scrollLeft = scrollElement.scrollLeft || 0;
    const scrollTop = scrollElement.scrollTop || 0;
    setDropPoint({ x: e.pageX + scrollLeft, y: e.pageY + scrollTop });
    e.preventDefault();
    return false;
  };

  const dragStart = (e) => {
    e.target.style.opacity = 0.5;
    const copy = e.target.cloneNode(true);
    copy.id = "form-build-drag-image-copy";
    copy.style.width = "250px";
    document.body.appendChild(copy);
    e.dataTransfer.setDragImage(copy, 125, 25);
    e.dataTransfer.setData("text", "");
  };

  const dragEnd = (e, type) => {
    addField(type, dropPoint);
    e.target.style.opacity = 1;
    document.body.removeChild(
      document.getElementById("form-build-drag-image-copy")
    );
    e.preventDefault();
  };

  useEffect(() => {
    console.log("assi", assignee);
  }, [assignee]);

  const addField = (type, autoFill = false, point = {}, value) => {
    const { docViewer, Annotations } = instance;
    const annotManager = docViewer.getAnnotationManager();
    const doc = docViewer.getDocument();
    const displayMode = docViewer.getDisplayModeManager().getDisplayMode();
    const page = displayMode.getSelectedPages(point, point);
    if (!!point?.x && page.first == null) return; //don't add field to an invalid page location

    const page_idx =
      page.first !== null ? page.first : docViewer.getCurrentPage();
    const page_info = doc.getPageInfo(page_idx);
    const page_point = displayMode.windowToPage(point, page_idx);
    const zoom = docViewer.getZoom();

    var textAnnot = new Annotations.FreeTextAnnotation();
    textAnnot.PageNumber = page_idx;
    const rotation = docViewer.getCompleteRotation(page_idx) * 90;
    textAnnot.Rotation = rotation;
    if (rotation === 270 || rotation === 90) {
      textAnnot.Width = 50.0 / zoom;
      textAnnot.Height = 250.0 / zoom;
    } else {
      textAnnot.Width = 250.0 / zoom;
      textAnnot.Height = 50.0 / zoom;
    }
    textAnnot.X = (page_point.x || page_info.width / 2) - textAnnot.Width / 2;
    textAnnot.Y = (page_point.y || page_info.height / 2) - textAnnot.Height / 2;

    textAnnot.setPadding(new Annotations.Rect(0, 0, 0, 0));
    // TODO default field placeholder

    var defaultValue = value ?? `${assignee.value} ${type}`;
    textAnnot.custom = {
      id: null,
      type,
      value: defaultValue,
      autoFill,
    };

    // set the type of annot
    textAnnot.setContents(textAnnot.custom.value);
    textAnnot.FontSize = "" + 16.0 / zoom + "px";
    textAnnot.FillColor = new Annotations.Color(211, 211, 211, 0.5);
    textAnnot.TextColor = new Annotations.Color(0, 165, 228);
    textAnnot.StrokeThickness = 1;
    textAnnot.StrokeColor = new Annotations.Color(0, 165, 228);
    textAnnot.TextAlign = "center";

    textAnnot.Author = annotManager.getCurrentUser();

    annotManager.deselectAllAnnotations();
    annotManager.addAnnotation(textAnnot, true);
    annotManager.redrawAnnotation(textAnnot);
    annotManager.selectAnnotation(textAnnot);
  };

  const applyFields = async () => {
    // TODO pindahin ke ReviewSend.js
    const { Annotations, docViewer } = instance;
    const annotManager = docViewer.getAnnotationManager();
    const fieldManager = annotManager.getFieldManager();
    const annotationsList = annotManager.getAnnotationsList();
    const annotsToDelete = [];
    const annotsToDraw = [];

    await Promise.all(
      annotationsList.map(async (annot, index) => {
        let inputAnnot;
        let field;
        if (typeof annot.custom === "undefined") return;

        // create a form field based on the type of annotation
        if (annot.custom.type === "SIGNATURE") {
          field = new Annotations.Forms.Field(
            annot.getContents() + Date.now() + index,
            {
              type: "Sig",
            }
          );
          inputAnnot = new Annotations.SignatureWidgetAnnotation(field, {
            appearance: "_DEFAULT",
            appearances: {
              _DEFAULT: {
                Normal: {
                  data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuMWMqnEsAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC",
                  offset: {
                    x: 100,
                    y: 100,
                  },
                },
              },
            },
          });
        } else if (annot.custom.type === "DATE") {
          field = new Annotations.Forms.Field(
            annot.getContents() + Date.now() + index,
            {
              type: "Tx",
              value: "d-m-yyyy",
              // Actions need to be added for DatePickerWidgetAnnotation to recognize this field.
              actions: {
                F: [
                  {
                    name: "JavaScript",
                    // You can customize the date format here between the two double-quotation marks
                    // or leave this blank to use the default format
                    javascript: 'AFDate_FormatEx("dd-mm-yyyy");', // TODO change date format if needed
                  },
                ],
                K: [
                  {
                    name: "JavaScript",
                    // You can customize the date format here between the two double-quotation marks
                    // or leave this blank to use the default format
                    javascript: 'AFDate_FormatEx("dd-mm-yyyy");', // TODO change date format if needed
                  },
                ],
              },
            }
          );

          inputAnnot = new Annotations.DatePickerWidgetAnnotation(field);
        } else if (annot.custom.type === "CHECKBOX") {
          field = new Annotations.Forms.Field(
            annot.getContents() + Date.now() + index,
            {
              type: "Tx",
              value: annot.custom.value,
            }
          );
          inputAnnot = new Annotations.CheckButtonWidgetAnnotation(field);
        } else {
          field = new Annotations.Forms.Field(
            annot.getContents() + Date.now() + index,
            {
              type: "Tx",
              value: annot.custom.value,
            }
          );
          inputAnnot = new Annotations.TextWidgetAnnotation(field);
        }

        // set position
        inputAnnot.PageNumber = annot.getPageNumber();
        inputAnnot.X = annot.getX();
        inputAnnot.Y = annot.getY();
        inputAnnot.rotation = annot.Rotation;
        if (annot.Rotation === 0 || annot.Rotation === 180) {
          inputAnnot.Width = annot.getWidth();
          inputAnnot.Height = annot.getHeight();
        } else {
          inputAnnot.Width = annot.getHeight();
          inputAnnot.Height = annot.getWidth();
        }
        inputAnnot.setCustomData("type", annot.custom.type);
        inputAnnot.setCustomData("autoFill", annot.custom.autoFill);

        // delete original annotation
        annotsToDelete.push(annot);

        // customize styles of the form field
        Annotations.WidgetAnnotation.getCustomStyles = function (widget) {
          if (widget instanceof Annotations.SignatureWidgetAnnotation) {
            return {
              border: "1px solid #a5c7ff",
            };
          }
        };
        Annotations.WidgetAnnotation.getCustomStyles(inputAnnot);

        // draw the annotation the viewer
        annotManager.addAnnotation(inputAnnot);
        fieldManager.addField(field);
        annotsToDraw.push(inputAnnot);
      })
    );

    // delete old annotations
    annotManager.deleteAnnotations(annotsToDelete, null, true);

    // refresh viewer
    await annotManager.drawAnnotationsFromList(annotsToDraw);

    // TODO tembak BE update document: PUT /api/doc/:docid?fileName=&signType=
  };
  // END JOJO

  const ConferArea = ({ data }) => (
    <div className="px-2 py-1">
      <div
        draggable
        onDragStart={(e) => dragStart(e)}
        onDragEnd={(e) => dragEnd(e, data[0])}
      >
        <button
          className="button-placefields"
          onClick={() => addField(data[0], false)}
        >
          {data[0]}
        </button>
      </div>
    </div>
  );

  return (
    <div className={"place-field-area"}>
      <div className="row">
        <div className="col-lg-3 col-md-12 left-sidebar">
          <div className="container">
            <div className="row pt-2">
              <div className="lead">Signers</div>
              <select value={assignee} onChange={(val) => setAssignee(val)}>
                {assigneesValues &&
                  assigneesValues?.map((assignee, i) => (
                    <option key={i} value={assignee} data-before={"red"}>
                      {assignee.label}
                    </option>
                  ))}
              </select>

              <div className="lead">Signature fields</div>
              {[["SIGNATURE"], ["INITIAL"]]?.map((data, i) => (
                <ConferArea data={data} key={i} />
              ))}

              <div className="lead">Auto-fill fields</div>
              {[["DATE"], ["NAME"], ["EMAIL"], ["COMPANY"], ["TITLE"]]?.map(
                (data, i) => (
                  <ConferArea key={i} data={data} />
                )
              )}

              <div className="lead">Standard fields</div>
              {[["TEXT"], ["CHECKBOX"]]?.map((data, i) => (
                <ConferArea key={i} data={data} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-9 col-md-12">
          <div className="webviewer" ref={viewer}></div>
        </div>
      </div>
    </div>
  );
};

export default PlaceField;
