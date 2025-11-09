import { createApp } from 'vue'
import { Quasar, Notify } from 'quasar'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './app/router'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

import '@/shared/styles/main.css'

const app = createApp(App)

app.use(Quasar, {
  plugins: { Notify },
})

app.use(createPinia())
app.use(router)

app.mount('#app')
