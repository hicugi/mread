<script setup>
import { ref } from "vue";

const myElm = useTemplateRef("myElm");
const isOpen = ref(false);
</script>

<template>
  <div class="c-dropdownMenu" ref="myElm">
    <button class="c-dropdownMenu__btn" />
    <input class="c-dropdownMenu-input" type="checkbox" v-model="isOpen" />

    <ul class="c-dropdownMenu-menu">
      <template v-for="item of items" :key="item.action">
        <li>{{ item.label }}</li>
      </template>
    </ul>
  </div>
</template>

<style>
.c-dropdownMenu {
  position: relative;
}

.c-dropdownMenu__btn {
  background: none;
}

.c-dropdownMenu-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  overflow: hidden;
}

.c-dropdownMenu-menu {
  top: 100%;
  margin: 0;
  position: absolute;
  padding: 0;
  display: none;
  list-style: none;
}
.c-dropdownMenu-input[checked] .c-dropdownMenu-menu {
  display: block;
}

.c-dropdownMenu-menu li {
  padding: 8px 10px;
  font-size: 16px;
  line-height: 24px;
}
</style>
