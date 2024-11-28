<script setup>
import { computed, inject } from "vue";

const { name, image, currentChapter, lastChapter } = defineProps({
  name: String,
  image: String,
  currentChapter: String,
  lastChapter: String,
});

const getImgUrl = inject("getImgUrl");
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
  <div class="c-card" :style="style">
    <div class="c-card-chapters">
      <template v-if="lastChapter">
        <button v-if="currentChapter" @click="openLastChapter">
          {{ currentChapter }}
        </button>
        <span>{{ lastChapter }}</span>
      </template>
    </div>

    <h3>{{ name }}</h3>
    <button class="c-card__select" @click="handleSelect">open chapters</button>
  </div>
</template>

<style>
.c-card {
  position: relative;
  background: no-repeat center;
  background-size: cover;
  aspect-ratio: 3/4;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.c-card h3 {
  margin: 0;
  padding: 8px 15px;
  background-color: rgba(0, 0, 0, 0.9);
  box-sizing: border-box;
}

.c-card__select {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.c-card-chapters {
  margin-left: auto;
  display: flex;
  background-color: rgba(0, 0, 0, 0.7);
  font-size: 16px;
}
.c-card-chapters * {
  padding: 3px 7px;
  display: block;
}
.c-card-chapters button::before {
  z-index: 1;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 50%;
  content: "";
}
</style>
