<template>
  <div>
    <!-- Botón que abre el modal -->
    <button @click="open = true">Nueva Nota</button>
    <!-- Teleport para el modal -->
    <teleport to="body">
      <div v-if="open" class="modal-overlay">
        <div class="modal-content">
          <div class="container">
            <div class="box">
              <button class="close-btn" @click="vaciarProductosAuxiliar(); open = false">X</button>

              <!-- Contenido del formulario -->
              <!-- Cliente -->
              <div>
                <label for="cliente">Cliente</label><br />
                <input
                  id="cliente"
                  v-model="clienteInput"
                  @input="filtrarClientes"
                  @change="seleccionarCliente"
                  list="lista-clientes"
                  placeholder="Buscar cliente..."
                />
                <datalist id="lista-clientes">
                  <option value="CONSUMIDOR FINAL">CONSUMIDOR FINAL</option>
                  <option
                    v-for="cliente in clientesFiltrados"
                    :key="cliente.id"
                    :value="cliente.identificador + ' - ' + cliente.nombre"
                  />
                </datalist>
              </div>

              <!-- Producto -->
              <div>
                <label>Producto</label><br />
                <input
                  v-model="productoInput"
                  @change="seleccionarProducto"
                  @input="filtrarProductos"
                  list="lista-productos"
                  placeholder="Buscar producto por código o descripción"
                />
                <datalist id="lista-productos">
                  <option
                    v-for="producto in productosFiltrados"
                    :key="producto.id"
                    :value="producto.codigo + ' - ' + producto.descripcion"
                  />
                </datalist>
              </div>

              <!-- Detalles -->
              <div>
                <label>Cantidad</label>
                <br/>
                <input v-model.number="cantidad" type="number" />
                <br/>
                <label>Peso</label>
                <br/>
                <input v-model.number="peso" type="number" />
                <br/>
                <label>Precio</label>
                <br/>
                <input :value="productoSeleccionado?.precioUnitario || ''" disabled />
                <br/>
                <label>Stock</label>
                <br/>
                <input :value="productoSeleccionado?.existencias || ''" disabled />
                <br/><br/>
                <button @click="agregarProducto">Agregar</button>
              </div>
            </div>
            <div class="box2">
              <!-- Lista de productos agregados -->
              <div style="background-color: transparent;">
                <table border="1" style="margin-top: 10px; text-align: center;">
                  <thead>
                    <tr>
                      <th class="border px-4 py-2">Código</th>
                      <th class="border px-4 py-2">Descripción</th>
                      <th class="border px-4 py-2">Unidades</th>
                      <th class="border px-4 py-2">Peso(KG)</th>
                      <th class="border px-4 py-2">Precio($)</th>
                      <th class="border px-4 py-2">Dto</th>
                      <th class="border px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in detalleVenta" :key="index">
                      <td class="border px-1 py-0">{{ item.codigo }}</td>
                      <td class="border px-1 py-0">{{ item.descripcion }}</td>
                      <td class="border px-1 py-0">{{ item.cantidad }}</td>
                      <td class="border px-1 py-0">{{ item.peso }}</td>
                      <td class="border px-1 py-0">{{ item.precio }}</td>
                      <td class="border px-1 py-0">{{ item.descuento }}%</td>
                      <td class="border px-1 py-0">{{ ((item.precio * (item.modo === 1 ? item.peso : item.cantidad)).toFixed(2)) }}</td>
                    </tr>
                    <tr style="border: 0px">
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>TOTAL</td>
                      <td>${{ total.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <button @click="generarNota">Generar</button>
        </div>
      </div>
    </teleport>
  </div>
  <div class="p-4">
    <table class="min-w-full table-auto border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-200">
          <th class="border p-2">ID</th>
          <th class="border p-2">Fecha</th>
          <th class="border p-2">Cliente</th>
          <th class="border p-2">Monto Total</th>
          <th class="border p-2">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="nota in notas" :key="nota.id" class="hover:bg-gray-100">
          <td class="border p-2">{{ nota.id }}</td>
          <td class="border p-2">{{ nota.fecha }}</td>
          <td class="border p-2">{{ nota.cliente }}</td>
          <td class="border p-2">$ {{ nota.total.toFixed(2) }}</td>
          <td class="border p-2 flex gap-2 justify-center">
             <button @click="imprimirNota(nota.id)" class="bg-green-500 text-white px-3 py-1 rounded">Imprimir</button>
            <button @click="eliminarNota(nota.id)" class="bg-red-500 text-white px-3 py-1 rounded">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- Paginación -->
  <div class="mt-4 flex justify-center gap-1 flex-wrap">
    <button :disabled="paginaActual === 1" @click="paginaActual--" class="px-3 py-1 border rounded disabled:opacity-50">
      <
    </button>
    <button v-for="num in paginasAMostrar" :key="num" @click="paginaActual = num" :class="['px-3 py-1 border rounded',{ 'bg-blue-500 text-white': paginaActual === num }]">
      {{ num }}
    </button>
    <button :disabled="paginaActual === totalPaginas" @click="paginaActual++" class="px-3 py-1 border rounded disabled:opacity-50">
      >
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, addDoc, deleteDoc, getDoc, updateDoc, doc} from 'firebase/firestore'
import { db } from '../firebase'
import { jsPDF } from "jspdf";

const open = ref(false)
const clienteInput = ref('')
const productoInput = ref('')
const cantidad = ref(1)
const peso = ref(0)

const clienteSeleccionado = ref(null)
const productoSeleccionado = ref(null)

const clientes = ref([])
const clientesFiltrados = ref([])
const productos = ref([])
const productosFiltrados = ref([])

const detalleVenta = ref([])

const notas = ref([])

const total = computed(() =>
  detalleVenta.value.reduce((suma, item) => suma + ((item.precio * (item.modo === 1 ? item.peso : item.cantidad)) * (1 - (item.descuento || 0) / 100)), 0)
)

const paginaActual = ref(1);
const elementosPorPagina = 20; // Puedes cambiar este valor

// Total de páginas (redondeado hacia arriba)
const totalPaginas = computed(() => Math.ceil(notas.value.length / elementosPorPagina));

// Notas a mostrar en la página actual
const notasPagina = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina;
  return notas.value.slice(inicio, inicio + elementosPorPagina);
});

// Para mostrar los botones de página, máximo 20
const paginasAMostrar = computed(() => {
  const maxBotones = 20;
  const total = totalPaginas.value;
  let inicio = 1;
  let fin = total;

  if (total > maxBotones) {
    // Intenta centrar los botones alrededor de la página actual
    inicio = Math.max(paginaActual.value - Math.floor(maxBotones / 2), 1);
    fin = inicio + maxBotones - 1;
    if (fin > total) {
      fin = total;
      inicio = fin - maxBotones + 1;
    }
  }

  const paginas = [];
  for (let i = inicio; i <= fin; i++) {
    paginas.push(i);
  }
  return paginas;
});


onMounted(async () => {
  const clientesSnap = await getDocs(collection(db, 'clientes'))
  clientes.value = clientesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  clientesFiltrados.value = clientes.value

  const productosSnap = await getDocs(collection(db, 'productos'))
  productos.value = productosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  productosFiltrados.value = productos.value

  // Cargar notas realizadas
  const notasSnap = await getDocs(collection(db, 'nota', 'realizadas', 'notas'));
  notas.value = notasSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      cliente: data.cliente?.nombre || 'CONSUMIDOR FINAL',
      total: data.total || 0,
      fecha: data.fecha || null,
    };
  });
})

function filtrarClientes() {
  const texto = clienteInput.value.toLowerCase()
  clientesFiltrados.value = clientes.value.filter(c =>
    c.nombre.toLowerCase().includes(texto) || c.identificador.toLowerCase().includes(texto)
  )
}

function filtrarProductos() {
  const texto = productoInput.value.toLowerCase()
  productosFiltrados.value = productos.value.filter(p =>
    p.descripcion.toLowerCase().includes(texto) || p.codigo.toLowerCase().includes(texto)
  )
}

async function agregarProducto() {
  if (!productoSeleccionado.value) return;

  // Primero agregamos el producto al detalle de la venta
  detalleVenta.value.push({
    id: productoSeleccionado.value.id,
    codigo: productoSeleccionado.value.codigo,
    descripcion: productoSeleccionado.value.descripcion,
    cantidad: cantidad.value,
    peso: peso.value,
    modo: productoSeleccionado.value.modo,
    descuento: productoSeleccionado.value.descuento,
    precio: productoSeleccionado.value.precioUnitario,
    existencias: productoSeleccionado.value.existencias,
  });

  // Ahora subimos los datos a Firebase
  try {
    const productoData = {
      codigo: productoSeleccionado.value.codigo,
      descripcion: productoSeleccionado.value.descripcion,
      cantidad: cantidad.value,
      peso: peso.value,
      precio: productoSeleccionado.value.precioUnitario,
      descuento: productoSeleccionado.value.descuento,
      total: ((productoSeleccionado.value.precioUnitario * (productoSeleccionado.value.modo === 1 ? peso.value : cantidad.value)) * (1 - (productoSeleccionado.value.descuento || 0) / 100)).toFixed(2)
    };

    const docRef = await addDoc(collection(db, 'nota', 'auxiliar', 'productos'), productoData);
    console.log('Producto agregado a Firebase:', docRef.id);
  } catch (e) {
    console.error('Error al agregar producto a Firebase:', e);
  }

  // Restablecemos los valores después de agregar el producto
  cantidad.value = 1;
  peso.value = 0;
  productoSeleccionado.value = null;
  productoInput.value = '';
}
function seleccionarProducto() {
  const valor = productoInput.value
  const encontrado = productos.value.find(p =>
    `${p.codigo} - ${p.descripcion}` === valor
  )
  productoSeleccionado.value = encontrado || null
}
function seleccionarCliente() {
  const valor = clienteInput.value
  const encontrado = clientes.value.find(c =>
    `${c.identificador} - ${c.nombre}` === valor
  )
  clienteSeleccionado.value = encontrado || null
}
async function vaciarProductosAuxiliar() {
  try {
    // Eliminar productos de auxiliar
    const productosSnapshot = await getDocs(collection(db, 'nota', 'auxiliar', 'productos'));
    for (const docItem of productosSnapshot.docs) {
      await deleteDoc(docItem.ref);
      console.log(`Producto eliminado de Firebase: ${docItem.id}`);
    }

    // Eliminar clientes de auxiliar
    const clientesSnapshot = await getDocs(collection(db, 'nota', 'auxiliar', 'clientes'));
    for (const docItem of clientesSnapshot.docs) {
      await deleteDoc(docItem.ref);
      console.log(`Cliente eliminado de Firebase: ${docItem.id}`);
    }

    // Limpiar los campos locales
    detalleVenta.value = [];
    clienteInput.value = '';  // Actualización correcta
    productoInput.value = ''; // Actualización correcta
    clienteSeleccionado.value = null;

    console.log('Colecciones auxiliares vaciadas correctamente.');
  } catch (e) {
    console.error('Error al vaciar la colección auxiliar:', e);
  }
}

function obtenerFechaArgentina() {
  const ahora = new Date();

  // Ajuste de zona horaria manual: -3 horas
  const argentina = new Date(ahora.getTime() - 3 * 60 * 60 * 1000);

  const año = argentina.getFullYear();
  const mes = String(argentina.getMonth() + 1).padStart(2, '0');
  const día = String(argentina.getDate()).padStart(2, '0');

  return `${día}/${mes}/${año}`;
}

const generarNota = async () => {
  try {
    if (!clienteSeleccionado.value || detalleVenta.value.length === 0) {
      alert("Faltan datos: cliente o productos.");
      return;
    }

    // Fecha en formato YYYY-MM-DD
    const fecha = obtenerFechaArgentina();

    // Validar stock suficiente antes de guardar la nota
    for (const item of detalleVenta.value) {
      if (!item.id) {
        console.alert(`El producto "${item.descripcion}" no tiene ID válido.`);
        return;
      }

      const productoRef = doc(db, 'productos', item.id);
      const productoSnap = await getDoc(productoRef);

      if (!productoSnap.exists()) {
        console.alert(`Producto no encontrado: ${item.descripcion}`);
        return;
      }

      const stockActual = productoSnap.data().existencias || 0;

      if (stockActual < item.cantidad) {
        console.alert(`Stock insuficiente para "${item.descripcion}". Actual: ${stockActual}, requerido: ${item.cantidad}`);
        return;
      }
    }

    // Guardar la nota completa en una colección de notas realizadas
    const nuevaNota = {
      cliente: clienteSeleccionado.value,
      productos: detalleVenta.value,
      total: total.value,
      fecha: fecha,
    };

    await addDoc(collection(db, 'nota', 'realizadas', 'notas'), nuevaNota);

    for (const item of detalleVenta.value) {
      const productoRef = doc(db, 'productos', item.id);
      const productoSnap = await getDoc(productoRef);

      if (productoSnap.exists()) {
        const stockActual = productoSnap.data().existencias || 0;
        const nuevoStock = Math.max(stockActual - item.cantidad, 0);

        await updateDoc(productoRef, {
          existencias: nuevoStock
        });
      }
    }

    // Eliminar cliente de auxiliar/clientes
    if (clienteSeleccionado.value.id) {
      await deleteDoc(doc(db, 'nota', 'auxiliar', 'clientes', clienteSeleccionado.value.id));
    }
    vaciarProductosAuxiliar();
    // Limpiar los campos
    clienteSeleccionado.value = null;
    detalleVenta.value = [];
    total.value = 0;
    console.log("Nota generada con éxito.");
    open.value = false;
  } catch (error) {
    console.error("Error al generar la nota:", error);
  }
};

async function eliminarNota(idNota) {
  if (confirm('¿Estás seguro de que deseas eliminar esta nota de pedido?')) {
    try {
      const notaRef = doc(db, 'nota', 'realizadas', 'notas', idNota);
      const notaSnap = await getDoc(notaRef);

      if (!notaSnap.exists()) {
        alert("Nota no encontrada.");
        return;
      }

      const notaData = notaSnap.data();
      const productos = notaData.productos || [];

      // Devolver el stock de cada producto
      for (const item of productos) {
        if (!item.id) continue; // Si no tiene ID, no se puede actualizar

        const productoRef = doc(db, 'productos', item.id);
        const productoSnap = await getDoc(productoRef);

        if (productoSnap.exists()) {
          const stockActual = productoSnap.data().existencias || 0;
          const nuevoStock = stockActual + item.cantidad;

          await updateDoc(productoRef, { existencias: nuevoStock });
        }
      }

      // Eliminar subcolecciones (si las usás)
      const productosSnapshot = await getDocs(collection(notaRef, 'productos'));
      for (const productoDoc of productosSnapshot.docs) {
        await deleteDoc(productoDoc.ref);
      }

      const clientesSnapshot = await getDocs(collection(notaRef, 'clientes'));
      for (const clienteDoc of clientesSnapshot.docs) {
        await deleteDoc(clienteDoc.ref);
      }

      // Eliminar la nota
      await deleteDoc(notaRef);

      // Quitar de la lista local
      notas.value = notas.value.filter(nota => nota.id !== idNota);

      console.log(`Nota realizada ${idNota} eliminada correctamente y stock devuelto.`);
    } catch (error) {
      console.error('Error al eliminar la nota realizada:', error);
    }
  }
}

async function imprimirNota(notaId) {
  try {
    // Obtener los datos de la nota desde Firebase
    const notaRef = doc(db, 'nota', 'realizadas', 'notas', notaId);
    const notaSnap = await getDoc(notaRef);

    if (!notaSnap.exists()) {
      console.error('Nota no encontrada');
      return;
    }

    const nota = notaSnap.data();

    // Obtener los productos de la nota
    const productos = nota.productos;

    // Crear el PDF con jsPDF
    const docPDF = new jsPDF();
    docPDF.setFont('courier', 'bold');
    docPDF.setFontSize(10);
    const startX = 20;
    const plusX = startX + 60;
    docPDF.text('NOTA de PEDIDO', 10, 10);
    docPDF.setFont('courier', 'normal');
    docPDF.text(notaId, 160, 10);
    docPDF.text(nota.fecha, 160, 14);
    docPDF.text(`${nota.cliente?.nombre + '(' + nota.cliente?.identificador + ')' || 'CONSUMIDOR FINAL'}`, startX, 18);
    docPDF.text(nota.cliente?.direccion || '', startX, 22);
    docPDF.text(`${nota.cliente?.codigoPostal}-${nota.cliente?.localidad}`, startX, 26);
    docPDF.text(nota.cliente?.provincia || '', plusX, 26);
    docPDF.text(`Cta. Cte. Vto.: ${nota.cliente?.cuentaCorriente}`, startX, 30);
    docPDF.text(`Tel:${nota.cliente?.telefono}` || 'Tel:', plusX, 30);
    docPDF.text('Monotributo', startX, 38);
    docPDF.text(nota.cliente?.cuit || '', plusX, 38);
    // Encabezado de tabla
    const startYTabla = 42;
    //docPDF.text('Código', 10, startYTabla);
    //docPDF.text('Descripción', 30, startYTabla);
    //docPDF.text('Cant.', 105, startYTabla);
    //docPDF.text('Peso', 125, startYTabla);
    //docPDF.text('Precio', 145, startYTabla);
    //docPDF.text('Dto', 170, startYTabla);
    //docPDF.text('Total', 185, startYTabla);

    // Filas de productos
    let y = startYTabla + 6;
    let totalSin = 0;
    let pesoTotal = 0;
    productos.forEach(productos => {
      docPDF.text(productos.codigo || '', 23, y,{ align: 'right' });
      docPDF.text(productos.descripcion || '', 30, y);
      docPDF.text(String(productos.cantidad || ''), 112, y,{ align: 'right' });
      docPDF.text(String(productos.peso.toFixed(2) || ''), 136, y,{ align: 'right' });
      docPDF.text(`${Number(productos.precio).toFixed(2)}`, 160, y,{ align: 'right' });
      docPDF.text(`${productos.descuento.toFixed(2) || '0.00'}`, 177, y,{ align: 'right' });
      let subTotal = (productos.precio * (productos.modo === 1 ? productos.peso : productos.cantidad));
      totalSin = totalSin + subTotal;
      pesoTotal = pesoTotal + productos.peso;
      docPDF.text(`${Number(subTotal).toFixed(2)}`, 201, y,{ align: 'right' });
      y += 4;
    });

    // Total
    y = 130;
    docPDF.text('Total Kg.:',112,y,{ align: 'right' });
    docPDF.text(Number(pesoTotal).toFixed(2),136,y,{ align: 'right' });
    y += 4;
    docPDF.text(`TOTAL Sin Dto.: $${Number(totalSin).toFixed(2)}`,20,y);
    let diferencia = Math.abs(totalSin - nota.total);
    let promedio = (totalSin + nota.total) / 2;
    let porcentaje = (diferencia / promedio) * 100;
    docPDF.text(`${Number(porcentaje).toFixed(2)}%`,80,y);
    docPDF.text('TOTAL:', 136, y,{ align: 'right' });
    docPDF.text(`$${Number(nota.total).toFixed(2)}`, 201, y,{ align: 'right' });

    // Mostrar PDF
    docPDF.save(`nota_${notaId}.pdf`);
  } catch (error) {
    console.error('Error al imprimir nota:', error);
  }
}
</script>
<style>
.container{
  float: center;
  padding-left: 0px;
}

.box {
  display: inline-block;
  width: 30%; 
  padding: 0px; 
}
.box2 {
  display: inline-block;
  width: 70%; 
  padding: 0px; 
  vertical-align: top;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  overflow-y: auto;
  position: relative;
  display: flex;
  width: 75%;
  height: 75%;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
}
</style>