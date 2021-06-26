import React, { useRef, useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { navigate } from "@reach/router";
// import { selectDocToView } from "./ViewDocumentSlice";
// import { storage } from '../../firebase/firebase';
import WebViewer, { Annotations } from "@pdftron/webviewer";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import "./placefield.css";

// JOJO
import {
  Box,
  Button,
  SelectList,
} from 'gestalt';
import 'gestalt/dist/gestalt.css';
// END JOJO

const temp = "https://storage.googleapis.com/legaltech-esign-develop/develop/doc/aisc_jones_napoleon_pdf1624197842048";

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
  assignees.push({ email: "jonathanyudigun@gmail.com", name: "Jojo", flowtype: "SIGN" });
  const assigneesValues = assignees.map(user => ({ value: user.email, label: user.name }));
  let initialAssignee = assigneesValues.length > 0 ? assigneesValues[0].value : '';
  const [assignee, setAssignee] = useState(initialAssignee);
  // END JOJO

  const viewer = useRef(null);

  console.log(fileData);

  useEffect(() => {
    if ((typeof fileData?.linkToPdf === "string" && auth?.id_token) || temp)
      WebViewer(
        {
          path: "webviewer",
          disabledElements: [
            "ribbons",
            "toggleNotesButton"
          ],
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
        iframeDoc.addEventListener('dragover', dragOver);
        iframeDoc.addEventListener('drop', e => {
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
  const dragOver = e => {
    e.preventDefault();
    return false;
  };

  const drop = (e, instance) => {
    const { docViewer } = instance;
    const scrollElement = docViewer.getScrollViewElement();
    const scrollLeft = scrollElement.scrollLeft || 0;
    const scrollTop = scrollElement.scrollTop || 0;
    setDropPoint({ x: e.pageX + scrollLeft, y: e.pageY + scrollTop });
    e.preventDefault();
    return false;
  };

  const dragStart = e => {
    e.target.style.opacity = 0.5;
    const copy = e.target.cloneNode(true);
    copy.id = 'form-build-drag-image-copy';
    copy.style.width = '250px';
    document.body.appendChild(copy);
    e.dataTransfer.setDragImage(copy, 125, 25);
    e.dataTransfer.setData('text', '');
  };

  const dragEnd = (e, type) => {
    addField(type, dropPoint);
    e.target.style.opacity = 1;
    document.body.removeChild(
      document.getElementById('form-build-drag-image-copy'),
    );
    e.preventDefault();
  };

  const addField = (type, autoFill = false, point = {}, value) => {
    const { docViewer, Annotations } = instance;
    const annotManager = docViewer.getAnnotationManager();
    const doc = docViewer.getDocument();
    const displayMode = docViewer.getDisplayModeManager().getDisplayMode();
    const page = displayMode.getSelectedPages(point, point);
    if (!!point.x && page.first == null) return  //don't add field to an invalid page location

    const page_idx = page.first !== null ? page.first : docViewer.getCurrentPage();
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
    var defaultValue = value ?? `${assignee}_${type}_`; 
    textAnnot.custom = {
      id: null,
      type,
      value: defaultValue,
      autoFill,
    };

    // set the type of annot
    textAnnot.setContents(textAnnot.custom.value);
    textAnnot.FontSize = '' + 20.0 / zoom + 'px';
    textAnnot.FillColor = new Annotations.Color(211, 211, 211, 0.5);
    textAnnot.TextColor = new Annotations.Color(0, 165, 228);
    textAnnot.StrokeThickness = 1;
    textAnnot.StrokeColor = new Annotations.Color(0, 165, 228);
    textAnnot.TextAlign = 'center';

    textAnnot.Author = annotManager.getCurrentUser();

    annotManager.deselectAllAnnotations();
    annotManager.addAnnotation(textAnnot, true);
    annotManager.redrawAnnotation(textAnnot);
    annotManager.selectAnnotation(textAnnot);
  };

  const applyFields = async () => { // TODO pindahin ke ReviewSend.js
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
        if (typeof annot.custom === 'undefined') return

        // create a form field based on the type of annotation
        if (annot.custom.type === 'SIGNATURE') {
          field = new Annotations.Forms.Field(
            annot.getContents() + Date.now() + index,
            {
              type: 'Sig',
            },
          );
          inputAnnot = new Annotations.SignatureWidgetAnnotation(field, {
            appearance: '_DEFAULT',
            appearances: {
              _DEFAULT: {
                Normal: {
                  data:
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuMWMqnEsAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC',
                  offset: {
                    x: 100,
                    y: 100,
                  },
                },
              },
            },
          });
        } else if (annot.custom.type === 'DATE') {
          field = new Annotations.Forms.Field(
            annot.getContents() + Date.now() + index,
            {
              type: 'Tx',
              value: 'd-m-yyyy',
              // Actions need to be added for DatePickerWidgetAnnotation to recognize this field.
              actions: {
                F: [
                  {
                    name: 'JavaScript',
                    // You can customize the date format here between the two double-quotation marks
                    // or leave this blank to use the default format
                    javascript: 'AFDate_FormatEx("dd-mm-yyyy");', // TODO change date format if needed
                  },
                ],
                K: [
                  {
                    name: 'JavaScript',
                    // You can customize the date format here between the two double-quotation marks
                    // or leave this blank to use the default format
                    javascript: 'AFDate_FormatEx("dd-mm-yyyy");', // TODO change date format if needed
                  },
                ],
              },
            },
          );

          inputAnnot = new Annotations.DatePickerWidgetAnnotation(field);
        } else if (annot.custom.type === 'CHECKBOX') {
          field = new Annotations.Forms.Field(
            annot.getContents() + Date.now() + index,
            {
              type: 'Tx',
              value: annot.custom.value,
            },
          );
          inputAnnot = new Annotations.CheckButtonWidgetAnnotation(field);
        } else {
          field = new Annotations.Forms.Field(
            annot.getContents() + Date.now() + index,
            {
              type: 'Tx',
              value: annot.custom.value,
            },
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
              border: '1px solid #a5c7ff',
            };
          }
        };
        Annotations.WidgetAnnotation.getCustomStyles(inputAnnot);

        // draw the annotation the viewer
        annotManager.addAnnotation(inputAnnot);
        fieldManager.addField(field);
        annotsToDraw.push(inputAnnot);
      }),
    );

    // delete old annotations
    annotManager.deleteAnnotations(annotsToDelete, null, true);

    // refresh viewer
    await annotManager.drawAnnotationsFromList(annotsToDraw);

    // TODO tembak BE update document: PUT /api/doc/:docid?fileName=&signType=
  };
  // END JOJO

  return (
    <div className={"prepareDocument"}>
      <div className="row">
        {/* <div className="col-2">
          <h1>View Document</h1>          
        </div> */}
        {/* JOJO */}

        <div className="col-3">
          <div className="row">
            <div className="lead">Signers</div>
            <Box padding={2}>
              <SelectList
                id="assigningFor"
                name="assign"
                onChange={({ value }) => setAssignee(value)}
                options={assigneesValues}
                placeholder="Select recipient"
                value={assignee}
              />
            </Box>

            <div className="lead">Signature fields</div>
            <Box padding={2}>
              <div
                draggable
                onDragStart={e => dragStart(e)}
                onDragEnd={e => dragEnd(e, 'SIGNATURE')}
              >
                {/* TODO add signature icon */}
                <Button
                  onClick={() => addField('SIGNATURE', false)}
                  accessibilityLabel="add signature"
                  text="Signature"
                />
              </div>
            </Box>
            <Box padding={2}>
              <div
                draggable
                onDragStart={e => dragStart(e)}
                onDragEnd={e => dragEnd(e, 'INITIAL')}
              >
                {/* TODO add initials icon */}
                <Button
                  onClick={() => addField('INITIAL', false)}
                  accessibilityLabel="add initial"
                  text="Initials"
                />
              </div>
            </Box>

            <div className="lead">Auto-fill fields</div>
            <Box padding={2}>
              <div
                draggable
                onDragStart={e => dragStart(e)}
                onDragEnd={e => dragEnd(e, 'DATE')}
              >
                {/* TODO add dates icon */}
                <Button
                  onClick={() => addField('DATE', true)}
                  accessibilityLabel="add date"
                  text="Dates"
                />
              </div>
            </Box>
            <Box padding={2}>
              <div
                draggable
                onDragStart={e => dragStart(e)}
                onDragEnd={e => dragEnd(e, 'NAME')}
              >
                {/* TODO add name icon */}
                <Button
                  onClick={() => addField('NAME', true)}
                  accessibilityLabel="add name"
                  text="Name"
                />
              </div>
            </Box>
            <Box padding={2}>
              <div
                draggable
                onDragStart={e => dragStart(e)}
                onDragEnd={e => dragEnd(e, 'EMAIL')}
              >
                {/* TODO add email icon */}
                <Button
                  onClick={() => addField('EMAIL', true)}
                  accessibilityLabel="add email"
                  text="Email"
                />
              </div>
            </Box>
            <Box padding={2}>
              <div
                draggable
                onDragStart={e => dragStart(e)}
                onDragEnd={e => dragEnd(e, 'COMPANY')}
              >
                {/* TODO add company icon */}
                <Button
                  onClick={() => addField('COMPANY', true)}
                  accessibilityLabel="add company"
                  text="Company"
                />
              </div>
            </Box>
            <Box padding={2}>
              <div
                draggable
                onDragStart={e => dragStart(e)}
                onDragEnd={e => dragEnd(e, 'TITLE')}
              >
                {/* TODO add title icon */}
                <Button
                  onClick={() => addField('TITLE', true)}
                  accessibilityLabel="add title"
                  text="Title"
                />
              </div>
            </Box>

            <div className="lead">Standard fields</div>
            {/* TODO add lock icon, set disabled */}
            <Box padding={2}>
              <div
                draggable
                onDragStart={e => dragStart(e)}
                onDragEnd={e => dragEnd(e, 'TEXT')}
              >
                {/* TODO add textbox icon */}
                <Button
                  onClick={() => addField('TEXT', true)}
                  accessibilityLabel="add text"
                  text="Textbox"
                />
                {/* TODO add lock icon, set disabled */}
              </div>
            </Box>
            <Box padding={2}>
              <div
                draggable
                onDragStart={e => dragStart(e)}
                onDragEnd={e => dragEnd(e, 'CHECKBOX')}
              >
                {/* TODO add checkbox icon */}
                <Button
                  onClick={() => addField('CHECKBOX', true)}
                  accessibilityLabel="add checkbox"
                  text="Checkbox"
                />
                {/* TODO add lock icon, set disabled */}
              </div>
            </Box>
          </div>
        </div>
        {/* END JOJO */}

        <div className="col-9">
          <div className="webviewer" ref={viewer}></div>
        </div>
      </div>
    </div>
  );
};

export default PlaceField;
