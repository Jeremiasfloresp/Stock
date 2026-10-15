<template>
  <div>
    <br>
    <h2 class="text-2xl font-bold mb-4">Gestión de Clientes</h2>

    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nombre o identificador"
        class="border p-2 w-full md:w-1/2"
      />
    </div>

    <button @click="showForm = true" class="bg-blue-500 text-white px-4 py-2 mb-4 rounded">
      Agendar Cliente
    </button>
    <!--nuevo cliente Modal-->
    <teleport to="body">
      <div
        v-if="showForm"
        id="modal-overlay"
        class="vue-modal-overlay"
      >
        <div class="vue-modal-content">
          <button @click="showForm = false" class="modal-close">&times;</button>
          <h3 class="text-xl font-bold mb-4">Nuevo Cliente</h3>
          <form @submit.prevent="addCliente">
            <input v-model="newCliente.nombre" type="text" placeholder="Nombre" class="modal-input" required />
            <input v-model="newCliente.identificador" type="text" placeholder="Identificación" class="modal-input" required />
            <input v-model="newCliente.direccion" type="text" placeholder="Dirección" class="modal-input" required />
            <input disabled v-model="newCliente.codigoPostal" type="text" placeholder="Código Postal" class="modal-input" required />
            <input disabled v-model="newCliente.localidad" type="text" placeholder="Localidad" class="modal-input" required />
            <input disabled v-model="newCliente.provincia" type="text" placeholder="Provincia" class="modal-input" />
            <input v-model="newCliente.telefono" type="text" placeholder="Teléfono" class="modal-input" required />
            <input v-model="newCliente.cuentaCorriente" type="text" placeholder="Cuenta Corriente" class="modal-input" required />
            <input v-model="newCliente.cuit" type="text" placeholder="CUIT" class="modal-input" required />
            <div class="flex justify-end mt-4">
              <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded mr-2">Agendar</button>
            </div>
          </form>
        </div>
      </div>
    </teleport>


    <table border="1" style="margin-top: 10px;">
      <thead>
        <tr>
          <th class="border px-4 py-2">Nombre</th>
          <th class="border px-4 py-2">Identificador</th>
          <th class="border px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cliente in paginatedClientes" :key="cliente.id">
          <td class="border px-4 py-0">{{ cliente.nombre }}</td>
          <td class="border px-4 py-0">{{ cliente.identificador }}</td>
          <td class="border px-4 py-0">
            <router-link :to="`/clientes/${cliente.id}`" class="boton">Mascotas</router-link>
            <button @click="editarCliente(cliente)" class="bg-blue-500 text-white px-2 py-1 rounded">Ver/Editar</button>
            <button @click="eliminarCliente(cliente.id)" class="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="mt-4 flex justify-center space-x-2">
      <button :disabled="currentPage === 1" @click="currentPage--" class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
        <
      </button>
      <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="['px-3 py-1 rounded', currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200']">
        {{ page }}
      </button>
      <button :disabled="currentPage === totalPages"@click="currentPage++" class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
        >
      </button>
    </div>
    <!-- Modal de edición -->
    <teleport to="body">
      <div
        v-if="clienteEditando"
        id="modal-edit-overlay"
        class="vue-modal-overlay"
      >
        <div class="vue-modal-content">
          <button @click="clienteEditando = null" class="modal-close">&times;</button>
          <h3 class="text-xl font-bold mb-4">Editar Cliente</h3>
          <form @submit.prevent="guardarCambiosCliente">
            <input v-model="clienteEditando.nombre" type="text" placeholder="Nombre" class="modal-input" required />
            <input v-model="clienteEditando.identificador" type="text" placeholder="Identificación" class="modal-input" required />
            <input v-model="clienteEditando.direccion" type="text" placeholder="Dirección" class="modal-input" required />
            <input v-model="clienteEditando.codigoPostal" type="text" placeholder="Código Postal" class="modal-input" required />
            <input v-model="clienteEditando.localidad" type="text" placeholder="Localidad" class="modal-input" required />
            <input disabled v-model="clienteEditando.provincia" type="text" placeholder="Provincia" class="modal-input" />
            <input v-model="clienteEditando.telefono" type="text" placeholder="Teléfono" class="modal-input" required />
            <input v-model="clienteEditando.cuentaCorriente" type="text" placeholder="Cuenta Corriente" class="modal-input" required />
            <input v-model="clienteEditando.cuit" type="text" placeholder="CUIT" class="modal-input" required />
            <div class="flex justify-end mt-4">
              <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded mr-2">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch  } from 'vue'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'

const searchQuery = ref('')
const showForm = ref(false)
const clientes = ref([])
const clienteEditando = ref(null)

const newCliente = ref({
  nombre: '',
  identificador: '',
  direccion: '',
  codigoPostal: '6400',
  localidad: 'TRENQUE LAUQUEN',
  provincia: 'BUENOS AIRES',
  telefono: '',
  cuentaCorriente: '',
  cuit: ''
})

const fetchClientes = async () => {
  const querySnapshot = await getDocs(collection(db, 'clientes'))
  clientes.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  clientes.value.sort((a, b) => a.nombre.localeCompare(b.nombre))
}

const addCliente = async () => {
  await addDoc(collection(db, 'clientes'), newCliente.value)
  showForm.value = false
  Object.assign(newCliente.value, {
    nombre: '',
    identificador: '',
    direccion: '',
    codigoPostal: '',
    localidad: '',
    provincia: 'BUENOS AIRES',
    telefono: '',
    cuentaCorriente: '',
    cuit: ''
  })
  fetchClientes()
}

const eliminarCliente = async (id) => {
  await deleteDoc(doc(db, 'clientes', id))
  fetchClientes()
}

const editarCliente = (cliente) => {
  clienteEditando.value = { ...cliente }
}

const guardarCambiosCliente = async () => {
  const clienteRef = doc(db, 'clientes', clienteEditando.value.id)
  const { id, ...data } = clienteEditando.value
  await updateDoc(clienteRef, data)
  clienteEditando.value = null
  fetchClientes()
}

const filteredClientes = computed(() => {
  return clientes.value.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    cliente.identificador.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const currentPage = ref(1);
const itemsPerPage = 10;

const paginatedClientes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredClientes.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredClientes.value.length / itemsPerPage);
});

watch(filteredClientes, () => {
  currentPage.value = 1;
});

onMounted(fetchClientes)
</script>
<style lang="css">
  .vue-modal-overlay {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999 !important;
}

.vue-modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1000000 !important;
}

.modal-close {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  font-size: 1.5rem;
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
}

.modal-input {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
}
</style>