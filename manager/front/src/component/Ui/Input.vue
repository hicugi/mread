<script setup>
import { computed } from "vue";

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
  <fieldset class="ui-input">
    <label>{{ label }}</label>
    <input v-model="currentModel" />
  </fieldset>
</template>

<style>
.ui-input {
  padding: 0 0 20px;
  border: none;
  display: grid;
  grid-template-clumn: 1fr;
  gap: 8px;
}

.ui-input label {
  font-size: 18px;
}

.ui-input input {
  padding: 8px 12px 7px;
  font-size: 16px;
}
</style>
