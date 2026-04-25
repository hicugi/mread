<script setup>
import { ref, computed, inject, useTemplateRef, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import Cover from "../../components/Cover.vue";
import MangaHeader from "../../components/manga/header.vue";
import DetailsChapters from "./Chapters.vue";
import ChapterControls from "../../components/manga/chapter/controls.vue";
import UiButton from "../../components/ui/Button.vue";
import DownloadDialog from "./DownloadDialog.vue";

import { api } from "../../api.js";
import { savedChapters } from "../../helper/global.js";
import {
  fetchImages,
  isApp,
  getImgUrl,
  fetchChapters,
} from "../../helper/main.js";
import { useManga } from "../../helper/useManga.js";

import iconBack from "../iconBack.svg";
import iconDownload from "./iconDownload.svg";

const route = useRoute();
const router = useRouter();
const store = inject("store");

store.clear();

const myElm = useTemplateRef("myElm");

const images = ref([]);
const downloadDialogActive = ref(false);

const alias = computed(() => route.params.alias);
const info = computed(() => store.getState().mangaInfo);

const { chaptersAll } = useManga(alias.value);
const firstChapter = computed(() => chaptersAll.value?.at(-1)?.name);
const lastReadChapter = computed(() => savedChapters.value[alias.value]);

const headerChapter = computed(() => {
  const last = lastReadChapter.value;
  const first = firstChapter.value;

  if (!last && !first) return;

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

function openDownloadDialog() {
  downloadDialogActive.value = true;
}
function closeDownloadDialog() {
  downloadDialogActive.value = false;
}

onMounted(() => {
  const { alias } = route.params;

  if (isApp) {
    flSelectManga.postMessage(alias);
  }

  fetchChapters(alias, store);
});
</script>

<template>
  <div class="p-details" ref="myElm">
    <Cover v-if="info?.image" :image="info.image">
      <template v-slot:header>
        <div>
          <UiButton
            class="p-details__back-btn"
            :link="{ name: 'home' }"
            size="large"
          >
            <img :src="iconBack" width="18px" />
          </UiButton>
        </div>
      </template>

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
        <UiButton v-if="isApp" size="large" @click="openDownloadDialog">
          <img :src="iconDownload" width="18px" />
        </UiButton>
      </div>
    </Cover>

    <DetailsChapters
      class="container"
      :chapters="chaptersAll"
      :lastReadChapter="lastReadChapter"
    />
    <DownloadDialog
      :active="downloadDialogActive"
      @close="closeDownloadDialog"
    />
  </div>
</template>

<style>
.p-details-header {
  z-index: 0;
  position: relative;
  margin-bottom: 48px;
  padding-bottom: 24px;
  height: 574px;
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
.p-details-header__bg {
  z-index: -2;
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: 740px;
  height: 100%;
  background: no-repeat top;
  background-size: 100% auto;
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
