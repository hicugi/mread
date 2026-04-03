<script setup>
import { ref, computed, defineProps, inject, useTemplateRef, onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router'

import MangaHeader from "../../components/manga/header.vue";
import ChapterList from "./ChapterList.vue";
import ChapterControls from "../../components/manga/chapter/controls.vue";
import UiButton from "../../components/ui/Button.vue";

const route = useRoute()
const router = useRouter();
const store = inject("store");

import { api } from "../../api";
import { fetchImages, isApp } from "../../helper/main.js";

const myElm = useTemplateRef("myElm");

const info = ref({});
const chaptersList = ref([]);
const chaptersOnDevice = ref([]);
const selectedChapter = ref(null);
const images = ref([]);

const chaptersList1 = computed(() => chaptersOnDevice.value);
const chaptersList2 = computed(() => {
  const skip = {};
  for (const item of chaptersOnDevice.value) {
    skip[item.name] = true;
  }

  return chaptersList.value.filter((item) => skip[item.name] === undefined);
});

const getAllChapters = (local, online) => {
  if (!local.length) return online;
  if (!online.length) return local;

  const localKeys = {};
  for (const item of local) {
    localKeys[item.name] = true;
  }

  const filteredItems = online.filter(
    (item) => localKeys[item.name] === undefined
  );
  return [...local, ...filteredItems];
}
const allChapters = computed(() => {
  const localItems = chaptersOnDevice.value;
  const onlineItems = chaptersList.value;

  return getAllChapters(localItems, onlineItems);
});
const lastReadChapter = computed(() => {
  return allChapters.value.find((item) => item.isContinue);
});

function handleRemoveManga() {
  if (confirm("Delete every chapter for current manga?")) {
    flRemoveManga.postMessage("");
  }
}

window.flSyncChapters = (data) => {
  chaptersOnDevice.value = data.reverse();
};

async function download(list) {
  const { alias, name, image, } = info;

  sotre.setState((prev) => ({
    ...prev,
    download: {
      name,
      alias,
      image,
      chapters: list,

      callback: async () => {
        if (!myElm) return;

        flFetchMangaList.postMessage("");
        await new Promise((ok) => setTimeout(ok, 300));

        flSelectManga.postMessage(mangaAlias);
      }
    }
  }));
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
function handleBackClick() {
  router.push({ name: "home" });
}

onMounted(() => {
  const { alias } = route.params;

  if (isApp) {
    flSelectManga.postMessage(alias);
  }

  api.get(`/chapters/${alias}`).then((data) => {
    const { chapters, ...dataInfo } = data;
    info.value = dataInfo;
    chaptersList.value = chapters.reverse();

    store.setState((prev) => ({
      ...prev,
      mangaInfo: dataInfo,
      chapters: getAllChapters(chaptersOnDevice, chapters),
    }));
  });
});
</script>

<template>
  <div ref="myElm" />

  <MangaHeader :title="info.name" @back="handleBackClick" />

  <template v-if="chaptersOnDevice.length">
    <h2>On device:</h2>

    <div class="c-details__controls">
      <RouterLink v-if="alias && lastReadChapter" :tp="['chapter', { alias, chapter: lastReadChapter }]">Continue {{ lastReadChapter.name }}</RouterLink>
      <UiButton v-if="isApp" @click="handleRemoveManga">D</UiButton>
    </div>

    <ChapterList
      key="chaptersOnDevice"
      :items="chaptersList1"
      @download="handleDownload"
    />

    <h2 v-if="chaptersList2.length">Online:</h2>
  </template>

  <ChapterList
    key="listOnline"
    :items="chaptersList2"
    @download="handleDownload"
  />
</template>

<style>
.c-details__controls {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
</style>
