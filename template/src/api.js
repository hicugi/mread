import { HOST_URL_KEY } from "./helper/main.js";

const LOCAL_HOST = "http://127.0.0.1:8000";

export const api = {
  host: null,

  get(url) {
    const host = window[HOST_URL_KEY] ?? LOCAL_HOST;
    this.host = host;

    const value = host + url;
    return fetch(value).then((res) => res.json());
  }
};
