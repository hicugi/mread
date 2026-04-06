<script setup>
import { inject, ref, computed, defineEmits } from "vue";
import { useRoute, useRouter } from "vue-router";

import { isApp } from "../../helper/main";

import iconDownload from "./iconDownload.svg";

const LIMIT = 7;

const route = useRoute();
const router = useRouter();
const store = inject("store");

const showAll = ref(false);

const alias = computed(() => route.params.alias);

const chapters = computed(() => store.getState().chapters ?? [])
const lastReadChapter = computed(
  () => chapters.value.find((item) => item.isContinue)?.name,
);
const filteredChapters = computed(() => {
  const res = [...(store.getState().chapters ?? [])];

  if (showAll.value || res.length <= 7) {
    return res;
  }

  if (lastReadChapter.value !== undefined) {
    let idx = res.findIndex((item) => item.name === lastReadChapter.value);
    res.splice(idx + 2);
    res.splice(0, Math.max(0, res.length - LIMIT));
    return res;
  }

  res.splice(LIMIT);
  return res;
});

function handleShowMore() {
  showAll.value = !showAll.value;
}
</script>

<template>
  <section v-if="chapters.length" class="p-detailsChapters">
    <header class="p-detailsChapters__header">
      <h2>Chapters</h2>
      <p>{{ chapters.length }} Chapters Total</p>
    </header>

    <div v-if="alias" class="p-detailsChapters__body">
      <template v-for="(item, index) of filteredChapters" :key="`${item.name}_${item.isDownloaded}`">
        <RouterLink
          :class="{
            'p-detailsChapters-item': true,
            'p-detailsChapters-item--continue': item.isContinue,
            'p-detailsChapters-item--downloaded': item.isDownloaded,
          }"
          :to="{ name: 'chapter', params: { alias, chapter: item.name } }"
        >
          <span class="p-detailsChapters-item__name">Ch. {{ item.name }}</span>
          <span v-if="isApp" class="p-detailsChapters-item__control">
            <img :src="iconDownload" width="16px" />
          </span>
        </RouterLink>
      </template>
    </div>

    <footer v-if="chapters.length > filteredChapters.length && !showAll" class="p-detailsChapters-more">
      <button class="p-detailsChapters-more__btn" @click="handleShowMore"><span>VIEW MORE CHAPTERS</span></button>
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
  color: #ADAAAA;
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
  color: #ADAAAA;
  text-decoration: none;
}
.p-detailsChapters-item--downloaded {
  background-color: #131313;
}
.p-detailsChapters-item--continue button {
  background-color: rgba(0, 255, 0, 0.3);
}

.p-detailsChapters-item__name {
  font-size: 16px;
  font-weight: bold;
  line-height: 24px;
  text-decoration: none;
}

.p-detailsChapters-item__control {
  position: absolute;
  right: 0;
  top: 0;
  width: var(--control-size);
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.p-detailsChapters-more {
  margin-top: 16px;
  color: #ADAAAA;
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
  content: '';
}
</style>
