<template>
  <button class="ui-button" type="button" @click="$emit('clic')">
    <slot />
  </button>
</template>

<style>
.ui-button {
  margin: 0 auto;
  padding: 12px 15px;
  width: 100%;
  max-width: 210px;
  display: block;
}
</style>
