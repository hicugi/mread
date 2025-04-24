const DOMAIN = "127.0.0.1";
const HTTP_HOST = `http://${DOMAIN}:3080`;
const SOCKET_HOST = `ws://${DOMAIN}:3081`;

export const api = {
  get: (url) => {
    const fullUrl = HTTP_HOST + url;
    return fetch(fullUrl).then((res) => res.json());
  },

  connect: async (url, data) => {
    const fullUrl = SOCKET_HOST + url;

    const socket = new WebSocket(fullUrl);
    await new Promise((ok) => {
      socket.onopen = () => {
        console.log("Connected");
        ok();
      }
    });
    return socket;
  }
};
