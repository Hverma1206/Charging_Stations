import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import auth from './store/auth'

const app = createApp(App)
app.use(router)
app.config.globalProperties.$auth = auth
app.mount('#app')
