<script setup>
import UiButton from './component/Ui/Button.vue';
</script>

<template>
  <div>
    <h1>MRead manager</h1>

    <RouterLink v-if="$route.name != 'home'" :to="{ name: 'home' }">
      <UiButton type="button">Back home</UiButton>
    </RouterLink>

    <main>
      <RouterView />
    </main>
  </div>
</template>

