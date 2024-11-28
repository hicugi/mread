import path from "path";
import fs from "fs";

import { MANGA_DIR } from "../config.js";
import { getMangaChapters } from "../helper/index.js";

export const getChapters = async (req, res) => {
  const { name } = req.params;

  const notFoundResponse = () => {
    res.status(404);
    res.send({ message: "Not found" });
  };

  if (!name.match(/^[\w\-_]+$/)) {
    notFoundResponse();
    return;
  }

  const mainPath = path.join(MANGA_DIR, name);
  const dirItems = await getMangaChapters(name);

  if (!dirItems.length) {
    notFoundResponse();
    return;
  }

  const result = [];

  for (const name of dirItems) {
    const chapterPath = path.join(mainPath, name);

    let items = [];
    try {
      items = fs.readdirSync(chapterPath);
    } catch {}

    if (!items.length) continue;

    result.push({
      name,
      itemsCount: items.length,
    });
  }

  const format = (v) => {
    const n = Number(
      v.replace("-", ".").replace(",", ".").replace(/[a-z]/gi, "")
    );
    if (!Number.isNaN(n)) return n;

    return Number((v.match(/(\d+)/) || [])[1]) || v;
  };
  result.sort((a, b) => format(b.name) - format(a.name));

  res.send(result);
};
