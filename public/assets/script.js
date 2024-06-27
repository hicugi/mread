const mangaSectionElm = document.querySelector("#mangaSection");
const chapterSectionElm = document.querySelector("#chapterSection");

const chaptersListElm = document.querySelector("#chaptersList");
const chaptersSelElm = document.querySelector("#chaptersSelector");
const chaptersDownloadAll = document.querySelector("#btnDownloadAll");

const imagesSectionElm = document.querySelector("#imagesSection");
const imagesElm = document.querySelector("#images");
const alertElm = document.querySelector("#alert");

const isWebVersion = typeof flSyncManga === "undefined";

window.scrollToTop = () => {
  const top = chapterSectionElm.offsetTop - 30;
  window.scrollTo({ top, behavior: "smooth" });
};

window.fetchChapters = (name) => {
  const url = `/chapters/${name || this.name}`;
  return fetch(url).then((res) => res.json());
};
window.fetchImages = (name, chapter) => {
  const url = `/images/${name}/${chapter}`;
  return fetch(url).then((res) => res.json());
};

window.currentManga = {
  name: null,
  chapters: {},

  select(alias) {
    this.alias = alias;

    alertElm.innerText = "";
    chapterSectionElm.style.display = "block";
    imagesSectionElm.style.display = "none";
    imagesElm.innerText = "";

    chaptersSelElm.innerHTML =
      "<option selected disabled>Select a chapter</option>";

    if (isWebVersion) {
      fetchChapters(alias).then((chapters) => {
        for (const chapter of chapters) {
          insertChapter(alias, chapter);
        }
      });
    } else {
      flSelectManga.postMessage(alias);
    }
  },

  selectChapter(chapter) {
    const data = [this.alias, chapter].join("|");

    imagesElm.innerHTML = "";
    chapterSectionElm.style.display = "none";
    imagesSectionElm.style.display = "block";

    scrollToTop();

    if (!isWebVersion) {
      flSelectChapter.postMessage(data);
      return;
    }

    fetchImages(this.alias, chapter).then((images) => {
      for (const image of images) {
        insertImage(image);
      }
    });
  },
};

window.insertManga = (info) => {
  const { name, image } = info;
  const contentName = name.replace(/-/g, " ");

  const manga = document.createElement("div");
  manga.classList.add("c-cover");
  manga.addEventListener("click", () => currentManga.select(name));

  const img = document.createElement("img");
  img.src = image;
  img.alt = contentName;
  manga.appendChild(img);

  const title = document.createElement("h3");
  title.innerText = contentName;
  manga.appendChild(title);

  const btn = document.createElement("button");
  btn.innerText = "download";
  title.appendChild(btn);

  btn.addEventListener("click", () => downloadManga(name));

  document.querySelector("#mangaList").appendChild(manga);
};
window.insertChapter = (alias, chapter) => {
  const { name, itemsCount, size, isDownloaded } = chapter;
  currentManga.chapters[name] = chapter;

  const chapterExists = chaptersListElm.querySelector(`[name="${name}"]`);
  if (chapterExists) {
    if (isDownloaded) {
      chapterExists.classList.add("c-chapter--downloaded");
    }
    return;
  }

  // insert into list
  (() => {
    const listElm = document.createElement("tr");
    listElm.setAttribute("name", name);
    listElm.classList.add("c-chapter");
    chaptersListElm.appendChild(listElm);

    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    [td1, td2].forEach((elm) => listElm.appendChild(elm));

    if (isDownloaded) {
      listElm.classList.add("c-chapter--downloaded");
    }

    // link
    (() => {
      const link = document.createElement("button");
      td1.appendChild(link);

      link.classList.add("c-chapter__link");
      link.innerText = `Chapter ${name} | ${itemsCount}`;

      link.addEventListener("click", () => {
        chaptersSelElm.value = name;
        currentManga.selectChapter(name);
      });
    })();

    // download button
    (() => {
      const downloadBtn = document.createElement("button");
      td2.appendChild(downloadBtn);

      downloadBtn.classList.add("c-chapter__dbtn");
      downloadBtn.innerText = size;

      downloadBtn.addEventListener("click", () => {
        downloadChapter(alias, name);
      });
    })();
  })();

  // insert into selector
  (() => {
    const elm = document.createElement("option");

    elm.value = name;
    elm.innerText = name;

    chaptersSelElm.appendChild(elm);
  })();
};
window.insertImage = (image) => {
  const img = document.createElement("img");
  img.src = image;
  imagesElm.appendChild(img);
};

window.downloadManga = (name) => {
  fetchChapters(name).then(async (chapters) => {
    for (const chapter of chapters) {
      await downloadChapter(name, chapter);
      await new Promise((ok) => setTimeout(ok, 2048));
    }
  });
};
window.downloadChapter = async (name, chapter) => {
  const images = await fetchImages(name, chapter);

  console.log(`Downloading ${name} - ${chapter}`);

  for (const image of images) {
    const data = [
      `manga/${image}`,
      name,
      chapter,
      image.replace(/.*\//, ""),
      images.lenngth,
    ].join("|");

    flDownloadImage.postMessage(data);
  }
};

chaptersSelElm.addEventListener("change", (e) => {
  currentManga.selectChapter(e.target.value);
});
chaptersDownloadAll.addEventListener("click", () => {
  downloadManga(currentManga.name);
});

const getSelectedOptionIndex = () => chaptersSelElm.options.selectedIndex;
document.querySelector("#navPrev").addEventListener("click", () => {
  const index = getSelectedOptionIndex();
  const prevChapter = chaptersSelElm.options[index - 1];

  if (index - 1) return;

  chaptersSelElm.value = prevChapter.value;
  currentManga.selectChapter(prevChapter.value);
});
document.querySelector("#navNext").addEventListener("click", () => {
  const index = getSelectedOptionIndex();
  const nextChapter = chaptersSelElm.options[index + 1];

  if (!currentManga.chapters[nextChapter.value]) return;

  chaptersSelElm.value = nextChapter.value;
  currentManga.selectChapter(nextChapter.value);
});

// Flutter
window.handleSync = async () => {
  const list = await fetch("/list").then((res) => res.json());

  list.forEach((info) => {
    const { name, image } = info;

    insertManga(info);

    if (!isWebVersion) {
      flSyncManga.postMessage(`${name}|${image}`);
    }
  });
};

window.afterLoadApp = () => {
  handleSync();
};

if (isWebVersion) {
  afterLoadApp();
} else {
  document.body.classList.add("is-flutter");
}
