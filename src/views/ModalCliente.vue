<template>
  <teleport to="body">
    <div v-if="isOpen" class="vue-modal-overlay">
      <div class="vue-modal-content">
        <button class="modal-close" @click="cerrarModal">X</button>
        <h2 class="text-xl mb-4">Seleccionar Cliente</h2>
        
        <!-- Input para buscar cliente -->
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar cliente por nombre o identificador" 
          class="modal-input mb-4"
        />
        
        <!-- Lista de clientes filtrados -->
        <ul>
          <li @click="seleccionarCliente(cliente)" 
              v-for="cliente in clientesFiltrados" :key="cliente.id" 
              class="cliente-item">
            {{ cliente.nombre }} - {{ cliente.identificador }}
          </li>
          <li @click="seleccionarConsumidorFinal" class="cliente-item">
            Consumidor Final
          </li>
        </ul>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue';

const isOpen = ref(false);
const searchQuery = ref('');
const clientes = ref([]);
const selectedCliente = ref(null);

// Método para abrir el modal
const abrirModal = (clientesData) => {
  clientes.value = clientesData;
  isOpen.value = true;
};

// Método para cerrar el modal
const cerrarModal = () => {
  isOpen.value = false;
};

// Método para seleccionar un cliente
const seleccionarCliente = (cliente) => {
  selectedCliente.value = cliente;
  cerrarModal();
};

// Método para seleccionar "Consumidor Final"
const seleccionarConsumidorFinal = () => {
  selectedCliente.value = {
    nombre: 'Consumidor Final',
    identificador: '',
    telefono: '',
    cuit: '',
    direccion: ''
  };
  cerrarModal();
};

// Filtrado de clientes según el texto de búsqueda
const clientesFiltrados = computed(() => {
  return clientes.value.filter(cliente => {
    return cliente.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
           cliente.identificador.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});
</script>

<style scoped>
.vue-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
}

.vue-modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  position: relative;
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
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
}

.cliente-item {
  padding: 0.5rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.cliente-item:hover {
  background-color: #f0f0f0;
}
</style>
