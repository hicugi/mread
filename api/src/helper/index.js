import path from "path";
import fs from "fs/promises";

import { MANGA_DIR } from "../config.js";
import { decode } from "./metaConverter.js";

export const PORT = 8000;
export const HOST = `http://0.0.0.0:${PORT}`;

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

export async function getMangaInfo(alias) {
  const content = await fs.readFile(path.resolve(MANGA_DIR, alias, ".meta"), "utf-8");
  const { name, isTop } = decode(content);

  return {
    name,
    alias,
    image: `manga/${alias}/cover.jpg`,
    isTop: Boolean(isTop),
  };
}
