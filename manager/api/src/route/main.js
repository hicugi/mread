import path from "path";
import fs from "fs/promises";

import { MANGA_DIR } from "../config.js";

export const addNewManga = async (req, res) => {
  const data = req.body;
  const { name, link } = data;
  const image = req.file;

  const dir = path.join(MANGA_DIR, data.dir);
  await fs.mkdir(dir, { recursive: true });

  await (() => {
    const body = [];
    const metaInfo = {
      name,
      link,
    };

    for (const key in metaInfo) {
      body.push([key, metaInfo[key]].join(": "))
    }

    return fs.writeFile(path.join(dir, ".meta"), body.join("\n"));
  })();

  await fs.rename(image.path, path.join(dir, ".cover.jpg"));

  res.send({ message: "OK" });
}
