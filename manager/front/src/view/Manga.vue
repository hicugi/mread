<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import UiButton from "../component/Ui/Button.vue";
import ChaptersList from "../component/ChaptersList.vue";
import { api } from "../constant.js";

const route = useRoute();
const info = ref(null);
const isChaptersLoading = ref(false);
const chapters = ref([]);

const imageBg = computed(() => {
  if (info.value == null) return {};

  const { image } = info.value;
  return {
    backgroundImage: `url('${image}')`,
  };
});

function fetchChapters() {
  isChaptersLoading.value = true;
  const { name } = route.params;

  api
    .get(`/manga/${name}`)
    .then((data) => {
      info.value = data;
      chapters.value = data.chapters;
    })
    .finally(() => {
      isChaptersLoading.value = false;
    });
}

function checkChapters() {
  const { name } = route.params;

  api
    .post(`/manga/${name}/chapters`)
    .then((data) => {
      fetchChapters();
      alert("Chapters successfully fetched");
    })
    .catch((err) => {
      console.error(err);
      alert(`Got an errror: ${err.message}`);
    });
}

onMounted(() => {
  fetchChapters();
});
</script>

<template>
  <h2>Directory: {{ $route.params.name }}</h2>

  <div v-if="info" class="p-manga">
    <h3>Name: {{ info.name }}</h3>

    <div>
      <UiButton
        type="button"
        :disabled="isChaptersLoading"
        @click="checkChapters"
        >Check chapters</UiButton
      >

      <h2>Chapters:</h2>
      <ChaptersList :items="chapters" />
    </div>
  </div>
</template>
