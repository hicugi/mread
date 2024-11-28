<script setup>
import { computed, defineProps, defineEmits } from "vue";

const props = defineProps({
  value: String,
  items: Array,
});

const findIndex = (name) => {
  return props.items.findIndex((item) => item.name === name);
};

const btnState = computed(() => {
  const index = findIndex(props.value);

  return {
    isFirst: index === 0,
    isLast: index === props.items.length - 1,
  };
});

function handleSelect({ target }) {
  const index = findIndex(target.value);
  selectChapter(index);
}

function handlePrevClick() {
  const index = findIndex(props.value);
  selectChapter(index + 1);
}
function handleNextClick() {
  const index = findIndex(props.value);
  selectChapter(index - 1);
}

const emit = defineEmits(["select"]);

function selectChapter(index) {
  emit("select", props.items[index]);
}
</script>

<template>
  <div class="container">
    <select class="controls__select" :value="value" @change="handleSelect">
      <option v-for="(item, i) of items" :key="i" :value="item.name">
        {{ item.name }}
      </option>
    </select>
  </div>

  <button
    class="controls-nav controls-nav_prev"
    type="button"
    :disabled="btnState.isLast"
    @click="handlePrevClick"
  >
    previous chapter
  </button>
  <button
    class="controls-nav controls-nav_next"
    type="button"
    :disabled="btnState.isFirst"
    @click="handleNextClick"
  >
    next chapter
  </button>
</template>

<style>
.controls__select {
  margin: 0 auto;
  display: block;
  width: 100%;
  max-width: 320px;
  padding: 12px 15px;
}

.controls-nav {
  position: fixed;
  top: 0;
  border: none;
  height: 100%;
  width: 64px;
  background: none;
  text-indent: -1000vw;
  opacity: 0.1;
  overflow: hidden;
}
.controls-nav::before {
  --size: 48px;
  position: absolute;
  left: 50%;
  top: 50%;
  border: 2px solid;
  border-color: currentColor currentColor transparent transparent;
  width: var(--size);
  height: var(--size);
  box-sizing: border-box;
  color: #ffffff;
  content: "";
}

.controls-nav_prev {
  left: 0;
}
.controls-nav_prev::before {
  transform: translate(-25%, -50%) rotate(-135deg);
}
.controls-nav_next {
  right: 0;
}
.controls-nav_next::before {
  transform: translate(-75%, -50%) rotate(45deg);
}

.controls-nav:disabled {
  display: none;
}
</style>
