<script setup>
import { defineProps, defineEmits, computed, watch } from "vue";

const { active, title, list } = defineProps(["title", "list", "active"]);
const $emit = defineEmits(["close"]);

const className = computed(() => ["c-sidebarMenu", active && "c-sidebarMenu--active"]);

watch(() => active, (newValue) => {
  document.body.style.overflowY = newValue ? "hidden" : "";
});
</script>

<template>
  <div :class="className">
    <button class="c-sidebarMenu__close" @click="$emit('close')"/>

    <div class="c-sidebarMenu__content">
      <h3 class="c-sidebarMenu__title" v-if="title">{{ title }}</h3>

      <div class="c-sidebarMenu-list">
        <template v-for="(item, index) of list" :key="index">
          <button type="button" @click="item.event">
            <img :src="item.icon" />
            <span>{{ item.label }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
.c-sidebarMenu {
  z-index: 10;
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #00000099;
  color: #adaaaa;
  display: none;
}
.c-sidebarMenu--active {
  display: block;
}

.c-sidebarMenu__close {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  opacity: 0;
}

.c-sidebarMenu__content {
  z-index: 0;
  position: absolute;
  right: 0;
  top: 0;
  padding: 32px 0;
  width: calc(100% - 102px);
  height: 100%;
  background: #131313cc;
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
}
.c-sidebarMenu__content::before {
  z-index: -1;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  position: absolute;

  content: "";
}

.c-sidebarMenu__title {
  margin: 0 0 40px;
  position: relative;
  padding: 0 32px 12px;
  color: var(--color-primary);
  font-size: 20px;
  line-height: 28px;
  font-weight: 900;
}
.c-sidebarMenu__title::before {
  position: absolute;
  bottom: 0;
  border-radius: 4px;
  width: 32px;
  height: 4px;
  background-color: currentColor;
  content: "";
}

.c-sidebarMenu-list {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
}

.c-sidebarMenu-list button {
  position: relative;
  padding: 0 58px;
  height: 52px;
  border: none;
  display: flex;
  align-items: center;
  background: none;
  color: inherit;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
}
.c-sidebarMenu-list button img {
  position: absolute;
  top: 50%;
  left: 24px;
  transform: translateY(-50%);
}
</style>
