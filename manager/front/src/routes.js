import { createWebHistory, createRouter } from 'vue-router';

import Home from './view/Home.vue';
import Manga from './view/Manga.vue';
import Error404 from './view/404.vue';

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/manga/', name: 'manga', component: Manga },
  { path: '/manga/:name', name: 'manga', component: Manga },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

window.router = router;

