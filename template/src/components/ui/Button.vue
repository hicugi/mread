<script setup>
const { variant } = defineProps({
  variant: {
    default: 'default',
  }
});
</script>

<template>
  <button class="ui-button" :class="`ui-button_variant-${variant}`" type="button" @click="$emit('clic')">
    <slot />
  </button>
</template>

<style>
.ui-button {
  padding: 10px 16px;
  border: none;
  display: inline-block;
}

.ui-button_variant-danger {
  background-color: var(--color-danger);
  color: white;
}
</style>
