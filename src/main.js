import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/css/style.css'
import App from './App.vue'
import router from './router'
import { persistPlugin } from '@/stores/plugins/persist'
import { readStorage } from '@/utils/storage'

const app = createApp(App)

const pinia = createPinia()
pinia.use(persistPlugin)

app.use(pinia)
app.use(router)

if (readStorage('campaigns') === null) {
  const { seedCampaigns } = await import('@/data/seed')
  seedCampaigns(pinia)
}

app.mount('#app')
