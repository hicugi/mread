<script setup>
import { onMounted } from "vue";
import { api } from "./api.js";

onMounted(() => {
  api.get("/list");
});
</script>

<template>
  <div> My List </div>
</template>

