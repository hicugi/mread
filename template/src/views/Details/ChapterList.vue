<script setup>
import { defineProps, computed, defineEmits } from "vue";
import { useRoute, useRouter } from "vue-router";

import { isApp } from "../../helper/main";

const route = useRoute()
const router = useRouter();

const props = defineProps({
  items: Array,
});

const alias = computed(() => route.params.alias);

const emit = defineEmits(["select", "download"]);
</script>

<template>
  <ul class="c-chapterList">
    <li
      v-for="(item, index) of props.items"
      :key="`${index}_${item.isDownloaded}`"
      :class="{ 'c-chapterList__item--continue': item.isContinue }"
    >
      <RouterLink
        class="c-chapterList__name"
        :to="{name: 'chapter', params: { alias, chapter: item.name }}"
      >
        {{ item.name }}
      </RouterLink>
      <button
        v-if="isApp && !item.isDownloaded"
        class="c-chapterList__download"
        @click="emit('download', item)"
      >
        D
      </button>
    </li>
  </ul>
</template>

<style>
.c-chapterList {
  margin: 0 auto;
  padding: 0;
  max-width: 460px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  list-style: none;
}

.c-chapterList li {
  display: flex;
  align-items: stretch;
  background-color: #fff;
}
.c-chapterList a {
}
.c-chapterList__item--continue button {
  background-color: rgba(0, 255, 0, 0.3);
}
.c-chapterList__name {
  border: 1px solid #151515;
  padding: 0 15px;
  flex-grow: 1;
  color: #151515;
  line-height: 48px;
  text-align: left;
  text-decoration: none;
}
.c-chapterList__download {
  width: 80px;
}
</style>
