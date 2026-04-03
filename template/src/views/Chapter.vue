<script setup>
import { ref, computed, inject, useTemplateRef, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import MangaHeader from "../components/manga/header.vue";
import ChapterControls from "../components/manga/chapter/controls.vue";
import ChapterImage from "../components/manga/chapter/images.vue";
import { fetchImages, getImgUrl } from "../helper/main.js";

const route = useRoute();
const router = useRouter();
const store = inject("store");

const myElm = useTemplateRef("myElm");

const images = ref([]);

const name = computed(() => store.getState().mangaInfo?.name ?? "");
const alias = computed(() => route.params.alias);
const chapter = computed(() => route.params.chapter ?? "");
const chapters = computed(() => store.getState().chapters ?? []);
const formattedImages = computed(() => images.value.map(getImgUrl));

window.flInsertImage = (imageBase64) => {
  if (!myElm) return;
  images.value.push(imageBase64);
};

function handleBackClick() {
  router.push({ name: "details", params: { alias: alias.value } });
}

const loadImages = () => {
  images.value = [];

  const { alias, chapter } = route.params;
  let isDownloaded = false;

  for (const item of chapters.value) {
    if (item.name === chapter) {
      isDownloaded = !!item.isDownloaded;
      break;
    }
  }

  if (isDownloaded) {
    setTimeout(() => {
      flInsertImgsFromChapter.postMessage([alias, chapter].join("|"));
    }, 100);
    return;
  }

  fetchImages(alias, chapter).then((data) => {
    images.value = data;
  });
}

watch(chapter, loadImages);
onMounted(loadImages);
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
    :items="chapters"
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
