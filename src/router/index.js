import { createRouter, createWebHistory } from 'vue-router'
import PlayerSheet from '@/views/PlayerSheet.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/player/:playerName',
      name: 'player-sheet',
      component: PlayerSheet,
    },
  ],
})

export default router
