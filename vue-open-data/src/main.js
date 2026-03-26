import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PieChart from '@/components/PieChart.vue'
createApp(App).use(router).mount('#app')