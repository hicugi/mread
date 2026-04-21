<script setup>
import { inject, computed, defineEmits, watch, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";

import UiButton from "../../components/ui/Button.vue";
import { getImgUrl, fetchImages } from "../../helper/main.js";
import { useManga } from "../../helper/useManga.js";

import iconDownloadAll from "./iconDownloadAll.svg";

const route = useRoute();
const store = inject("store");
const { active } = defineProps(["active"]);
const { chaptersAll } = useManga(route.params.alias);

watch(() => active, (newValue) => {
  document.body.style.overflowY = newValue ? "hidden" : "";
});

const className = computed(() => ["p-detailsDownloadDialog", active && "p-detailsDownloadDialog--active"]);
const chapters = computed(() => chaptersAll.value ?? []);
const isDonwloading = computed(() => store.getState().isDownloadInProgress);

const $emit = defineEmits(["close"]);

async function handleSelectAll() {
  if (isDonwloading.value) return;

  store.setState((prev) => ({
    ...prev,
    isDownloadInProgress: true,
  }));

  const { mangaInfo } = store.getState();
  const { alias, name, image } = mangaInfo;

  const send = (arr) => flDownloadChapters.postMessage(arr.join("|"));

  send(["init", alias, name, chapters.value.length, getImgUrl(""), image]);

  for (const chapter of chapters.value) {
    if (chapter.isDownloaded) continue;

    const data = await fetchImages(alias, chapter.name);
    send(["chapter", alias, chapter.name, ...data.map((v) => v.substring(v.indexOf(alias) + alias.length + 1))]);
  }
}
function handleClose() {
  $emit("close");
}

onBeforeUnmount(() => {
  document.body.style.overflowY = "";
});
</script>

<template>
  <div :class="className" v-if="active">
    <button
      class="p-detailsDownloadDialog__bg"
      type="button"
      @click="handleClose"
    />

    <div class="p-detailsDownloadDialog__content">
      <div class="container">
        <header class="p-detailsDownloadDialog__header">
          <h2>Download Chapters</h2>
          <button class="p-detailsDownloadDialog__close-btn" @click="handleClose()" />
        </header>

        <section class="p-detailsDownloadDialog-all">
          <header class="p-detailsDownloadDialog-all__header">
            <h3>Full Archive</h3>
            <p>{{ chapters.length }} Chapters</p>
          </header>

          <UiButton variant="primary" size="large" :disabled="isDonwloading" @click="handleSelectAll">
            <img :src="iconDownloadAll" width="20px" />
            <span>Download All</span>
          </UiButton>
        </section>

        <section class="p-detailsDownloadDialog-custome">
          <h3 class="p-detailsDownloadDialog-custome__title"><span>Custom Selection</span></h3>

          <UiButton size="large">
            <span>Select Chapters</span>
          </UiButton>
        </section>
      </div>
    </div>
  </div>
</template>

<style>
.p-detailsDownloadDialog {
  z-index: 10;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: none;
}
.p-detailsDownloadDialog--active {
  display: block;
}

.p-detailsDownloadDialog__bg {
  position: absolute;
  left: 0;
  top: 0;
  border: none;
  width: 100%;
  height: 100%;
  background: #000000;
  opacity: 0.6;
}

.p-detailsDownloadDialog__content {
  --dialog-bg-color: #131313;

  box-sizing: border-box;
  padding-top: 46px;
  padding-bottom: 20px;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background: var(--dialog-bg-color);
}
.p-detailsDownloadDialog__content::before {
  position: absolute;
  left: 50%;
  top: 12px;
  transform: translateX(-50%);
  border-radius: 3px;
  width: 40px;
  height: 6px;
  display: block;
  background: #4848474d;
  content: "";
}

.p-detailsDownloadDialog__header {
  margin-bottom: 32px;
  display: grid;
  grid-template-columns: 1fr auto;
}
.p-detailsDownloadDialog__header h2 {
  font-size: 30px;
  font-weight: bold;
  line-height: 36px;
  color: var(--color-primary);
}

.p-detailsDownloadDialog__close-btn {
  --size: 18px;

  position: relative;
  border: none;
  width: 42px;
  background: none;
}
.p-detailsDownloadDialog__close-btn::before,
.p-detailsDownloadDialog__close-btn::after {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--size);
  height: 2px;
  display: block;
  background: var(--color-primary);
  content: '';
}
.p-detailsDownloadDialog__close-btn::before {
  transform: translate(-50%, -50%) rotate(-45deg);
}
.p-detailsDownloadDialog__close-btn::after {
  transform: translate(-50%, -50%) rotate(45deg);
}

.p-detailsDownloadDialog-all {
  display: grid;
  grid-template-columns: 1fr;
}

.p-detailsDownloadDialog-all__header {
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: flex-end;
  white-space: nowrap;
}
.p-detailsDownloadDialog-all h3 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  line-height: 28px;
  margin: 0;
}
.p-detailsDownloadDialog-all p {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
}

.p-detailsDownloadDialog-all button {
  gap: 12px;
}

.p-detailsDownloadDialog-custome {
  margin-top: 40px;
  display: grid;
  grid-template-columns: 1fr;
}

.p-detailsDownloadDialog-custome__title {
  --color: #767575;

  position: relative;
  margin: 0 0 24px;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: 1.2px;
  color: var(--color);
  text-align: center;
}
.p-detailsDownloadDialog-custome__title::before {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: #484847;
  width: 100%;
  height: 2px;
  content: '';
}

.p-detailsDownloadDialog-custome__title span {
  position: relative;
  padding: 0 8px;
  background: var(--dialog-bg-color);
  display: inline-block;
}
</style>
