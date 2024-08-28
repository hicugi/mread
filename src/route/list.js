import fs from "fs/promises";

import { MANGA_DIR } from "../config.js";
import { HOST, getMangaChapters } from "../helper/index.js";

export const getList = async (_, res) => {
  const list = await fs.readdir(MANGA_DIR);

  const result = list
    .filter((elm) => elm[0] !== ".")
    .map((name) => ({
      name,
      image: `${HOST}/manga/${name}/cover.jpg`,
    }));

  for (const item of result) {
    const dirItems = await getMangaChapters(item.name);

    if (!dirItems.length) {
      continue;
    }

    item.lastChapter = dirItems[0];
  }

  res.send(result);
};
