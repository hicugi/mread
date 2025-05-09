<script setup>
import { ref, computed, defineProps, inject, watch, onMounted, onUnmounted } from "vue";

import MangaHeader from "./header.vue";
import ChapterList from "./chapterList.vue";
import ChapterControls from "./chapter/controls.vue";
import UiButton from "../ui/Button.vue";
import ChapterImage from "./chapter/images.vue";

import { api } from "../../api";
import { fetchImages, isApp } from "../../helper/main.js";

const props = defineProps({
  info: {
    name: String,
    image: String,
    chapter: String,
  },
  chapters: Array,
});

const getUrl = inject("getUrl");

const chaptersList = ref([]);
const selectedChapter = ref(null);
const downloadStatus = ref({ current: 0, total: 0 });
const downloadImageStatus = ref({ current: 0, total: 0 });
const images = ref([]);

const chaptersList1 = computed(() => props.chapters);
const chaptersList2 = computed(() => {
  const skip = {};
  for (const item of props.chapters) {
    skip[item.name] = true;
  }

  return chaptersList.value.filter((item) => skip[item.name] === undefined);
});
const allChapters = computed(() => {
  const localItems = props.chapters;
  const onlineItems = chaptersList.value;

  if (!localItems.length) {
    return onlineItems;
  }
  if (!onlineItems.length) {
    return localItems;
  }

  const localKeys = {};
  for (const item of localItems) {
    localKeys[item.name] = true;
  }

  const filteredItems = onlineItems.filter(
    (item) => localKeys[item.name] === undefined
  );
  return [...localItems, ...filteredItems];
});
const lastReadChapter = computed(() => {
  return props.chapters.find((item) => item.isContinue);
});

const getProgressStyle = (obj) => {
  const { current, total } = obj;
  const val = ((current / (total / 100)) * 0.01).toFixed(5);

  return {
    transform: `scaleX(${val})`,
  }
}

const downloadProgressStyle = computed(() => {
  return getProgressStyle(downloadStatus.value);
});
const downloadImageProgressStyle = computed(() => {
  return getProgressStyle(downloadImageStatus.value);
});

function handleRemoveManga() {
  if (confirm("Delete every chapter for current manga?")) {
    flRemoveManga.postMessage(props.info.alias);
  }
}

async function download(list) {
  const mangaAlias = props.info.alias;
  downloadStatus.value.total = list.length;

  if (!props.chapters.length) {
    const imgUrl = getUrl(props.info.image);
    flSyncManga.postMessage([mangaAlias, props.info.name, imgUrl].join("|"));
  }

  for (const chapter of list) {
    const chapterName = chapter.name;

    if (!chapter || chapter.isDownloaded) {
      continue;
    }

    const data = await fetchImages(mangaAlias, chapterName);
    downloadImageStatus.value = {
      current: 0,
      total: data.length,
    };

    let imgIndex = 0;
    let loadingImagesCount = 0;

    window.flImageDownloaded = () => {
      loadingImagesCount -= 1;
      downloadImageStatus.value.current = downloadImageStatus.value.current + 1;
    };

    await new Promise((resolve) => {
      const imgsInterval = setInterval(() => {
        if (data[imgIndex] === undefined) {
          if (loadingImagesCount === 0) {
            downloadStatus.value.current = downloadStatus.value.current + 1;

            clearInterval(imgsInterval);
            resolve();
            return;
          }
          return;
        }

        if (loadingImagesCount >= 4) return;
        loadingImagesCount += 1;

        const url = getUrl(data[imgIndex]);
        const fileName = url.split("/").at(-1);
        imgIndex += 1;

        window.flDownloadImage.postMessage(
          [url, mangaAlias, chapterName, fileName, data.length].join("|")
        );
      }, 200);
    });
  }

  downloadStatus.value = {
    current: 0,
    total: 0,
  };

  flFetchMangaList.postMessage("");
  await new Promise((ok) => setTimeout(ok, 300));

  flSelectManga.postMessage(mangaAlias);
}

window.flInsertImage = (imageBase64) => {
  images.value.push(imageBase64);
};
function handleSelectChapter(data) {
  images.value = [];
  selectedChapter.value = data;

  const { alias } = props.info;
  const chapterName = data.name;
  const { isDownloaded } = data;

  if (isDownloaded) {
    setTimeout(() => {
      flInsertImgsFromChapter.postMessage([alias, chapterName].join("|"));
    }, 100);
    return;
  }

  fetchImages(alias, chapterName).then((data) => {
    images.value = data;
  });
}

function handleDownload(item) {
  const chapterName = item.name;
  const chapters = chaptersList.value;

  const list = (() => {
    if (chapterName === undefined) {
      return chapters;
    }

    const result = [];
    for (const elm of chaptersList2.value) {
      result.push(elm);
      if (elm.name === chapterName) break;
    }
    return result;
  })();

  const question = (() => {
    let count = list.length;
    if (count === chapters.length) {
      count = "all";
    }

    return `Download ${count} items? Select no for one chapter`;
  })();

  if (confirm(question)) {
    download(list);
    return;
  }

  const singleChapter = list.find((item) => item.name === chapterName);
  download([singleChapter]);
}
function backFromChapter() {
  selectedChapter.value = null;
}

const setOverflow = (val) => {
  document.body.style.overflow = val;
  document.querySelector("html").style.overflow = val;
}
watch(downloadStatus, (newVal, oldVal) => {
  if (!oldVal.total && newVal.total) {
    document.body.style.overflow = "hidden";
    setOverflow("hidden");
    return;
  }

  setOverflow("");
});

onMounted(() => {
  const mangaAlias = props.info.alias;

  if (isApp) {
    flSelectManga.postMessage(mangaAlias);
  }

  api.get(`/chapters/${mangaAlias}`).then((data) => {
    chaptersList.value = data.reverse();
  });
});

onUnmounted(() => {
  document.body.style.overflowY = "";
});

const $emit = defineEmits(["back"]);
</script>

<template>
  <div v-show="!selectedChapter">
    <MangaHeader :title="info.name" @back="$emit('back')" />

    <template v-if="chapters.length">
      <h2>On device:</h2>

      <div class="c-details__controls">
        <UiButton v-if="isApp" @click="handleRemoveManga">Remove manga</UiButton>
        <UiButton v-if="lastReadChapter" @click="handleSelectChapter(lastReadChapter)">Continue {{ lastReadChapter.name }}</UiButton>
      </div>

      <ChapterList
        key="listOnDevice"
        :items="chaptersList1"
        @select="handleSelectChapter"
        @download="handleDownload"
      />

      <h2 v-if="chaptersList2.length">Online:</h2>
    </template>

    <ChapterList
      key="listOnline"
      :items="chaptersList2"
      @select="handleSelectChapter"
      @download="handleDownload"
    />
  </div>

  <template v-if="selectedChapter">
    <MangaHeader
      :title="`${info.name} - ${selectedChapter.name}`"
      @back="backFromChapter"
    />

    <ChapterControls
      :key="selectedChapter.name"
      :value="selectedChapter.name"
      :items="allChapters"
      @select="handleSelectChapter"
    />
    <ChapterImage
      :key="selectedChapter.name"
      :images="images"
      @back="backFromChapter"
    />
  </template>

  <div v-if="downloadStatus.total" className="c-details__download">
    <div>
      {{ downloadStatus.current + " / " + downloadStatus.total }}
      <span :style="downloadProgressStyle" />
      <span :style="downloadImageProgressStyle" />
    </div>
  </div>
</template>

<style>
.c-details__controls {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.c-details__download {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 24px;
  line-height: 40px;
}
.c-details__download::before {
  z-index: -1;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #000000b3;
  content: "";
}

.c-details__download div {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 8px 0;
  border: 1px solid white;
  width: 80%;
  height: 40px;
  display: block;
  background-color: #4c4c4c;
  text-align: center;
}

.c-details__download span {
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  transform-origin: left center;
  transition: easy-out 0.2s;
  will-change: transform;
}
.c-details__download span:last-child {
  top: auto;
  bottom: 0;
  height: 10%;
  background-color: #fff;
}
</style>
