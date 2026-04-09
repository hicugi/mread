<script setup>
import { ref, computed, inject, useTemplateRef, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import MangaHeader from "../components/manga/header.vue";
import ChapterControls from "../components/manga/chapter/controls.vue";
import ChapterImage from "../components/manga/chapter/images.vue";
import { isApp, fetchImages, fetchChapters, getImgUrl } from "../helper/main.js";
import { useManga } from "../helper/useManga.js";

const route = useRoute();
const router = useRouter();
const store = inject("store");

const myElm = useTemplateRef("myElm");

const images = ref([]);

const alias = computed(() => route.params.alias);
const { chaptersAll } = useManga(alias.value);

const info = computed(() => store.getState().mangaInfo);
const name = computed(() => info.value.name ?? "");
const chapter = computed(() => route.params.chapter ?? "");
const formattedImages = computed(() => images.value.map(getImgUrl));

window.appInsertImage = (plAlias, plChapter, imageBase64) => {
  if (alias?.value !== plAlias || chapter?.value !== plChapter) return;
  images.value.push(imageBase64);
};

function handleBackClick() {
  router.push({ name: "details", params: { alias: alias.value } });
}

const loadImages = async () => {
  images.value = [];

  setTimeout(() => {
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

    fetchImages(alias, chapter).then((data) => {
      images.value = data;
    });
  }, 100);
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

  <div class="p-chapter__images">
    <img v-for="(image, i) of formattedImages" :key="i" :src="image" />
  </div>

  <footer class="p-chater__footer">
    <RouterLink :to="['details', { alias }]">Back</RouterLink>
  </footer>
</template>

<style>
.p-chapter__images img {
  margin: 0 auto;
  display: block;
  max-width: 100%;
}
</style>
