<script setup>
import UiButton from "./Ui/Button.vue";
import { api } from "../constant.js";

const { items } = defineProps({ items: Array });
const emit = defineEmits(["updateList"]);

function getBgImage(item) {
  return {
    backgroundImage: `url('${item.image}')`,
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
  <div class="c-mangaList">
    <template v-for="(item, i) in items" :key="i">
      <div class="c-mangaList__item">
        <RouterLink :to="{ name: 'manga', params: { name: item.alias } }">
          <div class="c-mangaList__image" :style="getBgImage(item)" />
        </RouterLink>

        <h3>{{ item.name }}</h3>

        <!-- <UiButton type="button" @click="handleRemove(item)">remove</UiButton> -->
      </div>
    </template>
  </div>
</template>

<style>
.c-mangaList {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  row-gap: 20px;
}
.c-mangaList__image {
  background: no-repeat center #dcdcdc;
  background-size: cover;
  aspect-ratio: 9/12;
}

.c-mangaList__item {
  position: relative;
  padding-bottom: 50px;
}

.c-mangaList__item h3 {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
