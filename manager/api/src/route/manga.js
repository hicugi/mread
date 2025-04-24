import fs from "fs";
import path from "path";

import {
  getArgs,
  getFullLink,
  getMangaDir,
  setupBrowser,
  sleep,
  EXPORT_DIR,
} from "../helper/general.js";
import { downloadChapter } from "../chapterDownloader.js";
import { domain } from "../config.js";

const [, argUrl, argParam] = getArgs();

const mainDirPath = getMangaDir();
const chaptersTempPath = path.join(mainDirPath, "chapters.json");

fs.mkdirSync(mainDirPath, { recursive: true });

const getChapters = async (meta) => {
  const url = meta.url.href;

  if (meta.paginationMatch && fs.existsSync(chaptersTempPath)) {
    return JSON.parse(fs.readFileSync(chaptersTempPath));
  }

  const getChapterLinks = async (url) => {
    const { page, browser, goTo } = await setupBrowser();
    await goTo(page, url);

    const data = await page.evaluate(
      (sel) =>
        Array.from(document.querySelectorAll(sel), (a) =>
          a.getAttribute("href")
        ),
      meta.chapters
    );

    await new Promise((ok) => {
      const interval = setInterval(() => {
        if (data.length !== 0) {
          clearInterval(interval);
          ok();
        }
      }, 300);
    });

    await browser.close();

    return data.map((v) => getFullLink(v, meta.origin));
  };

  if (!meta.pagination) {
    return getChapterLinks(url);
  }

  const pages = [url];
  const memoPages = {};
  const result = new Set();

  console.log("\nStarting to read pages...");

  const getPaginationLinks = async (url) => {
    const { page, browser, goTo } = await setupBrowser();
    await goTo(page, url);

    const data = await page.evaluate(
      (sel) =>
        Array.from(document.querySelectorAll(sel), (a) =>
          a.getAttribute("href")
        ),
      meta.pagination
    );

    await browser.close();

    return data
      .filter((link) => link.match(meta.paginationMatch))
      .map((v) => getFullLink(v, meta.origin));
  };

  while (pages.length) {
    const pageUrl = pages.shift();

    if (memoPages[pageUrl]) {
      continue;
    }
    memoPages[pageUrl] = true;

    console.log(`- reading page: ${pageUrl}`);

    const chapterLinks = await getChapterLinks(pageUrl);
    for (const link of chapterLinks) {
      result.add(link);
    }

    const nextPageLinks = await getPaginationLinks(pageUrl);
    pages.push(...nextPageLinks);
  }

  const arrResult = Array.from(result);

  if (meta.paginationMatch) {
    fs.writeFile(
      chaptersTempPath,
      JSON.stringify(arrResult, null, 2),
      () => {}
    );
  }

  return arrResult;
};

export async function getMetaData(name) {
  const mangaDir = path.resolve(`${EXPORT_DIR}/${name}/.info`);

  const infoFilePath = path.resolve(`${mangaDir}/.info`);
  if (!fs.existsSync(mangaDir)) {
    const error = new Error("Manga dir doesn't exist");
    throw error;
  }

  const { url } = result;

  const pageUrl = new URL(url);
  const result = domain[pageUrl.host];

  return Object.assign({
    name,
    origin: pageUrl.origin,
    url: pageUrl,

    mangaDir,
  }, result);
}

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.after
 * @param {string} params.before
 */
export const downloadManga = async (params, socketSend) => {
  const { name } = params;

  socketSend({
    title: `Downloading ${name}`,
    status: "Getting meta data",
    clear: true,
  });

  try {
    const meta = await getMetaData(name);
  } catch (error) {
    socketSend({
      content: [
        err.description,
        `Error message: ${err.message}`,
      ].join("\n")
    });
    return;
  }

  // Display meta data
  (() => {
    const content = [];
    for (const key in meta) {
      content.push(`${key}: ${JSON.stringify(meta[key])}`);
    }
    socketSend({ content: content.join("\n") });
  })();

  socketsend({
    status: "Getting chapters",
  });

  const chapters = await getChapters(meta);
  chapters.reverse();

  socketsend({
    status: `${chapters.length} chapters left`,
    chapters,
  });

  let isActivated = params.after === undefined;
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];

    socketSend({
      status: `${chapters.length - i} chapters left`,
      index: i,
    });

    isActivated = isActivated || chapter.includes(argParam.after);
    if (!isActivated) continue;

    try {
      await downloadChapter(chapter, meta);
    } catch(error) {
      socketSend({
        content: chapter + "\nError: " + error?.message,
        errorIndex: i,
      });
    }

    if (argParam.before && chapter.includes(argParam.before)) break;
  }
}
