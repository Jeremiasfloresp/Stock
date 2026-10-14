<template>
  <div class="p-4">
    <br />
    <h2 class="text-2xl font-bold mb-2">Recordatorios de vacunas y desparasitaciones</h2>

    <div class="mb-3">
      <label class="mr-2">Mostrar:</label>
      <select v-model="filtro" class="border p-1">
        <option value="pendientes">Vencidas y próximas ({{ DIAS_AVISO }} días)</option>
        <option value="vencida">Solo vencidas</option>
        <option value="todas">Todas con refuerzo programado</option>
      </select>
    </div>

    <p v-if="cargando">Cargando...</p>
    <p v-else-if="!filas.length">No hay recordatorios para mostrar.</p>
    <table v-else border="1">
      <thead>
        <tr>
          <th class="border px-4 py-2">Próxima dosis</th>
          <th class="border px-4 py-2">Estado</th>
          <th class="border px-4 py-2">Mascota</th>
          <th class="border px-4 py-2">Dueño</th>
          <th class="border px-4 py-2">Teléfono</th>
          <th class="border px-4 py-2">Qué</th>
          <th class="border px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in filas" :key="f.id">
          <td class="border px-4 py-0">{{ formatearFecha(f.proximaDosis) }}</td>
          <td class="border px-4 py-0">
            <span :class="'estado-' + f.estado.clave">{{ f.estado.texto }}</span>
          </td>
          <td class="border px-4 py-0">{{ f.mascotaNombre }}</td>
          <td class="border px-4 py-0">{{ f.dueno?.nombre }}</td>
          <td class="border px-4 py-0">{{ f.dueno?.telefono }}</td>
          <td class="border px-4 py-0">{{ f.tipo === 'desparasitacion' ? 'Desparasitación' : 'Vacuna' }}: {{ f.nombre }}</td>
          <td class="border px-4 py-0">
            <router-link :to="`/clientes/${f.clienteId}/mascotas/${f.mascotaId}`" class="bg-green-500 text-white px-2 py-1 rounded">Ficha</router-link>
            <a v-if="linkWhatsapp(f)" :href="linkWhatsapp(f)" target="_blank" rel="noopener" class="bg-blue-500 text-white px-2 py-1 rounded">WhatsApp</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, collectionGroup, getDocs } from 'firebase/firestore'
import { DIAS_AVISO, estadoDosis, ultimasDosis, formatearFecha } from '../utils/vacunas'

const cargando = ref(true)
const filtro = ref('pendientes')
const dosis = ref([])
const clientes = ref({})

onMounted(async () => {
  const [dSnap, cSnap] = await Promise.all([
    getDocs(collectionGroup(db, 'vacunas')),
    getDocs(collection(db, 'clientes'))
  ])
  clientes.value = Object.fromEntries(cSnap.docs.map(d => [d.id, { id: d.id, ...d.data() }]))
  dosis.value = dSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  cargando.value = false
})

const filas = computed(() =>
  ultimasDosis(dosis.value)
    .filter(d => d.proximaDosis && clientes.value[d.clienteId])
    .map(d => ({ ...d, estado: estadoDosis(d.proximaDosis), dueno: clientes.value[d.clienteId] }))
    .filter(d => filtro.value === 'todas'
      || (filtro.value === 'vencida' ? d.estado.clave === 'vencida' : d.estado.clave !== 'aldia'))
    .sort((a, b) => a.proximaDosis.localeCompare(b.proximaDosis))
)

// Mientras no haya API de WhatsApp, abre un chat con el mensaje ya redactado.
const linkWhatsapp = (f) => {
  const tel = (f.dueno?.telefono || '').replace(/\D/g, '')
  if (!tel) return null
  const que = f.tipo === 'desparasitacion' ? 'la desparasitación' : `la vacuna ${f.nombre}`
  const texto = `Hola ${f.dueno.nombre}, te escribimos de Veterinaria Arzac: a ${f.mascotaNombre} le corresponde ${que} el ${formatearFecha(f.proximaDosis)}. ¡Pedí tu turno!`
  return `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`
}
</script>
