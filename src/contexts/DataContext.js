import { getDocumentAuditTrail } from "api/docs";
import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useState,
} from "react";
// import { useSnackbar } from "./SnackbarContext";

export const DataContext = createContext({});
export const useData = () => useContext(DataContext);

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        [action.key]: { ...state[action.key], [action.attr]: action.data },
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        [action.key]: { ...state[action.key], [action.attr]: false },
      };
    case "RESET_ITEM":
      return {
        me: INITDATA,
        all: INITDATA,
        request: INITDATA,
      };
    default:
      return state;
  }
};

export let INITDATA = {
  docs: false,
  fileData: false,
  // signers: [],
  // copies: [],
  placeFieldImages: [],
  placeFieldFields: [],
};

const DataProvider = ({ children }) => {
  // const { addSnackbar } = useSnackbar();

  const [dataDocs, dispatchDataDocs] = useReducer(reducer, {
    me: INITDATA,
    all: INITDATA,
    request: INITDATA,
  });

  const [signData, setSignData] = useState(false);
  const [docs, setDocs] = useState(false);

  const [auditTrails, setAuditTrails] = useState({});

  const fetchAuditTrail = async (documentId) => {
    try {
      const res = await getDocumentAuditTrail(documentId);
      if (res) {
        setAuditTrails((now) => {
          return { ...now, [documentId]: res.auditTrails };
        });
      }
    } catch (_) {
      // addSnackbar(String(e));
    }
  };

  const getAuditTrail = async (documentId) => {
    if (documentId in auditTrails) {
      return;
    } else await fetchAuditTrail(documentId);
  };

  const resetDataDocs = () => {
    dispatchDataDocs({ type: "RESET_ITEM" });
  };

  const getItemData = useCallback(
    (atr, item) => dataDocs?.[atr]?.[item],
    [dataDocs]
  );

  const handle_data_docs = (isAdd, key, attr, data) => {
    const type = isAdd ? "ADD_ITEM" : "REMOVE_ITEM";
    dispatchDataDocs({ type, key, attr, data });
  };

  return (
    <DataContext.Provider
      value={{
        docs,
        setDocs,
        dataDocs,
        handle_data_docs,
        getItemData,
        getAuditTrail,
        auditTrails,
        signData,
        setSignData,
        resetDataDocs,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
