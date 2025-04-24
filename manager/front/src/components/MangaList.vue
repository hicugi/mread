<script setup>
import { ref, defineEmits, onMounted } from "vue";
import { api } from "../api.js";

const mangaList = ref([]);

const $emit = defineEmits(["select"]);

function select(name) {
  $emit("select", name);
}

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
      <button @click="select(name)">{{ name }}</button>
    </template>
  </div>
</template>

