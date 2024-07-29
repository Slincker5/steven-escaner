import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/escaneados',
      name: 'escaneado',
      component: () => import('../views/EscaneadosView.vue')
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: () => import('../views/InventarioView.vue')
    },
    {
      path: '/precio-venta',
      name: 'precioventa',
      component: () => import('../views/PrecioVentaView.vue')
    },
    {
      path: '/calcular-interes',
      name: 'calcular',
      component: () => import('../views/CalcularView.vue')
    }
  ]
})

export default router
