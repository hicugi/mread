import { HOST_URL_KEY } from "./helper/main.js";

export const api = {
  host: null,

  async get(url) {
    const host = window[HOST_URL_KEY];
    this.host = host;

    const value = host + url;
    return fetch(value).then((res) => res.json());
  }
};
