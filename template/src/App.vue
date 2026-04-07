<script setup>
import { ref, provide } from "vue";
import DownloadBar from "./components/DownloadBar.vue";

const store = ref({});

provide("store", {
  getState: () => store.value,
  setState: (fn) => store.value = fn(store.value),
});
</script>

<template>
  <RouterView />
  <DownloadBar v-if="store.download" :info="store.download" @success="handleDownloadSuccess" />
</template>
