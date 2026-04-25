<script setup>
import { ref, provide } from "vue";

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
</template>
