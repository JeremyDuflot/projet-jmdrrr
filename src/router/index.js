import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import SelectPlayerPage from '@/views/SelectPlayerPage.vue'
import GmCampaignsView from '@/views/gm/CampaignsPage.vue'
import PlayerCampaignsView from '@/views/player/CampaignsPage.vue'
import GmLayout from '@/layouts/GmLayout.vue'
import PlayerSheetPage from '@/views/PlayerSheetPage.vue'
import ChaptersPage from '@/views/ChaptersPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'home', path: '/', component: HomePage },
    { name: 'gm-campaigns', path: '/gm/campaigns', component: GmCampaignsView },
    { name: 'player-campaigns', path: '/player/campaigns', component: PlayerCampaignsView },
    { name: 'chapters', path: '/campaigns/:campaignId/chapters', component: ChaptersPage },
    { name: 'players', path: '/players', component: SelectPlayerPage },
    { name: 'player-sheet', path: '/players/:playerName', component: PlayerSheetPage },
  ],
})

export default router
