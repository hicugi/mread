<script setup>
import { computed, inject } from "vue";
import { getImgUrl } from "../../helper/main.js";

const { alias, name, image, currentChapter, lastChapter } = defineProps([
  "alias",
  "name",
  "image",
  "currentChapter",
  "lastChapter",
]);

const style = computed(() => ({
  backgroundImage: `url('${getImgUrl(image)}')`,
}));

const emit = defineEmits(["select", "continue"]);

const handleSelect = () => {
  emit("select");
};
const openLastChapter = () => {
  emit("continue", currentChapter);
};
</script>

<template>
  <div class="p-homeCard">
    <div class="p-homeCard__img" :style="style">
      <RouterLink
        v-if="currentChapter"
        class="p-homeCard__continue-link"
        :to="{ name: 'chapter', params: { alias, chapter: currentChapter } }"
      >
        {{ currentChapter }}
      </RouterLink>
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
  bottom: 0;
  width: 100%;
  height: 50%;
  content: "";
}
</style>
