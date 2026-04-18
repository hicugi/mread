<script setup>
import { ref, onMounted } from "vue";

import NewManga from "../component/NewManga.vue";
import MangaList from "../component/MangaList.vue";

import { api } from "../constant.js";

const host = ref("");
const list = ref([]);

function fetchList() {
  api.get('/list').then(({ items }) => {
    list.value = items;
  });
}

function handleChange(newValue) {
  host.value = newValue;
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div>
    <NewManga @success="fetchList" />

    <template v-if="list.length">
      <MangaList :items="list" @updateList="fetchList()" />
    </template>
  </div>
</template>
