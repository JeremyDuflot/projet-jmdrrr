import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import PlayerPage from '@/views/PlayerPage.vue'
import GmPage from '@/views/GmPage.vue'
import PlayerSheet from '@/views/PlayerSheet.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomePage, name: 'home' },
    { path: '/player', component: PlayerPage, name: 'player' },
    { path: '/gm', component: GmPage, name: 'gm' },
    {
      path: '/player/:playerName',
      name: 'player-sheet',
      component: PlayerSheet,
    },
  ],
})

export default router
