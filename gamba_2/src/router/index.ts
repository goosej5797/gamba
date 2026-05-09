import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Index from '@/pages/index.vue'
import Login from '@/pages/login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Index,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      component: Login,
      meta: { requiresAuth: false },
    },
  ],
})

router.beforeEach(async to => {
  const auth = useAuthStore()
  await auth.waitUntilReady()

  if (to.meta.requiresAuth && !auth.user) return '/login'
  if (to.path === '/login' && auth.user) return '/'
})

export default router
