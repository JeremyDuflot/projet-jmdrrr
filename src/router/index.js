import CampaignsView from '@/views/CampaignsView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import PlayerPage from '@/views/PlayerPage.vue'
import GmPage from '@/views/GmPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'home', path: '/', component: HomePage, },
    { name: 'campaigns', path: '/campaigns', component: CampaignsView, },
    { name: 'player' , path: '/player', component: PlayerPage, },
    { name: 'gm' , path: '/gm', component: GmPage, },
  ],
})

export default router
