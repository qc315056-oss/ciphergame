import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/cipher-types', name: 'CipherTypes', component: () => import('../views/CipherTypes.vue') },
  { path: '/cipher/:id/tutorial', name: 'Tutorial', component: () => import('../views/Tutorial.vue') },
  { path: '/cipher/:id/levels', name: 'LevelList', component: () => import('../views/LevelList.vue') },
  { path: '/cipher/:id/level/:levelId', name: 'Decrypt', component: () => import('../views/Decrypt.vue') },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
