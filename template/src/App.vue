<script setup>
import { ref, provide } from "vue";

import DownloadBar from "./components/DownloadBar.vue";
import { HOST_URL_KEY } from "./helper/main.js";

const store = ref({});

provide("store", {
  getState: () => store.value,
  setState: (fn) => store.value = fn(store.value),
});

window[HOST_URL_KEY] = "http://127.0.0.1:8000";
window.flSetHost = (value) => {
  window[HOST_URL_KEY] = value;
  host.value = value;
}

function handleDownloadSuccess() {
  store.value = {
    ...store.value,
    download: null,
  };
}
</script>

<template>
  <RouterView />
  <DownloadBar v-if="store.download" :info="store.download" @success="handleDownloadSuccess" />
</template>
