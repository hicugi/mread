import fs from 'fs/promises';
import { MANGA_DIR } from "../config.js";

export async function getMangaList(req, res) {
  const items = await fs.readdir(MANGA_DIR);
  const list = items.filter((name) => name[0] !== '.');

  res.send({ list });
}

