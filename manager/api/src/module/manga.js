import path from "path";
import fs from "fs/promises";
import fsMain from "fs";
import https from "https";

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

  update("started");

  const options = {
    onResponse: async (res) => {
      const url = formatImgLink(res.url());
      if (!(/.*\.(jpg|jpeg|png|gif|webp)$/i.test(url))) return;

      await waitFor(() => imagesResponse.isReady);

      if (imagesResponse[url] === undefined) return;

      const isOk = await res.finished().then(() => true).catch(() => false);
      if (!isOk) return;

      const fileName = imagesList.indexOf(url);
      const filePath = path.resolve(dir, String(fileName));
      const content = await res.body()
        .catch((error) => {
          console.warn(url + ": couldn't download through onResponse err " + error?.message);
          return downloadFromUlr(url, filePath);
        })
        .catch((err) => {
          console.log(filePath + ": couldn't download throught https request");
          console.error(err);
          return null;
      });

      if (content === null) return;
      if (!(content === true)) {
        await fs.writeFile(filePath, content, "base64");
      }

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

  imagesList = await (async () => {
    const querySelector = images;

    if (images.nextPageClick) {
      Object.assign(options, images);
    }

    const selector = (sel) => Array.from(document.querySelectorAll(sel?.selector ?? sel), (elm) => {
      if (sel.lookByHttp) {
        let s = elm.outerHTML;
        s = s.substring(s.indexOf('http'));

        let i = Infinity;
        if (s.indexOf(" ") != -1) i = Math.min(i, s.indexOf(" "));
        if (s.indexOf('"') != -1) i = Math.min(i, s.indexOf('"'));
        if (s.indexOf("'") != -1) i = Math.min(i, s.indexOf("'"));

        return s.substring(0, i);
      }

      return elm.getAttribute("src");
    });

    const res = await openPage(link, [selector, querySelector], options);
    return res.map(formatImgLink);
  })();

  if (imagesList.length === 0) {
    isFinished = true;
    throw new Error("Images not found");
  }

  for (const image of imagesList) {
    imagesResponse[image] = false;
  }
  imagesResponse.isReady = true;

  update("got body", { list: imagesList, wiatingForResponse: imagesResponse });

  // scroll down for every 2 sec to load more images
  const interval = setInterval(async () => {
    if (isFinished) {
      clearInterval(interval);
      return;
    }

    try {
      const { page } = options;
      await page.keyboard.press("PageDown");
    } catch {
      clearInterval(interval);
    }
  }, 2000);

  // reload page after 1 min
  const interval2 = setInterval(async () => {
    if (isFinished) {
      clearInterval(interval2);
      return;
    }

    try {
      const { page } = options;
      await page.reload();
    } catch {
      clearInterval(interval2);
    }
  }, 60 * 1000);

  await waitFor(() => {
    let count = 0;
    for (const image of imagesList) {
      count += imagesResponse[image] === false;
    }

    return count == 0;
  }, 1000);

  return imagesList;
}
