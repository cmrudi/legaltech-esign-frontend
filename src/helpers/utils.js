import { toPng } from "html-to-image";

export const setQueryStringWithoutReload = (qs) => {
  const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}${qs}`;
  window.history.pushState({ path: newUrl }, "", newUrl);
};

export const convertToImg = async (htmlNode) => {
  const res = await toPng(htmlNode);
  return res;
};

export const waitForImageToLoad = (imageElement) => {
  return new Promise((resolve) => {
    imageElement.onload = resolve;
  });
};
