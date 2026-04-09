<script setup>
import { computed } from "vue";

const { variant, size } = defineProps({
  link: {
    default: null,
  },
  variant: {
    default: "default",
    variants: ["default", "primary"],
  },
  size: {
    default: "medium",
    variants: ["medium", "large"],
  },
});

const className = computed(() => [
  "ui-button",
  `ui-button_variant-${variant}`,
  `ui-button_size-${size}`,
]);
</script>

<template>
  <RouterLink v-if="link" :to="link" :class="className">
    <slot />
  </RouterLink>
  <button v-else :class="className" type="button" @click="$emit('clic')">
    <slot />
  </button>
</template>

<style>
.ui-button {
  box-sizing: border-box;
  padding: 10px 16px;
  border: none;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
}

.ui-button_size-large {
  --height: 60px;

  padding: 16px 24px;
  border-radius: var(--height);
  min-height: var(--height);
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

.ui-button_variant-primary {
  background: var(--color-primary);
  color: #001c8e;
}
.ui-button_variant-default {
  background: #262626;
  color: #ADAAAA;
}

.ui-button_variant-danger {
  background-color: var(--color-danger);
  color: white;
}

.ui-button[disabled] {
  opacity: 0.3;
}
</style>
