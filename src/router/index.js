import CampaignsView from '@/views/CampaignsView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import PlayerPage from '@/views/PlayerPage.vue'
import GmPage from '@/views/GmPage.vue'
import PlayerSheet from '@/views/PlayerSheet.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'home', path: '/', component: HomePage },
    { name: 'campaigns', path: '/campaigns', component: CampaignsView },
    { name: 'players', path: '/player', component: PlayerPage },
    { name: 'gm', path: '/gm', component: GmPage },
    {
      path: '/players/:playerName',
      name: 'player-sheet',
      component: PlayerSheet,
    },
  ],
})

export default router
