export const HOST_KEY = "host";

export const getHost = () => localStorage.getItem(HOST_KEY);
export const setHost = (value) => {
  localStorage.setItem(HOST_KEY, value);
  api.host = value;
}

export const api = {
  host: getHost(),

  get(pathname) {
    const url = `${this.host}${pathname}`;
    return fetch(url).then((r) => r.json());
  }
}

