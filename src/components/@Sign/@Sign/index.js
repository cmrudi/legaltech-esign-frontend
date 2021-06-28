import React, { useRef, useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { navigate } from "@reach/router";
// import { selectDocToView } from "./ViewDocumentSlice";
// import { storage } from '../../firebase/firebase';
import WebViewer from "@pdftron/webviewer";
import CoreControls from "@pdftron/webviewer";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";

import "./sign.css";
import { useLocation } from "react-router-dom";

const temp =
  "https://storage.googleapis.com/legaltech-esign-develop/develop/doc/aisc_jones_napoleon_pdf1624197842048";

const Sign = () => {
  const { auth } = useAuth();

  const [annotManager, setAnnotatManager] = useState(null);
  const [annotPosition, setAnnotPosition] = useState(0);
  const [docViewer, setDocViewer] = useState(null);

  const { getItemData } = useData();

  const location = useLocation();

  const atr = String(location?.search).slice(5, 7);

  const fileData = getItemData(atr, "fileData");
  // TODO fetch myFields (GET /api/doc/:docid/fields)

  const viewer = useRef(null);

  useEffect(() => {
    WebViewer(
      {
        path: "webviewer",
        disabledElements: [
          "ribbons",
          "toggleNotesButton",
          "searchButton",
          "menuButton",
          "rubberStampToolGroupButton",
          "stampToolGroupButton",
          "fileAttachmentToolGroupButton",
          "calloutToolGroupButton",
          "undo",
          "redo",
          "eraserToolButton",
        ],
      },
      viewer.current
    ).then(async (instance) => {
      const { docViewer, annotManager, Annotations } = instance;
      setAnnotatManager(annotManager);
      setDocViewer(docViewer);

      // select only the insert group
      instance.setToolbarGroup("toolbarGroup-Insert");

      // load document
      docViewer.loadDocument(fileData?.linkToPdf ?? temp, {
        filename: fileData?.filename,
      });

      const signatureTool = docViewer.getTool('AnnotationCreateSignature');
      docViewer.on('documentLoaded', () => {
        console.log("signature tool", signatureTool)
        // TODO import signature from /api/user/signatures
        // const signatures = JSON.parse('[[[{\"Pa\":{\"rows\":3,\"Ar\":1,\"Zq\":[21.59754154057473,151.01371910999913,1]}},{\"Pa\":{\"rows\":3,\"Ar\":1,\"Zq\":[21.59754154057473,151.01371910999913,1]}},{\"Pa\":{\"rows\":3,\"Ar\":1,\"Zq\":[24.451680867431776,146.73251011971357,1]}},{\"Pa\":{\"rows\":3,\"Ar\":1,\"Zq\":[54.420143799430704,122.47232584142873,1]}},{\"Pa\":{\"rows\":3,\"Ar\":1,\"Zq\":[94.37809437542924,103.92042021685793,1]}},{\"Pa\":{\"rows\":3,\"Ar\":1,\"Zq\":[124.34655730742817,101.06628089000091,1]}},{\"Pa\":{\"rows\":3,\"Ar\":1,\"Zq\":[142.89846293199892,103.92042021685793,1]}},{\"Pa\":{\"rows\":3,\"Ar\":1,\"Zq\":[152.8879505759986,109.62869887057202,1]}},{\"Pa\":{\"rows\":3,\"Ar\":1,\"Zq\":[180.00227418114045,125.32646516828575,1]}},{\"Pa\":{\"rows\":3,\"Ar\":1,\"Zq\":[192.84590115199717,135.3159528122854,1]}},{\"Pa\":{\"rows\":3,\"Ar\":1,\"Zq\":[204.2624584594253,149.58664944657062,1]}}]]]');
        // const signatures = [[new CoreControls.Math.Point(200, 180), new CoreControls.Math.Point(200, 190)]];
        // console.log(signatures);
        // signatureTool.importSignatures(signatures);
        // var signex = signatureTool.exportSignatures();
        // console.log("signature tool", JSON.stringify(signex));
      });

      // const normalStyles = (widget) => {
      //   if (widget instanceof Annotations.TextWidgetAnnotation) {
      //     return {
      //       "background-color": "#a5c7ff",
      //       color: "white",
      //     };
      //   } else if (widget instanceof Annotations.SignatureWidgetAnnotation) {
      //     return {
      //       border: "1px solid #a5c7ff",
      //     };
      //   }
      // };

      // annotManager.on(
      //   "annotationChanged",
      //   (annotations, action, { imported }) => {
      //     if (imported && action === "add") {
      //       annotations.forEach(function (annot) {
      //         if (annot instanceof Annotations.WidgetAnnotation) {
      //           Annotations.WidgetAnnotation.getCustomStyles = normalStyles;
      //           // TODO if annot.getCustomData(id) not in myFields
      //           if (false) {
      //             annot.Hidden = true;
      //             annot.Listable = false;
      //           }
      //         }
      //       });
      //     }
      //   }
      // );
    });
  }, [fileData, auth?.id_token]);

  const nextField = () => {
    let annots = annotManager.getAnnotationsList();
    if (annots[annotPosition]) {
      annotManager.jumpToAnnotation(annots[annotPosition]);
      if (annots[annotPosition + 1]) {
        setAnnotPosition(annotPosition + 1);
      }
    }
  };

  const prevField = () => {
    let annots = annotManager.getAnnotationsList();
    if (annots[annotPosition]) {
      annotManager.jumpToAnnotation(annots[annotPosition]);
      if (annots[annotPosition - 1]) {
        setAnnotPosition(annotPosition - 1);
      }
    }
  };

  const doneSigning = async () => {
    const xfdf = await annotManager.exportAnnotations({
      widgets: false,
      links: false,
    });
    console.log(xfdf);

    const signatureTool = docViewer.getTool('AnnotationCreateSignature');
    var signatures = signatureTool.exportSignatures();
    signatures = signatures.map(sig => sig.map(p => {
      console.log(p);
      return JSON.stringify(p);
    }));
    console.log(signatures);
    signatureTool.importSignatures([JSON.parse(signatures[1])]);
    // TODO tembak BE update document: PUT /api/doc/:docid?fileName=&signType=
    // TODO tembak BE sign document: POST /api/doc/:docid/sign
  };

  const actionButtons = [
    { text: "Next", onClick: nextField },
    { text: "Prev", onClick: prevField },
    { text: "Done", onClick: doneSigning },
  ];

  const ConferArea = ({ text, onClick }) => (
    <div className="px-2 py-1">
      <button
        className="button-placefields"
        onClick={onClick}
      >
        {text}
      </button>
    </div>
  );

  return (
    <div className={"sign-area"}>
      <div className="row">
        <div className="col-lg-3 col-md-12 left-sidebar">
          <div className="container">
            <div className="row pt-2">
              <div className="lead">Sign Document</div>
              {actionButtons?.map(({ text, onClick }, i) => (
                <ConferArea text={text} onClick={onClick} key={i} />
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

export default Sign;
