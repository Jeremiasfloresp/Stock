<template>
  <div class="p-4">
    <br />
    <router-link to="/clientes">&larr; Volver a clientes</router-link>

    <div v-if="cliente">
      <h2 class="text-2xl font-bold mb-2">{{ cliente.nombre }}</h2>
      <p>
        <strong>Tel:</strong> {{ cliente.telefono }} |
        <strong>Dirección:</strong> {{ cliente.direccion }}
      </p>

      <h3 class="text-xl font-bold mt-4 mb-2">Mascotas</h3>
      <button @click="abrirForm()" class="bg-blue-500 text-white px-4 py-2 mb-4 rounded">Agregar mascota</button>

      <p v-if="!mascotas.length">Este cliente todavía no tiene mascotas cargadas.</p>
      <table v-else border="1">
        <thead>
          <tr>
            <th class="border px-4 py-2">Nombre</th>
            <th class="border px-4 py-2">Especie</th>
            <th class="border px-4 py-2">Raza</th>
            <th class="border px-4 py-2">Sexo</th>
            <th class="border px-4 py-2">Edad</th>
            <th class="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in mascotas" :key="m.id">
            <td class="border px-4 py-0">{{ m.nombre }}</td>
            <td class="border px-4 py-0">{{ m.especie }}</td>
            <td class="border px-4 py-0">{{ m.raza }}</td>
            <td class="border px-4 py-0">{{ m.sexo }}</td>
            <td class="border px-4 py-0">{{ edad(m.fechaNacimiento) }}</td>
            <td class="border px-4 py-0">
              <router-link :to="`/clientes/${clienteId}/mascotas/${m.id}`" class="bg-green-500 text-white px-2 py-1 rounded">Ficha clínica</router-link>
              <button @click="abrirForm(m)" class="bg-blue-500 text-white px-2 py-1 rounded">Editar</button>
              <button @click="eliminar(m)" class="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="cargado">Cliente no encontrado.</p>

    <teleport to="body">
      <div v-if="form" class="vue-modal-overlay">
        <div class="vue-modal-content">
          <button @click="form = null" class="modal-close">&times;</button>
          <h3 class="text-xl font-bold mb-4">{{ form.id ? 'Editar' : 'Nueva' }} mascota</h3>
          <form @submit.prevent="guardar">
            <input v-model="form.nombre" type="text" placeholder="Nombre" class="modal-input" required />
            <select v-model="form.especie" class="modal-input" required>
              <option value="" disabled>Especie</option>
              <option v-for="e in especies" :key="e" :value="e">{{ e }}</option>
            </select>
            <input v-model="form.raza" type="text" placeholder="Raza" class="modal-input" />
            <select v-model="form.sexo" class="modal-input">
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
            <label>Fecha de nacimiento</label>
            <input v-model="form.fechaNacimiento" type="date" class="modal-input" />
            <input v-model="form.color" type="text" placeholder="Color / pelaje" class="modal-input" />
            <input v-model="form.chip" type="text" placeholder="N° de chip (opcional)" class="modal-input" />
            <label><input v-model="form.castrado" type="checkbox" /> Castrado/a</label>
            <textarea v-model="form.notas" placeholder="Notas (alergias, carácter, etc.)" class="modal-input"></textarea>
            <div class="flex justify-end mt-4">
              <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, storage } from '../firebase'
import { ref as storageRef, deleteObject } from 'firebase/storage'
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

const props = defineProps({ clienteId: String })

const especies = ['Perro', 'Gato', 'Ave', 'Roedor', 'Reptil', 'Equino', 'Otro']
const cliente = ref(null)
const cargado = ref(false)
const mascotas = ref([])
const form = ref(null)

const mascotasRef = () => collection(db, 'clientes', props.clienteId, 'mascotas')

const cargar = async () => {
  const snap = await getDoc(doc(db, 'clientes', props.clienteId))
  cliente.value = snap.exists() ? { id: snap.id, ...snap.data() } : null
  cargado.value = true
  if (!cliente.value) return
  const ms = await getDocs(mascotasRef())
  mascotas.value = ms.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

const nuevaMascota = () => ({
  nombre: '', especie: '', raza: '', sexo: 'Macho', fechaNacimiento: '',
  color: '', chip: '', castrado: false, notas: ''
})

const abrirForm = (m) => {
  form.value = m ? { ...m } : nuevaMascota()
}

const guardar = async () => {
  const { id, ...data } = form.value
  if (id) await updateDoc(doc(db, 'clientes', props.clienteId, 'mascotas', id), data)
  else await addDoc(mascotasRef(), { ...data, creada: new Date().toISOString() })
  form.value = null
  cargar()
}

// Los datos clínicos viven en subcolecciones; Firestore no las borra en cascada.
const subcolecciones = ['visitas', 'tratamientos', 'vacunas', 'placas']

const eliminar = async (m) => {
  if (!confirm(`¿Eliminar a ${m.nombre} y todo su historial clínico?`)) return
  const base = ['clientes', props.clienteId, 'mascotas', m.id]
  for (const sub of subcolecciones) {
    const snap = await getDocs(collection(db, ...base, sub))
    for (const d of snap.docs) {
      if (sub === 'placas' && d.data().path) {
        await deleteObject(storageRef(storage, d.data().path)).catch(() => {})
      }
      await deleteDoc(d.ref)
    }
  }
  await deleteDoc(doc(db, ...base))
  cargar()
}

const edad = (fecha) => {
  if (!fecha) return '-'
  const nac = new Date(fecha)
  let meses = (new Date().getFullYear() - nac.getFullYear()) * 12 + new Date().getMonth() - nac.getMonth()
  if (meses < 0) return '-'
  return meses >= 12 ? `${Math.floor(meses / 12)} años` : `${meses} meses`
}

onMounted(cargar)
</script>
