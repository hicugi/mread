<script setup>
import { ref, computed, inject, useTemplateRef, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import MangaHeader from "../components/manga/header.vue";
import ChapterControls from "../components/manga/chapter/controls.vue";
import ChapterImage from "../components/manga/chapter/images.vue";
import { isApp, fetchChapters, getImgUrl } from "../helper/main.js";
import { useManga } from "../helper/useManga.js";

const route = useRoute();
const router = useRouter();
const store = inject("store");

const myElm = useTemplateRef("myElm");
const elmImages = useTemplateRef("elmImages");

const alias = computed(() => route.params.alias);
const { chaptersAll } = useManga(alias.value);

const info = computed(() => store.getState().mangaInfo);
const name = computed(() => info.value.name ?? "");
const chapter = computed(() => route.params.chapter ?? "");

const insertImage = (src) => {
  const elm = elmImages.value;
  if (!elm) return;

  const img = document.createElement("IMG");
  img.src = src;
  img.alt = src;
  img.loading = "lazy";

  elm.appendChild(img);
}

window.appInsertImage = (plAlias, plChapter, imageBase64) => {
  if (alias?.value !== plAlias || chapter?.value !== plChapter) return;
  insertImage(imageBase64);
};

function handleBackClick() {
  router.push({ name: "details", params: { alias: alias.value } });
}

const loadImages = async () => {
  setTimeout(async () => {
    const { alias, chapter } = route.params;
    let isDownloaded = false;

    for (const item of chaptersAll.value) {
      if (item.name === chapter) {
        isDownloaded = !!item.isDownloaded;
        break;
      }
    }

    if (typeof flSynchChapterSave !== "undefined") {
      flSynchChapterSave.postMessage([alias, chapter].join("|"));
      appSyncLastReadedChapter(alias, chapter);
    }

    if (isDownloaded) {
      flInsertImgsFromChapter.postMessage([alias, chapter].join("|"));
      return;
    }

    window.scrollTo(0,0);

    const elm = elmImages.value;
    const { itemsCount } = chaptersAll.value?.find((item) => item.name == chapter) ?? {};
    const currentChapter = chapter;

    for (let i=0; i < itemsCount; i++) {
      if (!elm) return;
      if (currentChapter !== chapter) return;

      insertImage(getImgUrl(`manga/${alias}/${chapter}/${i}`));
      await new Promise((ok) => setTimeout(ok, 500));
    }
  }, 300);
}

watch(chapter, loadImages);

onMounted(() => {
  loadImages();

  if (!info.value.chaptersOnline?.length) {
    fetchChapters(alias.value, store);
  }

  if (isApp) {
    if (info.value.name === undefined) {
      flSelectManga.postMessage(alias.value);
    }
    if (info.value.currentChapter === undefined) {
      const value = [alias.value, info.value.name, getImgUrl(info.value.image)].join("|");
      flDownloadManga.postMessage(value);
    }
  }
});
</script>

<template>
  <div ref="myElm" />

  <MangaHeader
    :title="`${name} - ${chapter}`"
    @back="handleBackClick"
  />

  <ChapterControls
    :key="chapter"
    :value="chapter"
    :items="chaptersAll"
  />

  <div class="p-chapter__images" ref="elmImages" :key="chapter" />
</template>

<style>
.p-chapter__images img {
  margin: 0 auto;
  display: block;
  max-width: 100%;
}
</style>
