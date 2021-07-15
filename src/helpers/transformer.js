import { formatDistance } from "date-fns";
import { format } from "date-fns/esm";

export const getReadableWord = (string) => {
  const char = String(string).replace(" ", "-");
  return char;
};

export const getMoment = (date) => {
  let a = formatDistance(new Date(date), new Date(), {
    addSuffix: true,
  });
  return String(a);
};

export const getBackendDateFormat = (date) =>
  format(new Date(date), "yyyy-MM-dd");

export const getOnlyThePath = (pathName) => {
  console.log(pathName);
  console.log(pathName.substring(1));
  return pathName.toUpperCase().substring(1);
};

export const getImageSize = (url, callback) => {
  var img = new Image();
  img.src = url;
  img.onload = () => {
    callback(this?.width, this?.height);
  };
};
