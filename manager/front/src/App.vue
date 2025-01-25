<script setup>
import { ref, onMounted } from "vue";
import { api } from "./api.js";

const mangaList = ref([]);

onMounted(() => {
  api.get("/list").then(({ list }) => {
    mangaList.value = list;
  });
});
</script>

<template>
  <div>
    <h2>Select manga to download</h2>
    <template v-for="(name, i) in mangaList" :key="i">
      <button>{{ name }}</button>
    </template>
  </div>
</template>

