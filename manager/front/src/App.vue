<script setup>
import { ref, onMounted } from "vue";
import { api } from "./api.js";
import MangaList from "./components/MangaList.vue";

const mangaName = ref(null);
let socket = null;

async function handleSelect(name) {
  mangaName.value = name;

  socket = await api.connect("/connection", { name });
  socket.send(name);

  socket.addEventListener("message", (data) => {
    console.log("received message", data);
  });
}

onMounted(() => {
});
</script>

<template>
  <div>
    <MangaList v-if="mangaName === null" @select="handleSelect" />

    <template v-if="mangaName">
      <h2>Selected manga: {{ mangaName }}</h2>
    </template>
  </div>
</template>

