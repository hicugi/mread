<script setup>
import { ref, computed, defineProps, defineEmits, onMounted } from "vue";

import Card from "./card.vue";
import UiButton from "../ui/Button.vue"
import { isApp, HOST_URL_KEY } from "../../helper/main";
import { api } from "../../api";

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

  api.get("/list")
    .then((data) => {
      items.value = data;
    })
    .catch((err) => {
      console.error(err);
    });;
});

const emit = defineEmits(["select", "continue"]);
</script>

<template>
  <section>
    <h1>Manga list</h1>

    <div class="c-mangaList-saved" v-if="listOnDevice.length">
      <h2>Saved on device:</h2>

      <div class="c-mangaList-items">
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

    <div class="c-mangaList-items">
      <Card
        v-for="(item, index) of filteredItems"
        :key="index"
        v-bind="item"
        @select="() => emit('select', item)"
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
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 15px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.c-mangaList-saved .c-mangaList-items {
  margin-bottom: 40px;
}

@media screen and (min-width: 768px) {
  .c-mangaList-items {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (min-width: 1024px) {
  .c-mangaList-items {
    grid-template-columns: repeat(4, 1fr);
  }
}

.c-mangaList__cache-btm {
  margin: 40px 0;
  padding: 20px 0;
  width: 100%;
  display: block;
}

.c-mangaList__footer {
  padding-top: 30px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 14px;
}
</style>
