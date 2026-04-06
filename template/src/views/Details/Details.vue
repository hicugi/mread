<script setup>
import { ref, computed, inject, useTemplateRef, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import MangaHeader from "../../components/manga/header.vue";
import DetailsChapters from "./Chapters.vue";
import ChapterControls from "../../components/manga/chapter/controls.vue";
import UiButton from "../../components/ui/Button.vue";

import { api } from "../../api";
import { fetchImages, isApp, getImgUrl } from "../../helper/main.js";

import iconBack from "../iconBack.svg";
import iconDownload from "./iconDownload.svg";

const route = useRoute();
const router = useRouter();
const store = inject("store");

const myElm = useTemplateRef("myElm");

const chaptersList = ref([]);
const chaptersOnDevice = ref([]);
const selectedChapter = ref(null);
const images = ref([]);

const alias = computed(() => route.params.alias);
const info = computed(() => store.getState().mangaInfo);

const chapters = computed(() => store.getState().chapters ?? []);
const firstChapter = computed(() => chapters.value.at(-1)?.name);
const lastReadChapter = computed(
  () => chapters.value.find((item) => item.isContinue)?.name,
);

const headerChapter = computed(() => {
  const last = lastReadChapter.value;
  const first = firstChapter.value;

  if (last) {
    return {
      label: "Continue Ch. " + last,
      value: last,
    };
  }

  return {
    label: "Start Reading Ch. " + first,
    value: first,
  };
});

function handleRemoveManga() {
  if (confirm("Delete every chapter for current manga?")) {
    flRemoveManga.postMessage("");
  }
}

window.flSyncChapters = (data) => {
  chaptersOnDevice.value = data.reverse();
};

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
function handleBackClick() {
  router.push({ name: "home" });
}

const combineChapters = (local, online) => {
  if (!local.length) return online;
  if (!online.length) return local;

  const localKeys = {};
  for (const item of local) {
    localKeys[item.name] = item;
  }

  const res = [...online];

  for (let i = 0; i < res.length; i++) {
    const item = res[i];

    if (localKeys[item.name] !== undefined) {
      const loc = localKeys[item.name];
      res[i] = {
        ...res[i],
        ...loc,
        isDownloaded: true,
      };
    }
  }

  return res;
};

onMounted(() => {
  const { alias } = route.params;

  if (isApp) {
    flSelectManga.postMessage(alias);
  }

  api.get(`/chapters/${alias}`).then((data) => {
    const { chapters, ...dataInfo } = data;
    chaptersList.value = chapters.reverse();

    store.setState((prev) => ({
      ...prev,
      mangaInfo: dataInfo,
      chapters: combineChapters(chaptersOnDevice, chapters),
    }));
  });
});
</script>

<template>
  <div class="p-details" ref="myElm">
    <div v-if="alias" class="container">
      <UiButton
        class="p-details__back-btn"
        :link="{ name: 'home' }"
        size="large"
      >
        <img :src="iconBack" width="18px" />
      </UiButton>
    </div>

    <header
      v-if="info"
      class="p-details-header"
      :style="{ backgroundImage: `url('${getImgUrl(info.image)}')` }"
    >
      <div class="container">
        <h1>{{ info.name }}</h1>

        <div v-if="headerChapter" class="p-details-header__controls">
          <UiButton
            :link="{
              name: 'chapter',
              params: { alias, chapter: headerChapter.value },
            }"
            variant="primary"
            size="large"
            v-text="headerChapter.label"
          />
          <UiButton v-if="isApp" size="large">
            <img :src="iconDownload" width="18px" />
          </UiButton>
        </div>
      </div>
    </header>

    <DetailsChapters class="container" />
  </div>
</template>

<style>
.p-details .container {
  position: relative;
}
.p-details__back-btn {
  z-index: 1;
  position: absolute;
  top: 24px;
  left: 24px;
}

.p-details-header {
  z-index: 0;
  position: relative;
  margin-bottom: 48px;
  height: 574px;
  background: no-repeat top;
  background-size: 100% auto;
  display: grid;
  align-items: flex-end;
}
.p-details-header::before {
  z-index: -1;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    #0e0e0e99,
    #0e0e0ecd 60%,
    #0e0e0e 100%
  );
  content: "";
}

.p-details-header__controls {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
}

.p-details-header h1 {
  margin: 0 0 40px;
  font-size: 48px;
  line-height: 1.2;
}

.p-details__controls {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
</style>
