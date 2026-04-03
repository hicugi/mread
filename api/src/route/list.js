import path from "path";
import fs from "fs/promises";

import { MANGA_DIR } from "../config.js";
import { getMangaChapters, getMangaInfo } from "../helper/index.js";
import { decode } from "../helper/metaConverter.js";

export const getList = async (_, res) => {
  const list = await fs.readdir(MANGA_DIR);

  const result = [];
  for (const item of list) {
    if (item[0] == ".") continue;

    const info = await getMangaInfo(item);
    result.push(info);
  }

  for (const item of result) {
    const dirItems = await getMangaChapters(item.name);

    if (!dirItems.length) {
      continue;
    }

    item.lastChapter = dirItems[0];
  }

  res.send(result);
};
