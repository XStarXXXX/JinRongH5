import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/tracking',
    name: 'tracking',
    component: () => import('../views/TrackingView.vue')
  },
  {
    path: '/allocation',
    name: 'allocation',
    component: () => import('../views/AllocationView.vue')
  },
  {
    path: '/simulation',
    name: 'simulation',
    component: () => import('../views/SimulationView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
