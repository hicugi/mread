import path from "path";
import fs from "fs/promises";

import { MANGA_DIR } from "../config.js";
import { getMangaChapters } from "../helper/index.js";
import { decode } from "../helper/metaConverter.js";

export const getList = async (_, res) => {
  const list = await fs.readdir(MANGA_DIR);

  const result = [];
  for (const item of list) {
    if (item[0] == ".") continue;

    const content = await fs.readFile(path.resolve(MANGA_DIR, item, ".meta"), "utf-8");
    const { name } = decode(content);

    result.push({
      name,
      alias: item,
      image: `manga/${item}/cover.jpg`,
    });
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
