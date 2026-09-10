import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import PlayerPage from '@/views/PlayerPage.vue'
import GmPage from '@/views/GmPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomePage, name: 'home' },
    { path: '/player', component: PlayerPage, name: 'player' },
    { path: '/gm', component: GmPage, name: 'gm' },
  ],
})

export default router
