<script setup>
import UiButton from '../component/Ui/Button.vue';

const props = defineProps({ items: Array });
</script>

<template>
  <ul class="c-chaptersList">
    <template v-for="(item, i) in items" :key="i">
      <li><UiButton type="button">{{ item.label }}</UiButton></li>
    </template>
  </ul>
</template>

<style>
.c-chaptersList {
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  list-style: none;
}
</style>
