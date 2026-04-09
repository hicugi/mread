import { api } from "../api.js";

export const isApp = window.flIsApp !== undefined;
export const isWebApp = !isApp;

export const HOST_URL_KEY = 'HOST_URL';

window[HOST_URL_KEY] = (() => {
  const DEV_PORT = 5173;
  const SERVER_PORT = 8000;

  if (location.host.includes(DEV_PORT)) {
    return location.origin.replace(DEV_PORT, SERVER_PORT);
  }

  return "http://127.0.0.1:8000";
})();
window.appSetHost = (value) => {
  window[HOST_URL_KEY] = value;
}

export const getImageSource = (str) => {
  return isBase64 ? str : window[HOST_URL_KEY] 
}
export function getImgUrl(str) {
  if (str?.startsWith === undefined) {
    console.log(typeof str, str);
    return "";
  }

  const isBase64 = str.startsWith("data:file;base64");
  if (isBase64) return str;

  let res = window[HOST_URL_KEY];
  res = res.replace(/\/+$/, "");

  return res + "/" + str.replace(/^\/+/, "");
}

export const fetchImages = (name, chapter) => {
  return api.get(`/images/${name}/${chapter}`);
};
export const fetchChapters = (alias, store) => {
  return api.get(`/chapters/${alias}`).then((data) => {
    const { chapters, ...dataInfo } = data;
    chapters.reverse();

    store.setState((prev) => ({
      ...prev,
      mangaInfo: ({
        ...dataInfo,
        ...prev.mangaInfo,
        chaptersOnline: chapters,
      }),
    }));
  });
}

