<template>
  <div class="nota-pedido-container">
    <h1 class="text-2xl font-bold mb-4">Generar Nota de Pedido</h1>

    <!-- Formulario de datos de la nota de pedido -->
    <form @submit.prevent="generarNotaDePedido" class="space-y-4">
      <div>
        <label for="cliente" class="block">Cliente:</label>
        <input v-model="nota.cliente" id="cliente" type="text" class="border p-2 w-full" required />
      </div>

      <div>
        <label for="fecha" class="block">Fecha:</label>
        <input v-model="nota.fecha" id="fecha" type="date" class="border p-2 w-full" required />
      </div>

      <div>
        <label for="items" class="block">Productos:</label>
        <div v-for="(item, index) in nota.items" :key="index" class="flex gap-2 mb-2">
          <input v-model="item.codigo" type="text" placeholder="Código" class="border p-2 w-1/4" required />
          <input v-model="item.descripcion" type="text" placeholder="Descripción" class="border p-2 w-1/4" required />
          <input v-model="item.cantidad" type="number" placeholder="Cantidad" class="border p-2 w-1/4" required />
          <input v-model="item.precioUnitario" type="number" placeholder="Precio Unitario" class="border p-2 w-1/4" required />
        </div>
        <button @click="agregarProducto" type="button" class="bg-blue-500 text-white px-4 py-2 rounded">Agregar Producto</button>
      </div>

      <div class="mt-4">
        <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">Generar Nota de Pedido</button>
      </div>
    </form>

    <!-- Botón para imprimir la nota generada -->
    <button @click="imprimirNota" class="mt-4 bg-yellow-500 text-white px-4 py-2 rounded">Imprimir Nota</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Datos para la nota de pedido
const nota = ref({
  cliente: '',
  fecha: '',
  items: [
    { codigo: '', descripcion: '', cantidad: 1, precioUnitario: 0 }
  ],
  total: 0
});

// Agregar un producto al formulario
const agregarProducto = () => {
  nota.value.items.push({ codigo: '', descripcion: '', cantidad: 1, precioUnitario: 0 });
};

// Calcular el total de la nota de pedido
const calcularTotal = () => {
  let total = 0;
  nota.value.items.forEach(item => {
    total += item.cantidad * item.precioUnitario;
  });
  nota.value.total = total;
};

// Generar la nota de pedido
const generarNotaDePedido = () => {
  calcularTotal();
};

// Imprimir la nota de pedido
const imprimirNota = () => {
  const ventana = window.open('', '', 'width=800,height=600');

  const contenidoHTML = `
    <html>
      <head>
        <title>Nota de Pedido</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .total {
            margin-top: 20px;
            text-align: right;
            font-size: 1.2em;
          }
        </style>
      </head>
      <body>
        <h1>Nota de Pedido</h1>
        <p><strong>Cliente:</strong> ${nota.value.cliente}</p>
        <p><strong>Fecha:</strong> ${nota.value.fecha}</p>

        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${nota.value.items.map(item => `
              <tr>
                <td>${item.codigo}</td>
                <td>${item.descripcion}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precioUnitario.toFixed(2)}</td>
                <td>$${(item.cantidad * item.precioUnitario).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total"><strong>Total: $${nota.value.total.toFixed(2)}</strong></div>
      </body>
    </html>
  `;

  ventana.document.write(contenidoHTML);
  ventana.document.close();
  ventana.focus();
  ventana.print();
  ventana.close();
};
</script>

<style scoped>
.nota-pedido-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

button {
  cursor: pointer;
}
</style>