<script setup>
import { ref, computed, defineProps, inject, useTemplateRef, onMounted } from "vue";

import MangaHeader from "./header.vue";
import ChapterList from "./chapterList.vue";
import ChapterControls from "./chapter/controls.vue";
import UiButton from "../ui/Button.vue";
import ChapterImage from "./chapter/images.vue";

import { api } from "../../api";
import { fetchImages, isApp } from "../../helper/main.js";

const myElm = useTemplateRef("myElm");
const props = defineProps({
  info: {
    name: String,
    alias: String,
    image: String,
    chapter: String,
  },
  chapters: Array,
  downloading: Boolean,
});

const chaptersList = ref([]);
const selectedChapter = ref(null);
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

function handleRemoveManga() {
  if (confirm("Delete every chapter for current manga?")) {
    flRemoveManga.postMessage(props.info.alias);
  }
}

const $emit = defineEmits(["back", "download"]);

async function download(list) {
  const { alias, name, image, } = props.info;

  $emit("download", {
    name,
    alias,
    image,
    chapters: list,

    callback: async () => {
      if (!myElm || selectedChapter) return;

      flFetchMangaList.postMessage("");
      await new Promise((ok) => setTimeout(ok, 300));

      flSelectManga.postMessage(mangaAlias);
    }
  });
}

window.flInsertImage = (imageBase64) => {
  if (!myElm) return;
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
  if (props.downloading) {
    alert("Previous download isn't complete");
    return;
  }

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

onMounted(() => {
  const mangaAlias = props.info.alias;

  if (isApp) {
    flSelectManga.postMessage(mangaAlias);
  }

  api.get(`/chapters/${mangaAlias}`).then((data) => {
    chaptersList.value = data.reverse();
  });
});
</script>

<template>
  <div ref="myElm" v-show="!selectedChapter">
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
</template>

<style>
.c-details__controls {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
</style>
