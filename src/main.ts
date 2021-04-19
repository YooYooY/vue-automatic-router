import { createApp } from 'vue'
import App from './App.vue'

;(async ()=>{
    const module = await import("./router");
    const router = await module.default;
    createApp(App).use(router).mount('#app')
})()
