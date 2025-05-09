import https from "https";
import path from "path";
import fs from "fs";

import { getArgs, getConfig, setupBrowser, sleep } from "./helper/general.js";

const ATTEMPS_TO_WAIT = 10;
const ATTEMPT_DELAY = 20;
const RETRY_LIMIT = 10;
const getDonePath = (dir) => path.resolve(`${dir}/.done`);

const formatImgLink = (url) => {
  return url.replace(/(#|\?).*$/, "");
};

const downloadImages = async (url, dirPath, config) => {
  const { page, browser, goTo } = await setupBrowser();

  let images = [];
  let imagesDownloaded = {};
  let downloadedImgCount = 0;

  let isBodyReady = false;
  let responseCount = 0;

  if (config.isDirectDownload) {
    responseCount = 1;

    const inetrval = setInterval(() => {
      if (!isBodyReady) return;
      clearInterval(inetrval);

      responseCount = images.length;

      for (let imgUrl of images) {
        const imgIndex = images.findIndex((img) => img === imgUrl);

        const fileName = formatImgLink(imgUrl);
        const filePath = `${dirPath}/${imgIndex + 1}${fileName.substring(
          fileName.lastIndexOf("."),
        )}`;

        https.get(imgUrl, (res) => {
          const fileStream = fs.createWriteStream(filePath);
          res.pipe(fileStream);

          res.on("end", () => {
            imagesDownloaded[imgUrl] = true;

            downloadedImgCount += 1;
            responseCount -= 1;
            fileStream.close();
          });
        });
      }
    }, 300);
  } else {
    page.on("response", async (response) => {
      const fileUrl = response.url();
      const imgUrl = formatImgLink(fileUrl);

      const matches = /.*\.(jpg|jpeg|png|gif|webp)$/i.exec(imgUrl);

      if (!matches || matches.length !== 2) return;

      const inetrval = setInterval(async () => {
        if (!isBodyReady) return;
        clearInterval(inetrval);

        const imgIndex = images.findIndex((img) => img === imgUrl);

        if (imgIndex === -1) {
          return;
        }

        const filePath = `${dirPath}/${imgIndex + 1}.${imgUrl.substring(
          imgUrl.lastIndexOf(".") + 1,
        )}`;
        if (!fs.existsSync(filePath)) {
          const content = await response.buffer();

          if (content === "") {
            const error = new Error(`Couldn't download image from ${imgUrl}`);
            Object.assign(error, {
              count: downloadedImgCount,
              total: images.length,
            });
            throw error;
          }

          await fs.writeFile(filePath, content, "base64");
        }

        imagesDownloaded[imgUrl] = true;

        downloadedImgCount += 1;
        responseCount -= 1;
      }, 300);
    });
  }

  await goTo(page, url);

  if (config.getImagesFn !== undefined) {
    images = await config.getImagesFn(page);
  } else {
    await sleep(500);
    const domLinks = await page.evaluate(
      (sel) =>
        Array.from(document.querySelectorAll(sel), (img) =>
          img.getAttribute("src").trim(),
        ),
      config.images,
    );

    const list = new Set();
    for (const link of domLinks) {
      const imgUrl = formatImgLink(link);
      if (!imgUrl) continue;
      list.add(encodeURI(imgUrl));
    }
    images = Array.from(list);
  }

  if (!config.isDirectDownload) {
    responseCount = images.length;
  }

  isBodyReady = true;
  console.log("Images to download:", images.length);

  if (config.scrollToBottom) {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  let attempsCount = 0;
  let prevDownloadedImgCount = 0;
  await new Promise((resolve) => {
    const interval = setInterval(async () => {
      console.log(
        `Waiting for responses... ${responseCount} images left, ${attempsCount} attemps`,
      );

      if (responseCount === 0) {
        clearInterval(interval);
        resolve();
        return;
      }

      if (prevDownloadedImgCount !== downloadedImgCount) {
        attempsCount = 0;
      }
      prevDownloadedImgCount = downloadedImgCount;

      if (
        attempsCount <= ATTEMPS_TO_WAIT &&
        downloadedImgCount !== images.length
      ) {
        await sleep(1000);
        attempsCount += 1;
        return;
      }

      clearInterval(interval);
      resolve();
    }, ATTEMPT_DELAY * 1000);
  });

  if (downloadedImgCount !== images.length) {
    for (const img of images) {
      if (!imagesDownloaded[img]) {
        console.log(`- ${img}`);
      }
    }

    throw new Error(
      `Some images are missing. Got ${downloadedImgCount} of ${images.length}`,
    );
  }

  fs.writeFileSync(getDonePath(dirPath), Buffer.from(String(images.length)));

  await browser.close();
};

export const downloadChapter = async (url, meta, socketSend) => {
  let dir;

  if (meta.formatChapter) {
    dir = meta.formatChapter(url);
  } else {
    dir = url.replace(/\/$/, "");
    dir = dir.substring(dir.lastIndexOf("/") + 1).replace("chapter-", "");
  }

  const dirPath = path.join(meta.mangaDir, dir);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  if (fs.existsSync(getDonePath(dirPath))) {
    return null;
  }

  for (let i = 0; i < RETRY_LIMIT; i++) {
    try {
      await downloadImages(url, dirPath, meta);
      return true;
    } catch (error) {
      const { count, total } = error;
      socketSend({
        status: `Some images missing: ${count} from ${total}. try ${i + 1} of ${RETRY_LIMIT}`,
      });
    }
  }

  throw new Error(`Coudn't get ${total - count} images`);
};

