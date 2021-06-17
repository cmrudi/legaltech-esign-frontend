import axios from "axios";

const API_ADD_DOC = "/api/doc/";
const API_ADD_USER_TO_DOC = "/api/docflow/";

export const addDoc = async (file, fileName, signType) => {
  const data = new FormData();
  data.append("document", file);

  try {
    const response = await axios.post(
      `${API_ADD_DOC}?fileName=${encodeURIComponent(
        fileName
      )}&signType=${encodeURIComponent(signType)}`,
      data
    );
    return response.data;
  } catch (e) {
    // if (e?.response) {
    //   const errorCode = e.response?.data?.code;
    // }
    throw e?.response?.data?.errorMessage ?? "Fail to upload file";
  }
};

export const deleteDoc = async (fileId) => {
  try {
    const response = await axios.delete(`${API_ADD_DOC}${fileId}/`);
    return response.data;
  } catch (e) {
    // if (e?.response) {
    //   const errorCode = e.response?.data?.code;
    // }
    throw e?.response?.data?.error?.message ?? "Fail to upload file";
  }
};

export const replaceDoc = async (file, fileName, fileId, signType) => {
  const data = new FormData();
  data.append("document", file);
  // const data = {
  //   linkToPdf: url,
  //   filename,
  // };
  try {
    const response = await axios.put(
      `${API_ADD_DOC}${fileId}?fileName=${encodeURIComponent(
        fileName
      )}&signType=${encodeURIComponent(signType)}`,
      data
    );
    return response.data;
  } catch (e) {
    console.log(e?.response);
    // if (e?.response) {
    //   const errorCode = e.response?.data?.code;
    // }
    throw e?.response?.data?.error?.message ?? "Add docs failed";
  }
};

export const addUserToDocument = async (data) => {
  try {
    const response = await axios.post(API_ADD_USER_TO_DOC, data);
    return response.data?.data;
  } catch (e) {
    console.log(e?.response);
    // if (e?.response) {
    //   const errorCode = e.response?.data?.code;
    // }
    throw e?.response?.data?.error?.message ?? "Add docs failed";
  }
};
