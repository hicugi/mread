<script setup>
import { ref } from "vue";

import CurrentHost from "../component/CurrentHost.vue";
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
  fetchList();
}
</script>

<template>
  <div>
    <h1>This is home</h1>

    <CurrentHost @change="handleChange" />
    <NewManga @success="fetchList" />

    <template v-if="host && list.length">
      <MangaList :host="host" :items="list" @updateList="fetchList()" />
    </template>
  </div>
</template>
