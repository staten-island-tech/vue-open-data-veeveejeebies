import { createRouter, createWebHistory } from 'vue-router'
import Data from '../views/Data.vue'

const routes = [
  {
    path: '/',
    name: 'data',
    component: Data
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router