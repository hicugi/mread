// import fs from "fs";
import express from "express";
// import https from "https";

import { getChapters } from "./route/chapters.js";
import { getImages } from "./route/images.js";
import { getList } from "./route/list.js";

// const options = {
//   key: fs.readFileSync("./cert/localhost.key"),
//   cert: fs.readFileSync("./cert/localhost.crt"),
// };

const app = express();
const port = 8000;

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.static("public"));

app.get("/list", getList);
app.get("/chapters/:name", getChapters);
app.get("/images/:name/:chapter", getImages);

// const server = https.createServer(options, app);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
