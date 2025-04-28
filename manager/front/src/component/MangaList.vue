<script setup>
import { defineProps, defineEmits } from "vue";
import UiButton from "./Ui/Button.vue";
import { api } from "../constant.js";

const { host, items } = defineProps({ host: String, items: Array });
const emit = defineEmits("updateList");

function getBgImage(item) {
  const url = `${host}/manga/${item.alias}/image`;
  return {
    backgroundImage: `url('${url}')`,
  }
}

function handleRemove(item) {
  if (!confirm(`Delete the manga ${item.name}? Are you sure?`)) {
    return;
  }

  api.delete(`/manga/${item.alias}`).then(() => {
    emit("updateList");
  });
}
</script>

<template>
  <h2>Current list</h2>

  <div class="c-mangaList__items">
    <template v-for="(item, i) in items" :key="i">
      <div>
        <h3>{{ item.name }}</h3>
        <div class="c-mangaList__image" :style="getBgImage(item)" />

        <UiButton type="button" @click="handleRemove(item)">remove</UiButton>
      </div>
    </template>
  </div>
</template>

<style>
.c-mangaList__items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.c-mangaList__image {
  background: no-repeat center #dcdcdc;
  background-size: cover;
  aspect-ratio: 9/12;
}
</style>
