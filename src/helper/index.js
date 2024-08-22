import path from "path";
import fs from "fs/promises";

import { MANGA_DIR } from "../config.js";

const formatChapterName = (d) => {
  const ar = d.split("-");
  if (ar.length === 1) {
    return Number(d);
  }

  return ar[0] + ar[1] / 100000;
};

export const getMangaChapters = async (name) => {
  const mainPath = path.join(MANGA_DIR, name);
  const items = await fs.readdir(mainPath).catch(() => []);

  const result = [];

  for (const name of items) {
    if (name[0] === "." || name === "cover.jpg") {
      continue;
    }

    result.push(name);
  }

  result.sort((a, b) => formatChapterName(b) - formatChapterName(a));

  return result;
};
