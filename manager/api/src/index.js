import express from "express";
import cors from "cors";
import multer from "multer";

const upload = multer({ dest: '/tmp/' })

import { addNewManga } from "./route/main.js";
import { getMangaList } from "./route/list.js";

const PORT = 3080;

const app = express();
app.use(cors());

app.get("/list", getMangaList);
app.post("/manga", upload.single("image"), addNewManga);

app.listen(PORT, () => {
  console.log(`The app started on port ${PORT}`);
});

