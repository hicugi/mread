import { HOST_URL_KEY } from "./helper/main.js";

export const api = {
  get: (url) => fetch(window[HOST_URL_KEY] + url).then((res) => res.json()),
};
