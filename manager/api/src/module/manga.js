import path from "path";
import fs from "fs/promises";

import { MANGA_DIR, MANGA_META_FILENAME, MANGA_COOVER } from "../config.js";
import metaConverter from "../helper/metaConverter.js";
import { getMangaImage } from "../helper/manga.js";

export const getInfo = async (req, dir) => {
  const dirPath = path.join(MANGA_DIR, dir);

  const infoContent = await fs.readFile(path.join(dirPath, MANGA_META_FILENAME), "utf-8");
  const { name, link } = metaConverter.decode(infoContent)

  return {
    name,
    link,
    image: getMangaImage(req, dir),
    dirPath,
  };
}
