import path from "path";
import mainFs from "fs";
import fs from "fs/promises";

import { MANGA_DIR, MANGA_META_FILENAME, MANGA_COOVER, MANGA_CHAPTERS, MANGA_CHAPTER_DONE } from "../config.js";
import metaConverter from "../helper/metaConverter.js";
import { getMangaImage, getChapterNumber } from "../helper/manga.js";
import { getInfo, getImages } from "../module/manga.js";
import { getChapters } from "../module/chapters.js";
import { activeConnect } from "../module/network.js";

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
  const { name, image, dirPath } = await getInfo(req, dir);

  const chaptersFile = path.resolve(dirPath, MANGA_CHAPTERS);
  const content = await fs.readFile(chaptersFile, "utf-8").catch(() => null);

  const chapters = [];
  (content ? content.split(",") : []).forEach((item) => {
    let label = item.split("/").at(-1);
    label = label.replace(/^(\w|_|-)/ig, "");

    const donePath = path.resolve(dirPath, label, MANGA_CHAPTER_DONE);
    let isDownloaded = false;
    try {
      isDownloaded = Boolean(mainFs.statSync(donePath));
    } catch {}

    chapters.push({
      label,
      num: getChapterNumber(label),
      remoteLink: item,
      isDownloaded,
    });
  });

  chapters.sort((a,b) => b.num - a.num);

  res.send({
    name,
    image,
    chapters,
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

export const mangaDownloadChapters = async (req, res) => {
  const { dir } = req.params;
  const { link, dirPath } = await getInfo(req, dir);

  const list = await getChapters(link);

  const filePath = path.resolve(dirPath, MANGA_CHAPTERS);
  await fs.writeFile(filePath, list.join(","));

  res.send(list);
}

export const mangaDownloadImages = async (req, res) => {
  const { dir } = req.params;
  const { label, link } = req.query;

  const { dirPath } = await getInfo(req, dir);
  const chapterPath = path.resolve(dirPath, label);
  const donePath = path.resolve(chapterPath, MANGA_CHAPTER_DONE);

  const sendMessage = activeConnect(req, res);

  const successResponse = (data = []) => {
    sendMessage({
      status: "ok",
      data,
    });
    res.end();
  }

  if (await fs.stat(donePath).catch(() => false)) {
    successResponse();
    return;
  }

  await fs.mkdir(chapterPath).catch(() => null);

  sendMessage({
    status: "created dir is ready",
    data: { path: chapterPath },
  });

  const list = await getImages(chapterPath, link, (status, data = {}) => {
    sendMessage({
      status,
      data
    });
  });
  await fs.writeFile(donePath, "");

  successResponse(list);
}
