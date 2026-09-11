import { createRouter, createWebHistory } from 'vue-router'
import CampaignsView from '@/views/CampaignsView.vue'
import HomePage from '@/views/HomePage.vue'
import PlayerPage from '@/views/PlayerPage.vue'
import GmPage from '@/views/GmPage.vue'
import PlayerSheet from '@/views/PlayerSheet.vue'
import GmLayout from '@/layouts/GmLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'home', path: '/', component: HomePage },
    { name: 'campaigns', path: '/campaigns', component: CampaignsView },
    { name: 'player', path: '/players', component: PlayerPage },
    {
      name: 'player-sheet',
      path: '/players/:playerId',
      component: PlayerSheet,
    },
    {
      path: '/gm',
      component: GmLayout,
      children: [{ path: '', name: 'gm', component: GmPage }],
    },
  ],
})

export default router
