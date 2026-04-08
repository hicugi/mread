import { createApp } from "vue";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
} from "vue-router";

import "./style.css";

import { isApp } from "./helper/main.js";

import App from "./App.vue";
import Home from "./views/Home/Home.vue";
import Details from "./views/Details/Details.vue";
import Chapter from "./views/Chapter.vue";

export const router = createRouter({
  history: isApp ? createMemoryHistory() : createWebHistory(),
  routes: [
    { path: "/", name: "home", component: Home },
    { path: "/manga/:alias", name: "details", component: Details },
    { path: "/manga/:alias/:chapter", name: "chapter", component: Chapter },
  ],
});

createApp(App).use(router).mount("#app");
