import { getDocumentAuditTrail } from "api/docs";
import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useState,
} from "react";
import { useSnackbar } from "./SnackbarContext";

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
    default:
      return state;
  }
};

const DataProvider = ({ children }) => {
  const { addSnackbar } = useSnackbar();

  const [dataDocs, dispatchDataDocs] = useReducer(reducer, {
    me: { docs: false, fileData: false, signers: [], copies: [] },
    all: { docs: false, fileData: false, signers: [], copies: [] },
    request: { docs: false, fileData: false, signers: [], copies: [] },
  });
  const [docs, setDocs] = useState(false);

  const [auditTrails, setAuditTrails] = useState({});

  const getAuditTrail = useCallback(
    async (documentId) => {
      try {
        const res = await getDocumentAuditTrail(documentId);
        if (res) {
          setAuditTrails((now) => {
            return { ...now, [documentId]: res.data };
          });
        }
      } catch (e) {
        addSnackbar(String(e));
      }
    },
    [addSnackbar]
  );

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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
