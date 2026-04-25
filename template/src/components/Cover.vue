<script setup>
import { defineProps } from "vue";
import { getImgUrl } from "../helper/main.js";

const { image } = defineProps(["image"]);
</script>

<template>
  <section class="c-cover">
    <div class="c-cover__header">
      <div class="container">
        <slot name="header" />
      </div>
    </div>

    <div class="c-cover-body">
      <div class="c-cover-body__image" :style="{ backgroundImage: `url('${getImgUrl(image)}')` }" />
      <div class="container">
        <slot />
      </div>
    </div>
  </section>
</template>

<style>
.c-cover__header {
  z-index: 1;
  position: absolute;
  left: 50%;
  top: 24px;
  transform: translateX(-50%);
  width: 100%;
}
.c-cover__header .container {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
}

.c-cover-body {
  --image-width: 740px;

  z-index: 0;
  position: relative;
  margin-bottom: 48px;
  padding-bottom: 24px;
  height: 574px;
  display: grid;
  align-items: flex-end;
}
.c-cover-body::before,
.c-cover-body::after {
  z-index: -1;
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    #0e0e0e99,
    #0e0e0ecd 60%,
    #0e0e0e 100%
  );
  content: "";
}
@media(min-width: 740px) {
  .c-cover-body::after {
    max-width: var(--image-width);
    background: linear-gradient(
      to right,
      #0e0e0e,
      #0e0e0ecd 3%,
      #0e0e0e99 5%,
      #0e0e0e99 95%,
      #0e0e0ecd 97%,
      #0e0e0e 100%
    );
  }
}

.c-cover-body__image {
  z-index: -2;
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--image-width);
  height: 100%;
  background: no-repeat top;
  background-size: 100% auto;
}
</style>
