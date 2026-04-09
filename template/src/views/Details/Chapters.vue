<script setup>
import { inject, ref, computed, defineProps, defineEmits } from "vue";
import { useRoute, useRouter } from "vue-router";

import { isApp, getImgUrl, fetchImages } from "../../helper/main.js";

import iconDownload from "./iconDownload.svg";
import iconRemove from "./iconRemove.svg";

const LIMIT = 7;

const route = useRoute();
const router = useRouter();
const store = inject("store");

const { chapters, lastReadChapter } = defineProps({
  chapters: {
    default: [],
  },
  lastReadChapter: {
    default: undefined,
  },
});

const showAll = ref(false);

const info = computed(() => store.getState().mangaInfo ?? {});
const alias = computed(() => route.params.alias);

const filteredChapters = computed(() => {
  const res = [...chapters];

  if (showAll.value || res.length <= 7) {
    return res;
  }

  if (lastReadChapter) {
    let idx = res.findIndex((item) => item.name === lastReadChapter);
    res.splice(idx + 2);
    res.splice(0, Math.max(0, res.length - LIMIT));
    return res;
  }

  res.splice(LIMIT);
  return res;
});

async function handleDownload(chapter) {
  const { alias, name, image } = info.value;

  const data = await fetchImages(alias, chapter);

  let payload = [alias, name, getImgUrl(image), chapter].join("|");
  payload += ";" + data.map(getImgUrl).join("|");

  flDownloadChapter.postMessage(payload);
}
function handleShowMore() {
  showAll.value = !showAll.value;
}
</script>

<template>
  <section v-if="chapters?.length" class="p-detailsChapters">
    <header class="p-detailsChapters__header">
      <h2>Chapters</h2>
      <p>{{ chapters.length }} Chapters Total</p>
    </header>

    <div v-if="alias" class="p-detailsChapters__body">
      <template
        v-for="(item, index) of filteredChapters"
        :key="`${item.name}_${item.isDownloaded}`"
      >
        <div
          :class="{
            'p-detailsChapters-item': true,
            'p-detailsChapters-item--continue': item.name == lastReadChapter,
          }"
        >
          <span class="p-detailsChapters-item__name">Ch. {{ item.name }}</span>
          <span
            v-if="item.name == lastReadChapter"
            class="p-detailsChapters-item__hint"
            >CURRENT</span
          >

          <RouterLink
            :to="{ name: 'chapter', params: { alias, chapter: item.name } }"
          />

          <template v-if="isApp">
            <button
              v-if="item.isDownloaded"
              class="p-detailsChapters-item__control"
              type="button"
              @click="handleRemove(item.name)"
            >
              <img :src="iconRemove" width="16px" />
            </button>
            <button
              v-else
              class="p-detailsChapters-item__control"
              type="button"
              @click="handleDownload(item.name)"
            >
              <img :src="iconDownload" width="16px" />
            </button>
          </template>
        </div>
      </template>
    </div>

    <footer
      v-if="chapters.length > filteredChapters.length && !showAll"
      class="p-detailsChapters-more"
    >
      <button class="p-detailsChapters-more__btn" @click="handleShowMore">
        <span>VIEW MORE CHAPTERS</span>
      </button>
    </footer>
  </section>
</template>

<style>
.p-detailsChapters__header {
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: flex-end;
}
.p-detailsChapters__header p {
  margin: 0;
  color: #adaaaa;
  font-size: 15px;
  line-height: 1em;
}

.p-detailsChapters__body {
  display: grid;
  gap: 12px;
}

.p-detailsChapters-item {
  --side-gap: 16px;
  --control-size: 48px;

  position: relative;
  padding: var(--side-gap) var(--control-size) var(--side-gap) var(--side-gap);
  background-color: #101010;
  color: #adaaaa;
}

.p-detailsChapters-item--continue {
  background-color: #131313;
  color: #ffffff;
}

.p-detailsChapters-item__name {
  display: block;
  font-size: 16px;
  font-weight: bold;
  line-height: 24px;
  text-decoration: none;
}
.p-detailsChapters-item__hint {
  display: block;
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
}

.p-detailsChapters-item a {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

.p-detailsChapters-item__control {
  z-index: 1;
  position: absolute;
  right: 0;
  top: 0;
  border: none;
  width: var(--control-size);
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
}

.p-detailsChapters-more {
  margin-top: 16px;
  color: #adaaaa;
}
.p-detailsChapters-more__btn {
  position: relative;
  border: none;
  padding: 0;
  width: 100%;
  height: 48px;
  background: none;
  color: inherit;
}
.p-detailsChapters-more__btn span {
  padding-right: 22px;
  position: relative;
}
.p-detailsChapters-more__btn span::after {
  --size: 4px;

  position: absolute;
  right: 0;
  transform: rotate(135deg);
  border: 2px solid;
  border-color: currentColor currentColor transparent transparent;
  width: var(--size);
  height: var(--size);
  display: inline-block;
  content: "";
}
</style>
