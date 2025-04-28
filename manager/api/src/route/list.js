import path from 'path';
import fs from 'fs/promises';

import { MANGA_DIR, MANGA_META_FILENAME, MANGA_COOVER } from "../config.js";
import metaConverter from "../helper/metaConverter.js";

export async function getMangaList(req, res) {
  const items = await fs.readdir(MANGA_DIR);
  const dirs = items.filter((name) => name[0] !== '.');

  const list = [];

  for (const dir of dirs) {
    const metaFile = path.join(MANGA_DIR, dir, MANGA_META_FILENAME);
    const body = String(await fs.readFile(metaFile));
    const { name } = metaConverter.decode(body);

    list.push({
      name,
      alias: dir,
      image: [dir, MANGA_COOVER].join("/"),
    });
  }

  res.send({ items: list });
}

