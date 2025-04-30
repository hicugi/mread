import path from "path";
import fs from "fs/promises";

import { MANGA_DIR, MANGA_META_FILENAME, MANGA_COOVER, domain } from "../config.js";
import metaConverter from "../helper/metaConverter.js";
import { getMangaImage } from "../helper/manga.js";
import { openPage } from "../module/browser.js";

export const getInfo = async (req, dir) => {
  const dirPath = path.join(MANGA_DIR, dir);

  const infoContent = await fs.readFile(path.join(dirPath, MANGA_META_FILENAME), "utf-8");
  const { name, link } = metaConverter.decode(infoContent)

  return {
    name,
    link,
    image: getMangaImage(req, dir),
    dirPath,
  };
}

const formatImgLink = (url) => url.replace(/(#|\?).*$/, "").trim();
const waitFor = (ok, timeout = 300) => new Promise((resolve) => {
  let interval = setInterval(() => {
    if (!ok()) return;
    clearInterval(interval);
    resolve();
  }, timeout);
});

export const getImages = async (dir, link, update) => {
  const { images } = domain.get(link);

  let imagesList = [];
  const imagesResponse = {};
  let isFinished = false;
  let isGotImagesFromBody = false;

  update("started");

  const selector = (sel) => Array.from(document.querySelectorAll(sel), (a) => a.getAttribute("src"));
  const options = {
    onResponse: async (res) => {
      const url = formatImgLink(res.url());
      if (!(/.*\.(jpg|jpeg|png|gif|webp)$/i.test(url))) return;

      await waitFor(() => imagesResponse.isReady);

      if (imagesResponse[url] === undefined) return;

      await res.finished();

      const fileName = imagesList.indexOf(url);
      const filePath = path.resolve(dir, String(fileName));
      const content = await res.body();
      await fs.writeFile(filePath, content, "base64");

      imagesResponse[url] = true;

      let current = 0;
      for (const v of imagesList) {
        current += imagesResponse[v] == true;
      }

      update("got images", {
        current,
        total: imagesList.length,
      });

      isFinished = current === imagesList.length;
    },

    update,
    close: () => waitFor(() => isFinished),
  };

  if (typeof images === "string") {
    imagesList = await openPage(link, [selector, images], options);
  } else {
    if (images.nextPageClick) {
      Object.assign(options, images);
    }

    imagesList = await openPage(link, [selector, images.selector], options);
  }

  imagesList = imagesList.map(formatImgLink);

  for (const image of imagesList) {
    imagesResponse[image] = false;
  }
  imagesResponse.isReady = true;

  update("got body", { list: imagesList, wiatingForResponse: imagesResponse });

  await waitFor(() => {
    let count = 0;
    for (const image of imagesList) {
      count += imagesResponse[image] === false;
    }

    return count == 0;
  }, 1000);

  return imagesList;
}
