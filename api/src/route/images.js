import path from "path";
import mainFs from "fs";
import fs from "fs/promises";
import { MANGA_DIR, MANGA_COOVER } from "../config.js";

export const getCover = async (req, res) => {
  const filePath = path.join(MANGA_DIR, req.params.name, MANGA_COOVER);
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

export const getImages = async (req, res) => {
  const { name, chapter } = req.params;

  const notFoundResponse = () => {
    res.status(404);
    res.send({ message: "Not found" });
  };

  if (!name.match(/^[\w\-_]+$/)) {
    notFoundResponse();
    return;
  }

  const mainPath = path.join(MANGA_DIR, name, chapter);
  const items = await fs.readdir(mainPath).catch(() => []);

  if (!items.length) {
    notFoundResponse();
    return;
  }

  const result = items
    .filter((elm) => elm.match(/^\d/))
    .map((v) => `manga/${name}/${chapter}/${v}`);

  const format = (url) => {
    const fileName = url.split("/").pop();
    return fileName.replace(/\..+/, "");
  };
  result.sort((a, b) => format(a) - format(b));

  res.send(result);
};
