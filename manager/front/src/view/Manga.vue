<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router'

import UiButton from '../component/Ui/Button.vue';
import ChaptersList from '../component/ChaptersList.vue';
import { api } from '../constant.js';

const route = useRoute();
const info = ref(null);
const chapters = ref([]);

const imageBg = computed(() => {
  if (info.value == null) return {};

  const { image } = info.value;
  return {
    backgroundImage: `url('${image}')`,
  }
});

function fetchChapters() {
  const { name } = route.params;

  api.get(`/manga/${name}`).then((data) => {
    info.value = data;
    chapters.value = data.chapters;
  });
}

function checkChapters() {
  const { name } = route.params;

  api.post(`/manga/${name}/chapters`).then((data) => {
    fetchChapters();
  });
}

onMounted(() => {
  fetchChapters();
});
</script>

<template>
  <h2>Directory: {{ $route.params.name }}</h2>

  <template v-if="info">
    <h3>Name: {{ info.name }}</h3>
    <div class="p-manga__image" :style="imageBg" />

    <UiButton type="button" @click="checkChapters">Check chapters</UiButton>

    <h2>Chapters:</h2>
    <ChaptersList :items="chapters" />
  </template>
</template>

<style>
.p-manga__image {
  max-width: 440px;
  aspect-ratio: 9/12;
  background: no-repeat center;
  background-size: cover;
}
</style>

