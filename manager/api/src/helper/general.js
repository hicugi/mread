import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";

import { domain } from "../config.js";

const EXPORT_DIR = "export";
const HEADLESS = "new";
const NETWORK_PARPAM =
  // "networkidle2";
  "domcontentloaded";

export const getArgs = () => {
  let [, , dir, argUrl, ...list] = process.argv;
  if (argUrl && argUrl[0] === '"') {
    argUrl = argUrl.substring(1, argUrl.length - 1);
  }

  if (dir === undefined) {
    const list = fs.readdirSync(EXPORT_DIR).filter((d) => d[0] !== ".");

    console.log("========================================================");
    console.log("");
    console.log(
      'Example usage: node . manga-name "https://manga-url.net".\nManga list:'
    );
    list.forEach((d) => console.log(`--- ${d}`));
    console.log("");
    console.log("========================================================");
    throw new Error("Please provide manga dir");
  }

  const argParams = {};
  for (let str of list) {
    const key = str.substring(0, str.indexOf("="));
    const val = str.substring(str.indexOf("=") + 1).replace(/^("|')$/g, "");

    argParams[key] = val;
  }

  return [dir, argUrl, argParams];
};

export const getMangaDir = () => {
  const [dir] = getArgs();
  return path.join(EXPORT_DIR, dir);
};

export const getConfig = () => {
  const [, url] = getArgs();

  const pageUrl = new URL(url);
  const result = domain[pageUrl.host];

  Object.assign(result, {
    origin: pageUrl.origin,
    url: pageUrl,

    mangaDir: getMangaDir(),
  });

  return result;
};

export const getFullLink = (value, origin) => {
  if (value.match(/^https?\:\/\//)) {
    return value;
  }

  return `${origin}/${value.replace(/^\//, "")}`;
};

export const setupBrowser = async () => {
  const browser = await puppeteer.launch({ headless: HEADLESS });

  const page = await browser.newPage();
  const session = await page.target().createCDPSession();
  const { windowId } = await session.send("Browser.getWindowForTarget");
  await session.send("Browser.setWindowBounds", {
    windowId,
    bounds: {},
    // bounds: { windowState: "minimized" },
  });

  return {
    browser,
    page,

    goTo: async (page, url) => {
      return await page.goto(url, {
        waitUntil: NETWORK_PARPAM,
        timeout: 0,
      });
    },
  };
};
export const sleep = (t) => new Promise((ok) => setTimeout(ok, t));
