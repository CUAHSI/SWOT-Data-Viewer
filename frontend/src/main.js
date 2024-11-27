import './assets/css/global.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

const app = createApp(App)
const pinia = createPinia()

// https://prazdevs.github.io/pinia-plugin-persistedstate/
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

// Vuetify
import 'vuetify/styles'

app.use(vuetify)

app.mount('#app')
