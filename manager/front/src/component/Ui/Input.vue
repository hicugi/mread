<script setup>
import { defineProps, computed, defineEmits } from "vue";

const { label, modelValue } = defineProps({
  label: String,
  modelValue: String,
});
const emit = defineEmits("update:modelValue");

const currentModel = computed({
  get: () => modelValue,
  set: (newValue) => {
    emit("update:modelValue", newValue);
  }
});

</script>

<template>
  <fieldset>
    <label>{{ label }}</label>
    <input v-model="currentModel" />
  </fieldset>
</template>
