import { createRouter, createWebHistory } from 'vue-router'

import Stock from '../views/GestorStock.vue'
import Clientes from '../views/Clientes.vue'
import ClienteDetalle from '../views/ClienteDetalle.vue'
import MascotaDetalle from '../views/MascotaDetalle.vue'
import Recordatorios from '../views/Recordatorios.vue'
import NotaPedido from '../views/NotaPedido.vue'

const routes = [
  { path: '/', name: 'Stock', component: Stock },
  { path: '/clientes', name: 'Clientes', component: Clientes },
  { path: '/clientes/:clienteId', name: 'ClienteDetalle', component: ClienteDetalle, props: true },
  { path: '/clientes/:clienteId/mascotas/:mascotaId', name: 'MascotaDetalle', component: MascotaDetalle, props: true },
  { path: '/recordatorios', name: 'Recordatorios', component: Recordatorios },
  { path: '/nota-pedido', name: 'NotaPedido', component: NotaPedido },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router