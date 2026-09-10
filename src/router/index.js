import CampaignsView from '@/views/CampaignsView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import PlayerPage from '@/views/PlayerPage.vue'
import GmPage from '@/views/GmPage.vue'
import HomePage from '@/views/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'home',
      path: '/',
      component: HomePage,
      children: [
        { name: 'campaigns', path: 'campaigns', component: CampaignsView }
        { path: 'player', component: PlayerPage, name: 'player' },
        { path: 'gm', component: GmPage, name: 'gm' },
      ],
    },
  ],
})

export default router
