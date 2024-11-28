<script setup>
import { ref, provide } from "vue";

import { HOST_URL_KEY } from "./helper/main.js";
import MangaList from "./components/manga/list.vue";
import MangaDetails from "./components/manga/details.vue";

const host = ref("http://127.0.0.1:8000");
const getUrl = (v) => {
  let res = host.value;
  res = res.replace(/\/+$/, "");

  return res + "/" + v.replace(/^\/+/, "");
}
provide("getUrl", getUrl);
provide("getImgUrl", (str) => {
  const isBase64 = str.startsWith("data:file;base64");
  return isBase64 ? str : getUrl(str);
});

const currentManga = ref(null);
const listOnDevice = ref([]);
const chaptersOnDevice = ref([]);

window.flSetHost = (value) => {
  window[HOST_URL_KEY] = value;
  host.value = value;
}

window.flSyncMangaList = (data) => {
  listOnDevice.value = data;
};
window.flInsertManga = (chapter) => {
  listOnDevice.value.push(chapter);
};
window.flSyncChapters = (data) => {
  chaptersOnDevice.value = data;
};

function handleSelect(item, chapter) {
  currentManga.value = {
    name: item.name,
    image: item.image,
    chapter,
  };
}
function handleBack() {
  currentManga.value = null;
  chaptersOnDevice.value = [];
}
</script>

<template>
  <MangaList
    v-show="!currentManga"
    :list-on-device="listOnDevice"
    @select="handleSelect"
    @continue="handleSelect"
  />
  <MangaDetails
    v-if="currentManga"
    :key="currentManga.name"
    :info="currentManga"
    :chapters="chaptersOnDevice"
    @back="handleBack"
  />
</template>
