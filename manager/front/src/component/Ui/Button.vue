<template>
  <button v-bind="$attr" class="ui-button"><slot /></button>
</template>

<style>
.ui-button {
  padding: 7px 20px 8px;
  font-size: 16px;
}
</style>
