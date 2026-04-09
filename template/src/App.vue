<script setup>
import { ref, provide } from "vue";
import DownloadBar from "./components/DownloadBar.vue";

const INITIAL_STATE = { mangaInfo: {} };
const store = ref(INITIAL_STATE);

provide("store", {
  getState: () => store.value,
  setState: (fn) => store.value = fn(store.value),
  clear: () => store.value = INITIAL_STATE,
});
</script>

<template>
  <RouterView />
  <DownloadBar v-if="store.download" :info="store.download" @success="handleDownloadSuccess" />
</template>
