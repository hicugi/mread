import path from "path";
import mainFs from "fs";
import fs from "fs/promises";

import { MANGA_DIR, MANGA_META_FILENAME, MANGA_COOVER } from "../config.js";
import metaConverter from "../helper/metaConverter.js";
import { getMangaImage } from "../helper/manga.js";

export const addNewManga = async (req, res) => {
  const data = req.body;
  const { name, link } = data;
  const image = req.file;

  const dir = path.join(MANGA_DIR, data.dir);
  await fs.mkdir(dir, { recursive: true });

  await (() => {
    const body = metaConverter.encode({
      name,
      link,
    });
    return fs.writeFile(path.join(dir, MANGA_META_FILENAME), body);
  })();

  await fs.rename(image.path, path.join(dir, MANGA_COOVER));

  res.send({ message: "OK" });
}

export const removeManga = async (req, res) => {
  const { params } = req;

  const dir = path.join(MANGA_DIR, params.dir);

  try {
    await fs.rm(dir, { recursive: true, force: true });
    res.send({ message: "success" });
  } catch (err) {
    console.error(err);
    res.send({ message: "failed" });
  }
}

export const getMangaInfo = async (req, res) => {
  const { dir } = req.params;
  const dirPath = path.join(MANGA_DIR, dir);

  const infoContent = await fs.readFile(path.join(dirPath, MANGA_META_FILENAME), "utf-8");
  const { name } = metaConverter.decode(infoContent)

  res.send({
    name,
    image: getMangaImage(req, dir),
    chapters: [],
  });
}

export const getMangaCover = async (req, res) => {
  const filePath = path.join(MANGA_DIR, req.params.dir, MANGA_COOVER);
  const isExist = mainFs.existsSync(filePath);

  if (!isExist) {
    res.writeHead(404, {
      "Content-Type": "text/plain"
    });
    res.end("404 Not Found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": "image/jpg"
  });

  const content = await fs.readFile(filePath);
  res.end(content);
}
