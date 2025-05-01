import { MANGA_CHAPTERS, domain } from "../config.js";
import { openPage } from "../module/browser.js";

/**
 * @param {string} regx
 * @param {function} handler
**/
export const getChapters = async (link) => {
  const { origin, chapters } = domain.get(link);
  const isString = typeof chapters === "string";

  const evaluate = (sel) => Array.from(document.querySelectorAll(sel), (a) => a.getAttribute("href"));

  const selector = isString ? chapters : chapters.selector;
  const browserOptions = {
    activateScroll: true,
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
  };

  let data = await openPage(link, [evaluate, selector], browserOptions);

  if (!isString) {
    if (chapters.attachDomain) {
      data = data.map((v) => [origin, v].join(""));
    }
  }

  return data;
}

