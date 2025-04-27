<script setup>
import { ref } from "vue";
import UiInput from "./Ui/Input.vue";

import { api } from "../constant.js";

const isActive = ref(false);
const dir = ref("");
const name = ref("");
const link = ref("");
const image = ref(null);

function toggleActive() {
  isActive.value = !isActive.value;
}

function handleImageChange(e) {
  const [file] = e.target.files;
  image.value = file;
}

function handleSubmit() {
  const body = new FormData();

  body.append("dir", dir.value);
  body.append("name", name.value);
  body.append("link", link.value);
  body.append("image", image.value);

  api.post("/manga", body)
    .then(() => {
      alert("Success");
      toggleActive();
    }).catch((error) => {
      console.error(error);
      alert("Something went wrong");
    });
}
</script>

<template>
  <section class="c-newManga">
    <template v-if="!isActive">
      <button @click="toggleActive()">Add new manga</button>
    </template>

    <template v-else>
      <h2>Add new manga</h2>
      <button @click="toggleActive()">close</button>

      <form @submit.prevent="handleSubmit">
        <UiInput label="Directory" v-model="dir" />
        <UiInput label="Name" v-model="name" />
        <UiInput label="Link" v-model="link" />

        <fieldset>
          <label>Choose cover image</label>
          <input type="file" accept="image/jpeg" @change="handleImageChange" />
        </fieldset>

        <button>submit</button>
      </form>
    </template>
  </section>
</template>

<style>
.c-newManga {
  padding: 30px 0
}
</style>
