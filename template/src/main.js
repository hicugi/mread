import { createApp } from "vue";
import { createWebHistory, createRouter } from "vue-router";

import "./style.css";

import App from "./App.vue";
import Home from "./views/Home.vue";
import Details from "./views/Details/Details.vue";
import Chapter from "./views/Chapter.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: Home },
    { path: "/manga/:alias", name: "details", component: Details },
    { path: "/manga/:alias/:chapter", name: "chapter", component: Chapter },
  ],
});

createApp(App).use(router).mount("#app");
