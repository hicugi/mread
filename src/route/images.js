import path from "path";
import fs from "fs/promises";
import { MANGA_DIR } from "../config.js";

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
