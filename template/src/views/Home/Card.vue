<script setup>
import { computed, inject, nextTick } from "vue";
import { useRouter } from "vue-router";

import { getImgUrl } from "../../helper/main.js";
import { savedChapters } from "../../helper/global.js";

const router = useRouter();

const { alias, name, image, currentChapter } = defineProps([
  "alias",
  "name",
  "image",
  "currentChapter",
]);

const style = computed(() => ({
  backgroundImage: `url('${getImgUrl(image)}')`,
}));

function handleContinue() {
  store.setState((prev) => ({
    ...prev,
    mangaInfo: {
      ...prev.mangaInfo,
      alias,
      name,
      image,
      currentChapter,
    },
  }));

  nextTick(() => {
    router.push({ name: 'chapter', params: { alias, chapter: currentChapter } });
  });
}
</script>

<template>
  <div class="p-homeCard">
    <div class="p-homeCard__img" :style="style">
      <button
        v-if="savedChapters[alias]"
        class="p-homeCard__continue-link"
        @click="handleContinue"
      >
        Ch. {{ savedChapters[alias] }}
      </button>
    </div>

    <h3 class="p-homeCard__title"><span>{{ name }}</span></h3>

    <RouterLink
      class="p-homeCard__link"
      :to="{ name: 'details', params: { alias } }"
    />
  </div>
</template>

<style>
.p-homeCard {
  position: relative;
}

.p-homeCard__img {
  position: relative;
  margin-bottom: 12px;
  border-radius: 12px;
  aspect-ratio: 3/4;
  background: no-repeat center;
  background-size: cover;
}
.p-homeCard__img button {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  background: #9ba8ffcc;
  color: #001C8E;
  font-size: 10px;
  font-weight: 600;
  line-height: 19px;
}
.p-homeCard__continue-link {
  position: absolute;
}

.p-homeCard__title {
  --height: 24px;

  height: var(--height);
  position: relative;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: var(--height);
}
.p-homeCard__title span {
  position: absolute;
  max-width: 100%;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
}

.p-homeCard__link {
  z-index: 1;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  content: "";
}
</style>
