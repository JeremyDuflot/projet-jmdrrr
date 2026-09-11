import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import PlayerPage from '@/views/PlayerPage.vue'
import GmPage from '@/views/GmPage.vue'
import GmCampaignsView from '@/views/gm/CampaignsView.vue'
import PlayerCampaignsView from '@/views/player/CampaignsView.vue'
import PlayerSheet from '@/views/PlayerSheet.vue'
import GmLayout from '@/layouts/GmLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'home', path: '/', component: HomePage },
    { name: 'player', path: '/players', component: PlayerPage },
    { name: 'player-campaigns', path: '/players/campaigns', component: PlayerCampaignsView },
    { name: 'player-sheet', path: '/players/:playerName', component: PlayerSheet },
    { name: 'gm', path: '/gm/campaigns', component: GmCampaignsView },
    {
      path: '/gm',
      component: GmLayout,
      children: [{ path: '', name: 'gm-page', component: GmPage }],
    },
  ],
})

export default router
