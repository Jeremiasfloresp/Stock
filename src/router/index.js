import { createRouter, createWebHistory } from 'vue-router'

import Stock from '../views/GestorStock.vue'
import Clientes from '../views/Clientes.vue'
import NotaPedido from '../views/NotaPedido.vue'

const routes = [
  { path: '/', name: 'Stock', component: Stock },
  { path: '/clientes', name: 'Clientes', component: Clientes },
  { path: '/nota-pedido', name: 'NotaPedido', component: NotaPedido },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router