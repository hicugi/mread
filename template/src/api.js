import { HOST_URL_KEY } from "./helper/main.js";

const LOCAL_HOST = "http://127.0.0.1:8000";

export const api = {
  get: (url) => {
    const value = (window[HOST_URL_KEY] ?? LOCAL_HOST) + url;
    return fetch(value).then((res) => res.json());
  }
};
