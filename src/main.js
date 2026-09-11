import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/css/style.css'
import App from './App.vue'
import router from './router'
import { persistPlugin } from '@/stores/plugins/persist'

const app = createApp(App)

const pinia = createPinia()
pinia.use(persistPlugin)

app.use(pinia)
app.use(router)

app.mount('#app')
