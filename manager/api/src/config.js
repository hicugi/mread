import path from "path";

export const MANGA_DIR = path.resolve("./export");
export const MANGA_META_FILENAME = ".meta";
export const MANGA_COOVER = ".cover.jpg";
export const MANGA_CHAPTERS = ".chapters";
export const MANGA_CHAPTER_DONE = ".done";

export const domain = {
  // en
  "coffeemanga.io": {
    chapters: ".wp-manga-chapter a[href]",
    images: ".reading-content .page-break > img",
  },
  "greatestestatedeveloper.com": {
    chapters: ".su-expand-content .su-posts a",
    images: "#main .separator img",
    formatChapter: (chapter) => {
      const res = chapter.match(/chapter-(.+?)\//);
      return res ? res[1] : chapter;
    },
  },
  "www.webtoons.com": {
    chapters: ".detail_lst ul a",
    pagination: ".paginate a",
    paginationMatch: /page=/,

    formatChapter: (chapter) => {
      const res = chapter.match(/episode-(\d+)/);
      return res ? res[1] : chapter;
    },

    images: "#_imageList img",
    scrollToBottom: true,
  },
  "ciorti.online": {
    chapters: "#chapters-list a[href]",
    images: "body > .main-width > .imgholder[src]",

    formatChapter: (chapter) => {
      const v = chapter.match(/chapter=(.+)/);
      return v ? v[1] : chapter;
    },
  },
  "www.mangaread.org": {
    chapters: ".page-content-listing .main a[href]",
    images: ".reading-content img[id^='image']",
  },
  "demonicscans.org": {
    chapters: {
      selector: "#chapters-list a[href]",
      attachDomain: true,
      labelMatch: /&chapter=(\d+)/,
    },
    images: "body > .main-width.center-m > img",
  },

  // ru
  "remanga.org": {
    chapters: "[class^='Chapters_container'] a[href]",
    images: "main [class^='Image_placeholder'] #chapter-image",
  },
  "zz.readmanga.io": {
    chapters: "[class^='Chapters_container'] a[href]",
    images: "main [class^='Image_placeholder'] #chapter-image",
  },
  "readmanga.live": {
    chapters: "#chapters-list a[href]",
    images: "#fotocontext .manga-img-placeholder > img[src]",
    isDirectDownload: true,

    formatChapter: (link) => {
      return link.replace(/.+vol/, "").replace("/", "-");
    },
    getImagesFn: async (page) => {
      const html = await page.content();

      const BEFORE = "readerDoInit(";
      let content = html.substring(html.indexOf(BEFORE) + BEFORE.length);
      content = content.substring(content.indexOf("["));
      content = content.substring(0, content.indexOf("]]") + 2);

      let items;
      eval(`items = ${content}`);

      return items.map((el) => el[0] + el[2]);
    },
  },

  "mangalib.me": {
    chapters: {
      selector: ".vue-recycle-scroller__item-view a",
      attachDomain: true,
      activateScroll: true,
    },
    images: {
      selector: "main img",
      nextPageClick: "main [data-page]:first-child",
      nextPageCheck: (sel) => ({
        current: document.querySelector("footer select").value,
        total: document.querySelector("footer select option:last-child").value,
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
};
