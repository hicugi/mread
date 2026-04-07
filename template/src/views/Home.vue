<script setup>
import { ref, computed, defineEmits, onMounted } from "vue";

import Card from "../components/manga/card.vue";
import UiButton from "../components/ui/Button.vue";
import { isApp, HOST_URL_KEY } from "../helper/main.js";
import { api } from "../api.js";

const listOnDevice = ref([]);
const items = ref([]);

const filteredItems = computed(() => {
  const skip = {};
  for (const item of listOnDevice.value) {
    skip[item.name] = true;
  }

  return items.value.filter((item) => skip[item.name] === undefined);
});

function clearTemplate() {
  if (confirm("Clear template?")) {
    flClearCache.postMessage("");
    return;
  }
}

function clearAll() {
  if (confirm("Remove & Clear everything?")) {
    flRemoveAll.postMessage("");
    return;
  }
}

window.flSyncMangaList = (data) => {
  listOnDevice.value = data;
};

onMounted(async () => {
  if (isApp) {
    flFetchMangaList.postMessage("");

    await new Promise((ok) => {
      const interval = setInterval(() => {
        if (window[HOST_URL_KEY]) {
          clearInterval(interval);
          ok();
        }
      }, 100);
    });
  }

  api
    .get("/list")
    .then((data) => {
      items.value = data;
    })
    .catch((err) => {
      console.error(err);
    });
});

const emit = defineEmits(["select", "continue"]);
</script>

<template>
  <section class="container">
    <h1>Manga list</h1>

    <div class="c-mangaList-saved" v-if="listOnDevice.length">
      <h2>Saved on device:</h2>

      <div class="c-mangaList-items">
        <Card
          v-for="(item, index) of listOnDevice"
          :key="`device${item.alias}`"
          v-bind="item"
        />
      </div>

      <h2>Online:</h2>
    </div>

    <div class="c-mangaList-items">
      <Card
        v-for="(item, index) of filteredItems"
        :key="`online${item.alias}`"
        v-bind="item"
      />
    </div>

    <footer class="c-mangaList__footer">
      <UiButton type="button" @click="clearTemplate">update template</UiButton>
      <UiButton variant="danger" @click="clearAll">clear all cache</UiButton>
    </footer>
  </section>
</template>

<style>
.c-mangaList-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.c-mangaList-saved .c-mangaList-items {
  margin-bottom: 40px;
}

.c-mangaList__cache-btm {
  margin: 40px 0;
  padding: 20px 0;
  width: 100%;
  display: block;
}

.c-mangaList__footer {
  padding: 30px 15px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
</style>
