import path from "path";

export const MANGA_DIR = path.resolve("./export");
export const MANGA_META_FILENAME = ".meta";
export const MANGA_COOVER = ".cover.jpg";
export const MANGA_CHAPTERS = ".chapters";
export const MANGA_CHAPTER_DONE = ".done";

export const domain = {
  "example.com": {
    // Selector for getting lik of chapters
    chapters: "main ul a[href]",
    // Selector for getting URL of images
    images: "main section > img[src]",
  },

  // Extra features
  "example-with-scroll.com": {
    chapters: "main ul a[href]",
    images: "main section > img[src]",

    // Some sites have pagination for gettin all chapters.
    // Next feature will simulate clicking on "next page"
    pagination: ".paginate a[href]",
    paginationMatch: /page=/,

    // formatChapter callback for rewriting filenames by chapter URL
    formatChapter: (url) => {
      const res = url.match(/chapter-(.+?)\//);
      return res ? res[1] : chapter;
    },

    // Some images load only after scrolling and capturing screen view.
    // scrollToBottom will simulate scrolling
    scrollToBottom: true,

    // Some sites save images in JavaScript array
    getImagesFn: async (page) => {
      const html = await page.content();

      const BEFORE = "var images=[";
      let content = html.substring(html.indexOf(BEFORE) + BEFORE.length - 1);
      content = content.substring(0, content.indexOf("];") + 1);

      let items;
      eval(`items = ${content}`);

      return items.map((el) => el.url);
    },

    // Some sites load images only after clicking into "next page".
    images: {
      selector: "main section > img[src]",
      nextPageClick: "main nav button:last-child",
      nextPageCheck: () => ({
        current: document.querySelector("footer nav li.current a").innerText,
        total: document.querySelector("footer nav li:last-child a").innerText,
      }),
    },
  },

  get(url) {
    const urlData = new URL(url);
    const res = this[urlData.host];

    Object.assign(res, {
      origin: urlData.origin,
      host: urlData.host,
    });

    return res;
  },
}
