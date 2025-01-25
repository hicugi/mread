import express from "express";
import cors from "cors";
import { getMangaList } from "./route/list.js";

const PORT = 3080;

const app = express();
app.use(cors());

app.get("/list", getMangaList);

app.listen(PORT, () => {
  console.log(`The app started on port ${PORT}`);
});

