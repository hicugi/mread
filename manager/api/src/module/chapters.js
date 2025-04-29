import { MANGA_CHAPTERS, domain } from "../config.js";
import { openPage } from "../module/browser.js";

/**
 * @param {string} regx
 * @param {function} handler
**/
export const getChapters = async (link) => {
  const { origin, chapters } = domain.get(link);

  let data = [];
  const selector = (sel) => Array.from(document.querySelectorAll(sel), (a) => a.getAttribute("href"));

  if (typeof chapters === "string") {
    data = await openPage(link, [selector, chapters]);
  } else {
    data = await openPage(link, [selector, chapters.selector], { activateScroll: true });

    if (chapters.attachDomain) {
      data = data.map((v) => [origin, v].join(""));
    }
  }

  return data;
}

