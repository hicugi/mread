<script setup>
import { defineProps, defineEmits } from "vue";
import { isApp } from "../../helper/main";

const props = defineProps({
  items: Array,
});

const emit = defineEmits(["select", "download"]);
</script>

<template>
  <ul class="c-chapterList">
    <li
      v-for="(item, index) of props.items"
      :key="`${index}_${item.isDownloaded}`"
      :class="{ 'c-chapterList__item--continue': item.isContinue }"
    >
      <button
        class="c-chapterList__name"
        type="button"
        @click="emit('select', item)"
      >
        {{ item.name }}
      </button>
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
.c-chapterList button {
  line-height: 48px;
}
.c-chapterList__item--continue button {
  background-color: rgba(0, 255, 0, 0.3);
}
.c-chapterList__name {
  padding: 0 15px;
  flex-grow: 1;
  text-align: left;
}
.c-chapterList__download {
  width: 80px;
}
</style>
