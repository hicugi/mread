const HOST_URL_KEY = 'HOST_URL';
const LOCAL_HOST = "http://127.0.0.1:3080";

export const api = {
  get: (url) => {
    const value = (window[HOST_URL_KEY] ?? LOCAL_HOST) + url;
    return fetch(value).then((res) => res.json());
  }
};
