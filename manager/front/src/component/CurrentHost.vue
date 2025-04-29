<script setup>
import { ref, defineEmits, onMounted } from "vue";
import UiInput from "./Ui/Input.vue";
import UiButton from "./Ui/Button.vue";
import { getHost, setHost } from "../constant.js";

const apiHost = import.meta.env.VITE_API_HOST;
const apiKey = import.meta.env.VITE_API_KEY;

const host = ref(getHost());
const emit = defineEmits(["change"]);

const updateHost = (value) => {
  setHost(value);
  emit("change", host.value);
}

function handleSubmit() {
  const body = new FormData();
  const { value } = host;

  body.append('value', value);
  body.append('key', apiKey);

  const url = `${apiHost}/`;
  fetch(url, { method: 'POST', body }).then(r => r.text()).then((msg) => {
    if (msg === "OK") {
      updateHost(value);
      alert("The host is updated");
      return;
    }

    alert(msg);
  })
}

onMounted(() => {
  if (host.value) {
    emit("change", host.value);
    return;
  }

  const url = `${apiHost}/current/`
  fetch(url).then(r => r.text()).then((data) => {
    host.value = data;
    updateHost(data);
  })
});
</script>

<template>
  <h2>Update host</h2>

  <form @submit.prevent="handleSubmit">
    <UiInput label="Current host" v-model="host" />
    <UiButton type="submit">submit</UiButton>
  </form>
</template>
