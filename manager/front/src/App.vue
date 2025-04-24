<script setup>
import { ref } from "vue";

import CurrentHost from "./component/CurrentHost.vue";
import { api } from "./constant.js";

const host = ref("");
const mangaList = ref([]);

function handleChange(newValue) {
  host.value = newValue;

  api.get('/list').then(({ list }) => {
    mangaList.value = list;
  });
}
</script>

<template>
  <div>
    <h1>MRead manager</h1>

    <CurrentHost :value="host" @change="handleChange" />

    <h2>Select manga to download</h2>
    <template v-for="(name, i) in mangaList" :key="i">
      <button>{{ name }}</button>
    </template>
  </div>
</template>

