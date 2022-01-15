import { highlightedNavs, publicLinks } from "./constant";
import { format } from "date-fns";

/* eslint-disable no-useless-escape */
export const isValidEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const isValidAccountNumber = (number) => {
  const text = String(number).trim();
  if (text.length !== 12) return false;
  const range = ["0".charCodeAt(0), "9".charCodeAt(0)];
  for (let i = 0; i < text.length; i++) {
    const dec = text.charCodeAt(i);
    if (dec < range[0] || dec > range[1]) {
      return false;
    }
  }
  return true;
};

export const isValidContactNumber = (number) => {
  const text = String(number).trim();
  // if (text.length !== 12) return false;
  const range = ["0".charCodeAt(0), "9".charCodeAt(0)];
  for (let i = 0; i < text.length; i++) {
    const dec = text.charCodeAt(i);
    if (dec < range[0] || dec > range[1]) {
      return false;
    }
  }
  return true;
};

export const isDateSame = (date1, date2) => {
  try {
    const oldDate = format(new Date(date1), "yyyy-MM-dd");
    const newDate = format(new Date(date2), "yyyy-MM-dd");
    return String(oldDate) === String(newDate);
  } catch {
    return false;
  }
};

export const isTimeInMsBeforeNow = (ms) => ms > Date.now();

export const isFileValid = (file, extensions, maxFileSize) => {
  return true;
  // TODO JOJO
  // const format = `.${file?.type.split("/").pop()}`;
  // const allowAllFile = extensions.includes("*");

  // if (!allowAllFile) {
  //   if (format && !extensions.includes(format)) {
  //     const fileExtensionText = extensions?.reduce(
  //       (accumulator, extension, i) =>
  //         `${accumulator}${i === 0 ? "" : ", "}${extension}`
  //     );
  //     throw new Error(`file_format_error ${fileExtensionText}.`);
  //   }
  // }

  // const size = Math.ceil(file?.size / 1024 / 1000);
  // const sizeConstraint = parseInt(maxFileSize.split(" ")[0]);
  // if (size > sizeConstraint) {
  //   throw new Error(`file_size_error ${maxFileSize}.`);
  // }
  // return true;
};

export const isHeaderHighlighted = (pathname) => {
  if (!pathname) return false;
  for (let nav of highlightedNavs) {
    if (nav === pathname || pathname === `${nav}/`) return true;
  }
  return false;
};

export const isPublicLink = (pathname) => {
  if (!pathname) return false;
  for (let publicLink of publicLinks) {
    if (String(pathname).includes(publicLink)) return true;
  }
  return false;
};

export class PersonalDetailValidator {
  isValidName = (inputName, authName) =>
    inputName !== "" && String(inputName).trim() !== String(authName).trim();
  isValidNIK = (inputNik, authNik) =>
    inputNik !== "" &&
    String(inputNik).trim() !== String(authNik).trim() &&
    String(inputNik).trim().length > 9;
  isValidBirthDate = (inputBirthDate, authBirthDate) => {
    return (
      !isDateSame(inputBirthDate, new Date()) &&
      inputBirthDate !== "" &&
      inputBirthDate !== undefined &&
      inputBirthDate !== null &&
      !isDateSame(inputBirthDate, authBirthDate)
    );
  };
  isValidPhoneNumber = (inputPhoneNumber, authPhoneNumber) =>
    inputPhoneNumber !== "" &&
    String(inputPhoneNumber).trim() !== String(authPhoneNumber).trim() &&
    String(inputPhoneNumber).trim().length > 4;
}
