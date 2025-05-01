<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router'
import UiButton from '../component/Ui/Button.vue';
import { api } from '../constant.js';

const route = useRoute();
const props = defineProps({ items: Array });
const downloadedMemo = ref({});
const currentStatus = ref("");

async function downloadAll() {
  for (const item of props.items) {
    if (item.isDownloaded) continue;
    await downloadChapter(item);
  }
}

async function downloadChapter(item) {
  const { name } = route.params;
  const { label } = item;

  const query = [
    `label=${label}`,
    `link=${item.remoteLink}`,
  ].join("&");

  return new Promise((resolved) => {
    const close = api.active(`/manga/${name}/download/chapter?${query}`, (data) => {
      switch (data.status) {
        case "ok":
          close();
          resolved();

          downloadedMemo.value = {
            ...downloadedMemo.value,
            [label]: true,
          };
          currentStatus.value = `DONE: ${label}`;
          break;

        case "error":
          close();
          resolved();

          currentStatus.value = `ERROR: ${data.error}`;
          break;

        default:
          let message = data.status;

          switch (data.status) {
            case "got images":
              message += " " + data.data.current + " / " + data.data.total;
              break
          }

          currentStatus.value = `Downloading: ${label} - ${message}`;
          return;
      }

    });
  });
}
</script>

<template>
  <UiButton type="button" @click="downloadAll()">Download all</UiButton>

  <ul class="c-chaptersList">
    <template v-for="(item, i) in items" :key="i">
      <li class="c-chaptersList-item" :class="{ 'c-chaptersList-item--downloaded': item.isDownloaded || downloadedMemo[item.label] }">
        <UiButton type="button" @click="downloadChapter(item)">{{ item.label }}</UiButton>
        <a :href="item.remoteLink" target="_blank" rel="noopener"><UiButton type="button">E</UiButton></a>
      </li>
    </template>
  </ul>

  <div v-if="currentStatus" class="c-chaptersList__status">{{ currentStatus }}</div>
</template>

<style>
.c-chaptersList {
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
}

.c-chaptersList-item {
  display: grid;
  grid-template-columns: 1fr auto;
  width: 150px;
}
.c-chaptersList-item button {
  height: 100%;
}
.c-chaptersList-item--downloaded {
  position: relative;
}
.c-chaptersList-item--downloaded::before {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 6px;
  background-color: green;
  content: "";
}

.c-chaptersList__status {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  padding: 12px 40px;
  background-color: white;
  color: #151515;
}
</style>
