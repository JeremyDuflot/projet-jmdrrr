import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import SelectPlayerPage from '@/views/player/SelectPlayerPage.vue'
import GmCampaignsView from '@/views/gm/CampaignsPage.vue'
import PlayerCampaignsPage from '@/views/player/CampaignsPage.vue'
import PlayerSheetPage from '@/views/PlayerSheetPage.vue'
import GmChaptersPage from '@/views/gm/ChaptersPage.vue'
import PlayerChaptersPage from '@/views/player/ChaptersPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'home', path: '/', component: HomePage },

    {
      name: 'gm-campaigns',
      path: '/gm/campaigns',
      component: GmCampaignsView,
      meta: { useLayout: true },
    },
    {
      name: 'gm-chapters',
      path: '/gm/campaigns/:campaignId/chapters',
      component: GmChaptersPage,
      meta: { useLayout: true },
    },

    { name: 'players', path: '/players', component: SelectPlayerPage, meta: { useLayout: true } },
    {
      name: 'player-campaigns',
      path: '/player/campaigns',
      component: PlayerCampaignsPage,
      meta: { useLayout: true },
    },
    {
      name: 'player-chapters',
      path: '/player/campaigns/:campaignId/chapters',
      component: PlayerChaptersPage,
      meta: { useLayout: true },
    },
    {
      name: 'player-sheet',
      path: '/players/:playerName',
      component: PlayerSheetPage,
      meta: { useLayout: true },
    },
  ],
})

export default router
