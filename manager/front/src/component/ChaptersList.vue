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
      if (data.status != "ok") {
        currentStatus.value = `Downloading: ${label} - ${data.status}`;
        return;
      }

      close();
      resolved();

      downloadedMemo.value = {
        ...downloadedMemo.value,
        [label]: true,
      };
      currentStatus.value = "";
    });
  });
}
</script>

<template>
  <UiButton type="button" @click="downloadAll()">Download all</UiButton>

  <ul class="c-chaptersList">
    <template v-for="(item, i) in items" :key="i">
      <li :class="{ 'c-chaptersList-item--downloaded': item.isDownloaded || downloadedMemo[item.label] }">
        <UiButton type="button" @click="downloadChapter(item)">{{ item.label }}</UiButton>
        <a :href="item.remoteLink" target="_blank" rel="noopener"><UiButton type="button">E</UiButton></a>
      </li>
    </template>
  </ul>

  <div>{{ currentStatus }}</div>
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
</style>
