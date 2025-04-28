import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";

const upload = multer({ dest: '/tmp/' })

import { addNewManga, getMangaCover, removeManga } from "./route/main.js";
import { getMangaList } from "./route/list.js";

const PORT = 3080;

const app = express();
app.use(cors());

app.get("/list", getMangaList);

app.post("/manga", upload.single("image"), addNewManga);
app.delete("/manga/:dir", removeManga);
app.get("/manga/:dir/image", getMangaCover);

app.listen(PORT, () => {
  console.log(`The app started on port ${PORT}`);
});

