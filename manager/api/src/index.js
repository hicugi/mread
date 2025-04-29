import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";

const upload = multer({ dest: '/tmp/' })

import { addNewManga, getMangaInfo, getMangaCover, removeManga } from "./route/main.js";
import { getMangaList } from "./route/list.js";

const PORT = 3080;

const app = express();
app.use(cors());

app.get("/list", getMangaList);

app.get("/manga/:dir", getMangaInfo);
app.get("/manga/:dir/image", getMangaCover);

app.post("/manga", upload.single("image"), addNewManga);
app.delete("/manga/:dir", removeManga);


app.listen(PORT, () => {
  console.log(`The app started on port ${PORT}`);
});

