import path from "path";
import fs from "fs";
import { MANGA_DIR } from "../config.js";

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
  const items = await fs.promises.readdir(mainPath).catch(() => []);

  if (!items.length) {
    notFoundResponse();
    return;
  }

  const result = items
    .filter((d) => !d.includes("."))
    .map((d) => {
      const chapterPath = path.join(mainPath, d);
      const items = fs.readdirSync(chapterPath);

      const size = (() => {
        const n = items.reduce((res, item) => {
          const file = path.join(chapterPath, item);
          const { size } = fs.statSync(file);
          return res + size;
        }, 0);

        return (n / 1024 / 1024).toFixed(2) + "MB";
      })();

      return {
        name: d,
        itemsCount: items.length,
        size,
      };
    });

  const formatName = (d) => {
    const ar = d.split("-");
    if (ar.length === 1) {
      return Number(d);
    }

    return ar[0] + ar[1] / 100000;
  };

  result.sort((a, b) => formatName(a.name) - formatName(b.name));

  res.send(result);
};
