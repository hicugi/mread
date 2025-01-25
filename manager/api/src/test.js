import fs from "fs";
import path from "path";

import { getMangaDir } from "./helper/general.js";

const mainDir = getMangaDir();

console.log(`Manga dir: ${mainDir}`);

const items = fs.readdirSync(mainDir).filter((d) => d[0] !== ".");

const format = (d) => {
  const ar = d.split("-");
  if (ar.length === 1) {
    return Number(d);
  }

  return ar[0] + ar[1] / 100000;
};
items.sort((a, b) => format(b) - format(a));

items.forEach((dir) => {
  const chapterPath = path.join(mainDir, dir);
  const donePath = path.join(chapterPath, "done");

  if (!fs.existsSync(donePath)) {
    console.log(`${chapterPath} Unfinhed chapter ${dir}`);
    return;
  }

  const images = fs.readdirSync(chapterPath).filter((f) => {
    if (f[0] === ".") return false;

    const stat = fs.statSync(path.join(chapterPath, f));
    return stat.size === 0;
  });

  if (images.length === 0) return;

  console.log(`${chapterPath} Some images is empty`, images.length);
});
