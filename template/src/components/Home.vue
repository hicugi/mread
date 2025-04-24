<script setup>
import { ref, computed, defineProps, defineEmits, onMounted } from "vue";

import Card from "./manga/card.vue";
import { isApp, HOST_URL_KEY } from "../helper/main";
import { api } from "../api";

const items = ref([]);

const props = defineProps({
  listOnDevice: Array,
});

const filteredItems = computed(() => {
  const skip = {};
  for (const item of props.listOnDevice) {
    skip[item.name] = true;
  }

  return items.value.filter((item) => skip[item.name] === undefined);
});

function reloadPage() {
  flReload.postMessage("");
}
function clearReload() {
  flFullReload.postMessage("");
}
function clearCache() {
  if (confirm("Remove everything?")) {
    flRemoveAll.postMessage("");
    return;
  }

  flClearCache.postMessage("");
}

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

  api.get("/list").then((data) => {
    items.value = data;
  });
});

const emit = defineEmits(["select", "continue"]);
</script>

<template>
  <section>
    <h1>Manga list</h1>

    <div class="c-home-saved" v-if="listOnDevice.length">
      <h2>Saved on device:</h2>

      <div class="c-home-items">
        <Card
          v-for="(item, index) of listOnDevice"
          :key="`device${index}`"
          v-bind="item"
          @select="() => emit('select', item)"
          @continue="(chapterName) => emit('continue', item.name, chapterName)"
        />
      </div>

      <h2>Online:</h2>
    </div>

    <div class="c-home-items">
      <Card
        v-for="(item, index) of filteredItems"
        :key="index"
        v-bind="item"
        @select="() => emit('select', item)"
      />
    </div>

    <div class="c-home__footer">
      <button type="button" @click="reloadPage">reload page</button>
      <button type="button" @click="clearReload">update template</button>
      <button type="button" @click="clearCache">clear cache</button>
    </div>
  </section>
</template>

<style>
.c-home-items {
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 15px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.c-home-saved .c-home-items {
  margin-bottom: 40px;
}

@media screen and (min-width: 768px) {
  .c-home-items {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (min-width: 1024px) {
  .c-home-items {
    grid-template-columns: repeat(4, 1fr);
  }
}

.c-home__footer {
  padding-top: 40px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
.c-home__footer button {
  padding: 8px 20px;
}
</style>
