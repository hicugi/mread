<script setup>
import UiButton from './component/Ui/Button.vue';
</script>

<template>
  <div>
    <header class="c-app__header">
      <h1>MRead manager</h1>
      <RouterLink v-if="$route.name != 'home'" :to="{ name: 'home' }">
        <UiButton type="button">Back home</UiButton>
      </RouterLink>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
h1 {
  margin: 0;
}

.c-app__header {
  display: grid;
  grid-template-columns: 1fr auto;
}
</style>
