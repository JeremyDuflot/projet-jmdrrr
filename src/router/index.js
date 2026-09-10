import CampaignsView from '@/views/CampaignsView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'homepage',
      path: '/',
      children: [{ name: 'campaigns', path: 'campaigns', component: CampaignsView }],
    },
  ],
})

export default router
