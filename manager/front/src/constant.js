export const HOST_KEY = "host";

export const getHost = () => localStorage.getItem(HOST_KEY);
export const setHost = (value) => {
  localStorage.setItem(HOST_KEY, value);
  api.host = value;
}

export const api = {
  host: getHost(),

  request(pathname, options = {}) {
    if (options.headers === undefined) {
      options.headers = {};
    }

    const url = `${this.host}${pathname}`;
    return fetch(url, options).then((r) => r.json());
  },

  get(pathname) {
    return this.request(pathname);
  },

  post(pathname, body) {
    return this.request(pathname, { method: "POST", body });
  },
}

