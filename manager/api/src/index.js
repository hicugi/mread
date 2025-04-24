import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import { WebSocketServer } from "ws";

import { getMangaList } from "./route/list.js";
import { downloadManga } from "./route/manga.js";

const PORT = 3080;
const PORT_WS = 3081;

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ port: PORT_WS });
wss.activeWs = {
  send: () => null
};

app.use(cors());

app.get("/list", getMangaList);

wss.on("connection", (ws) => {
  console.log("WS server started");

  ws.on("error", console.error);

  function sendMessage(data) {
    ws.send(JSON.stringify(data));
  }
  ws.on("message", (data) => {
    const params = JSON.parse(data.toString());
    downloadManga(params, sendMessage);
  });
});

server.listen(PORT, () => {
  console.log(`The app started on port ${PORT}`);
});

