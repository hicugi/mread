<script setup>
import { defineProps, computed } from "vue";
import UiButton from "../ui/Button.vue";

const props = defineProps({
  title: String,
});

const prettyTitle = computed(() => props.title.replace(/-/g, ' '));

const $emit = defineEmits("back");

function handleClickBack() {
  $emit("back");
}
</script>

<template>
  <header class="c-header">
    <UiButton @click="handleClickBack">back</UiButton>
    <h1>{{ prettyTitle }}</h1>
  </header>
</template>

<style>
.c-header {
  padding-top: 80px;
  text-align: center;
}

.c-header__back {
  padding: 0 100px;
  line-height: 48px;
}

.c-header h1 {
  margin-top: 10px;
}
</style>
