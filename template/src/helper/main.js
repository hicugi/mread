import { api } from "../api.js";

export const isApp = window.flDownloadImage !== undefined;
export const isWebApp = !isApp;

export const HOST_URL_KEY = 'HOST_URL';

export const getImageSource = (str) => {
  return isBase64 ? str : window[HOST_URL_KEY] 
}

export const fetchImages = (name, chapter) => {
  return api.get(`/images/${name}/${chapter}`);
};

