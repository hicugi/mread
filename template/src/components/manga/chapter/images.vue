<script setup>
import { defineProps, computed, inject } from "vue";

const getImgUrl = inject("getImgUrl");

const props = defineProps({
  images: Array,
});

const formattedImages = computed(() => props.images.map(getImgUrl));
</script>

<template>
  <section class="c-chapterImages">
    <img v-for="(image, i) of formattedImages" :key="i" :src="image" />
  </section>
</template>

<style>
.c-chapterImages img {
  margin: 0 auto;
  display: block;
  max-width: 100%;
}
</style>
