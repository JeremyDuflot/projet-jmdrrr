import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import PlayerPage from '@/views/PlayerPage.vue'
import MjPage from '@/views/MjPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomePage, name: 'home' },
    { path: '/player', component: PlayerPage, name: 'player' },
    { path: '/mj', component: MjPage, name: 'mj' },
  ],
})

export default router

