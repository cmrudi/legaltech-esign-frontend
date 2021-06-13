import React, { useState, createContext, useContext } from "react";
// import { useHistory, useLocation } from "react-router-dom";
// import axios from "axios";

export const DataContext = createContext({});
export const useData = () => useContext(DataContext);

const DataProvider = ({ children }) => {
  const [docs, setDocs] = useState(false);
  const [fileData, setFileData] = useState("");
  // const history = useHistory();
  // const location = useLocation();

  return (
    <DataContext.Provider
      value={{
        fileData,
        setFileData,
        docs,
        setDocs,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
