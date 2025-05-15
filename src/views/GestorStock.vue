<template>
  <div>
    <h2>Gestor de Stock</h2>

    <input
      v-model="busqueda"
      placeholder="Buscar por código o descripción"
      style="margin-bottom: 10px; width: 100%; padding: 5px;"
    />
    <form @submit.prevent="modoEdicion ? actualizarProducto() : agregarProducto()">
      <input v-model="nuevo.codigo" placeholder="Código" required />
      <input v-model="nuevo.descripcion" placeholder="Descripción" required />
      <input v-model.number="nuevo.existencias" placeholder="Existencias" type="number" required />
      <input v-model.number="nuevo.precioUnitario" placeholder="Precio" type="number" step="0.01" required />
      <select v-model.number="nuevo.modo" required>
        <option :value="0">Por unidad</option>
        <option :value="1">Por peso</option>
      </select>
      <input v-model.number="nuevo.descuento" placeholder="Descuento (%)" type="number" />
      <button type="submit">{{ modoEdicion ? 'Actualizar' : 'Agregar producto' }}</button>
      <button v-if="modoEdicion" type="button" @click="cancelarEdicion">Cancelar</button>
    </form>
    <table border="1" style="margin-top: 10px;">
      <thead>
        <tr>
          <th class="border px-4 py-2">Código</th>
          <th class="border px-4 py-2">Descripción</th>
          <th class="border px-4 py-2">Stock</th>
          <th class="border px-4 py-2">Precio</th>
          <th class="border px-4 py-2">Modo</th>
          <th class="border px-4 py-2">Descuento</th>
          <th class="border px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prod in productosFiltrados" :key="prod.id">
          <td class="border px-1 py-0">{{ prod.codigo }}</td>
          <td class="border px-1 py-0">{{ prod.descripcion }}</td>
          <td class="border px-1 py-0">{{ prod.existencias }}</td>
          <td class="border px-1 py-0">{{ prod.precioUnitario }}</td>
          <td class="border px-1 py-0">{{ prod.modo === 1 ? 'Peso' : 'Unidad' }}</td>
          <td class="border px-1 py-0">{{ prod.descuento }}%</td>
          <td class="border px-1 py-0">
            <button @click="editarProducto(prod)">Editar</button>
            <button @click="eliminarProducto(prod.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Paginación -->
    <div class="flex justify-center mt-4">
      <button :disabled="currentPage === 1" @click="currentPage--" class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
        <
      </button>
      <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="['px-3 py-1 mx-1 rounded',currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200']">
        {{ page }}
      </button>
      <button :disabled="currentPage === totalPages"@click="currentPage++" class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
        >
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch} from 'vue'
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore'

const productos = ref([])
const busqueda = ref('')

const nuevo = ref({
  codigo: '',
  descripcion: '',
  existencias: 0,
  precioUnitario: 0,
  descuento: 0,
})

const modoEdicion = ref(false)
const idEditando = ref(null)

const cargarProductos = async () => {
  const snapshot = await getDocs(collection(db, 'productos'))
  productos.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

const productosFiltrados = computed(() => {
  const filtro = busqueda.value.toLowerCase()
  return productos.value
  .filter(
    prod =>
      prod.codigo.toLowerCase().includes(filtro) ||
      prod.descripcion.toLowerCase().includes(filtro)
  )
  .sort((a, b) => {
    const aCodigo = isNaN(a.codigo) ? a.codigo : Number(a.codigo)
    const bCodigo = isNaN(b.codigo) ? b.codigo : Number(b.codigo)
    return aCodigo > bCodigo ? 1 : aCodigo < bCodigo ? -1 : 0
  })
})

const agregarProducto = async () => {
  await addDoc(collection(db, 'productos'), { ...nuevo.value })
  limpiarFormulario()
  await cargarProductos()
}

const editarProducto = (prod) => {
  modoEdicion.value = true
  idEditando.value = prod.id
  nuevo.value = {
    codigo: prod.codigo,
    descripcion: prod.descripcion,
    existencias: prod.existencias,
    precioUnitario: prod.precioUnitario,
    descuento: prod.descuento,
  }
}

const actualizarProducto = async () => {
  const refProducto = doc(db, 'productos', idEditando.value)
  await updateDoc(refProducto, { ...nuevo.value })
  limpiarFormulario()
  modoEdicion.value = false
  idEditando.value = null
  await cargarProductos()
}

const eliminarProducto = async (id) => {
  if (confirm('¿Seguro que querés eliminar este producto?')) {
    await deleteDoc(doc(db, 'productos', id))
    await cargarProductos()
  }
}

const cancelarEdicion = () => {
  limpiarFormulario()
  modoEdicion.value = false
  idEditando.value = null
}

const limpiarFormulario = () => {
  nuevo.value = {
    codigo: '',
    descripcion: '',
    existencias: 0,
    precioUnitario: 0,
    modo: 0, // 0 = unitario, 1 = por peso
    descuento: 0,
  }
}

const currentPage = ref(1);
const itemsPerPage = 20;

const productosPaginados = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return productosFiltrados.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(productosFiltrados.value.length / itemsPerPage);
});

// Al cambiar el filtro, volvemos a página 1
watch(productosFiltrados, () => {
  currentPage.value = 1;
});

onMounted(cargarProductos)
</script>