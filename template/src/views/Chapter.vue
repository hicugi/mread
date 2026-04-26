<script setup>
import { ref, computed, inject, useTemplateRef, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import ChapterControls from "../components/manga/chapter/controls.vue";
import ChapterImage from "../components/manga/chapter/images.vue";
import UiButton from "../components/ui/Button.vue";
import { isApp, fetchChapters, getImgUrl } from "../helper/main.js";
import { useManga } from "../helper/useManga.js";

import iconBack from "./iconBack.svg";
import iconBook from "./iconBook.svg";

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

function selectChapter() {
  const elm = document.querySelector("select");
  elm.showPicker();
}
function handleChapterSelect(chapter) {
  const elm = elmImages.value;
  elm.innerHTML = "";

  window.scrollTo(0,0);

  setTimeout(() => {
    const { alias } = route.params;

    router.push({ name: "chapter", params: {
      alias,
      chapter,
    }});
  }, 100);
}

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

  <header class="p-chapter-header container">
    <UiButton
      v-if="alias"
      :link="{ name: 'details', pararms: { alias } }"
      size="large"
    >
      <img :src="iconBack" width="18px" />
    </UiButton>

    <div>
      <h1>{{ info.name }}</h1>
      <p>Chapter {{ chapter }}</p>
    </div>

    <UiButton
      size="large"
      @click="selectChapter"
    >
      <img :src="iconBook" width="18px" />
    </UiButton>
  </header>

  <ChapterControls
    :key="chapter"
    :value="chapter"
    :items="chaptersAll"
    @select="handleChapterSelect"
  />

  <div class="p-chapter__images" ref="elmImages" :key="chapter" />
</template>

<style>
.p-chapter-header {
  z-index: 1;
  position: relative;
  margin-top: 24px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
}
.p-chapter-header h1 {
  margin: 0;
  color: #fff;
  font-size: 18px;
  line-height: 1;
}
.p-chapter-header p {
  margin: 0;
  color: #adaaaa;
  font-size: 12px;
  line-height: 16px;
}

.p-chapter__images img {
  margin: 0 auto;
  display: block;
  max-width: 100%;
}
</style>
