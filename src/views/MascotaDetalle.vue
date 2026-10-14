<template>
  <div class="p-4">
    <br />
    <router-link :to="`/clientes/${clienteId}`">&larr; Volver al cliente</router-link>

    <div v-if="mascota">
      <h2 class="text-2xl font-bold mb-1">{{ mascota.nombre }}</h2>
      <p>
        {{ mascota.especie }} {{ mascota.raza ? '- ' + mascota.raza : '' }} | {{ mascota.sexo }}
        <span v-if="mascota.castrado">(castrado/a)</span> |
        Nac.: {{ formatearFecha(mascota.fechaNacimiento) }} |
        Dueño: <strong>{{ cliente?.nombre }}</strong> ({{ cliente?.telefono }})
      </p>
      <p v-if="mascota.notas"><em>{{ mascota.notas }}</em></p>

      <div v-if="alertas.length" class="alerta">
        <strong>Atención:</strong>
        <div v-for="a in alertas" :key="a.id">
          {{ a.tipo === 'desparasitacion' ? 'Desparasitación' : 'Vacuna' }} {{ a.nombre }}:
          {{ estadoDosis(a.proximaDosis).texto }} ({{ formatearFecha(a.proximaDosis) }})
        </div>
      </div>

      <div class="tabs">
        <button v-for="t in tabs" :key="t.clave" @click="tab = t.clave"
          :class="['tab', { activa: tab === t.clave }]">
          {{ t.titulo }} ({{ items[t.clave].length }})
        </button>
      </div>

      <button @click="abrirForm()" class="bg-blue-500 text-white px-4 py-2 mb-3 rounded">
        {{ tabActual.agregar }}
      </button>

      <!-- Historial clínico -->
      <table v-if="tab === 'visitas'" border="1">
        <thead><tr>
          <th class="border px-4 py-2">Fecha</th><th class="border px-4 py-2">Motivo</th>
          <th class="border px-4 py-2">Diagnóstico</th><th class="border px-4 py-2">Peso (kg)</th>
          <th class="border px-4 py-2">Notas</th><th class="border px-4 py-2"></th>
        </tr></thead>
        <tbody>
          <tr v-for="i in lista" :key="i.id">
            <td class="border px-4 py-0">{{ formatearFecha(i.fecha) }}</td>
            <td class="border px-4 py-0">{{ i.motivo }}</td>
            <td class="border px-4 py-0">{{ i.diagnostico }}</td>
            <td class="border px-4 py-0">{{ i.peso }}</td>
            <td class="border px-4 py-0">{{ i.notas }}</td>
            <td class="border px-4 py-0">
              <button @click="abrirForm(i)" class="bg-blue-500 text-white px-2 py-1 rounded">Editar</button>
              <button @click="eliminar(i)" class="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Tratamientos -->
      <div v-if="tab === 'tratamientos'">
        <label class="mr-2">Mostrar:</label>
        <select v-model="filtroTratamiento" class="border p-1 mb-2">
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="terminado">Terminados</option>
        </select>
        <table border="1">
          <thead><tr>
            <th class="border px-4 py-2">Tratamiento</th><th class="border px-4 py-2">Indicaciones</th>
            <th class="border px-4 py-2">Inicio</th><th class="border px-4 py-2">Fin</th>
            <th class="border px-4 py-2">Estado</th><th class="border px-4 py-2"></th>
          </tr></thead>
          <tbody>
            <tr v-for="i in lista" :key="i.id">
              <td class="border px-4 py-0">{{ i.nombre }}</td>
              <td class="border px-4 py-0">{{ i.indicaciones }}</td>
              <td class="border px-4 py-0">{{ formatearFecha(i.fechaInicio) }}</td>
              <td class="border px-4 py-0">{{ formatearFecha(i.fechaFin) }}</td>
              <td class="border px-4 py-0">
                <span :class="i.estado === 'activo' ? 'etiqueta-activa' : 'etiqueta-terminada'">{{ i.estado }}</span>
              </td>
              <td class="border px-4 py-0">
                <button v-if="i.estado === 'activo'" @click="terminarTratamiento(i)" class="bg-yellow-500 text-white px-2 py-1 rounded">Marcar terminado</button>
                <button @click="abrirForm(i)" class="bg-blue-500 text-white px-2 py-1 rounded">Editar</button>
                <button @click="eliminar(i)" class="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Plan de vacunación -->
      <div v-if="tab === 'vacunas'">
        <h4 class="font-bold">Estado actual</h4>
        <table v-if="resumenVacunas.length" border="1" class="mb-4">
          <thead><tr>
            <th class="border px-4 py-2">Tipo</th><th class="border px-4 py-2">Nombre</th>
            <th class="border px-4 py-2">Última aplicación</th><th class="border px-4 py-2">Próxima dosis</th>
            <th class="border px-4 py-2">Estado</th>
          </tr></thead>
          <tbody>
            <tr v-for="d in resumenVacunas" :key="d.id">
              <td class="border px-4 py-0">{{ etiquetaTipo(d.tipo) }}</td>
              <td class="border px-4 py-0">{{ d.nombre }}</td>
              <td class="border px-4 py-0">{{ formatearFecha(d.fecha) }}</td>
              <td class="border px-4 py-0">{{ formatearFecha(d.proximaDosis) }}</td>
              <td class="border px-4 py-0">
                <span v-if="estadoDosis(d.proximaDosis)" :class="'estado-' + estadoDosis(d.proximaDosis).clave">
                  {{ estadoDosis(d.proximaDosis).texto }}
                </span>
                <span v-else>Sin refuerzo</span>
              </td>
            </tr>
          </tbody>
        </table>
        <h4 class="font-bold">Historial de aplicaciones</h4>
        <table border="1">
          <thead><tr>
            <th class="border px-4 py-2">Fecha</th><th class="border px-4 py-2">Tipo</th>
            <th class="border px-4 py-2">Nombre</th><th class="border px-4 py-2">Lote</th>
            <th class="border px-4 py-2">Próxima dosis</th><th class="border px-4 py-2"></th>
          </tr></thead>
          <tbody>
            <tr v-for="i in lista" :key="i.id">
              <td class="border px-4 py-0">{{ formatearFecha(i.fecha) }}</td>
              <td class="border px-4 py-0">{{ etiquetaTipo(i.tipo) }}</td>
              <td class="border px-4 py-0">{{ i.nombre }}</td>
              <td class="border px-4 py-0">{{ i.lote }}</td>
              <td class="border px-4 py-0">{{ formatearFecha(i.proximaDosis) }}</td>
              <td class="border px-4 py-0">
                <button @click="abrirForm(i)" class="bg-blue-500 text-white px-2 py-1 rounded">Editar</button>
                <button @click="eliminar(i)" class="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Placas -->
      <div v-if="tab === 'placas'" class="placas">
        <p v-if="!lista.length">Todavía no hay placas cargadas.</p>
        <div v-for="i in lista" :key="i.id" class="placa">
          <a :href="i.url" target="_blank" rel="noopener">
            <img v-if="i.contentType?.startsWith('image/')" :src="i.url" :alt="i.descripcion" />
            <div v-else class="placa-archivo">{{ i.nombreArchivo }}</div>
          </a>
          <div><strong>{{ formatearFecha(i.fecha) }}</strong> - {{ i.zona }}</div>
          <div>{{ i.descripcion }}</div>
          <button @click="eliminar(i)" class="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
        </div>
      </div>
    </div>
    <p v-else-if="cargado">Mascota no encontrada.</p>

    <teleport to="body">
      <div v-if="form" class="vue-modal-overlay">
        <div class="vue-modal-content modal-scroll">
          <button @click="form = null" class="modal-close">&times;</button>
          <h3 class="text-xl font-bold mb-4">{{ form.id ? 'Editar' : 'Nuevo' }} - {{ tabActual.titulo }}</h3>
          <form @submit.prevent="guardar">
            <div v-for="c in tabActual.campos" :key="c.clave">
              <label>{{ c.etiqueta }}</label>
              <select v-if="c.tipo === 'select'" v-model="form[c.clave]" class="modal-input" :required="c.requerido">
                <option v-for="o in c.opciones" :key="o.valor" :value="o.valor">{{ o.texto }}</option>
              </select>
              <textarea v-else-if="c.tipo === 'textarea'" v-model="form[c.clave]" class="modal-input"></textarea>
              <input v-else-if="c.tipo === 'file'" type="file" accept="image/*,application/pdf"
                class="modal-input" :required="!form.id" @change="archivo = $event.target.files[0]" />
              <input v-else v-model="form[c.clave]" :type="c.tipo" :step="c.tipo === 'number' ? '0.01' : null"
                class="modal-input" :required="c.requerido" />
            </div>
            <div class="flex justify-end mt-4">
              <button type="submit" :disabled="guardando" class="bg-green-500 text-white px-4 py-2 rounded">
                {{ guardando ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { db, storage } from '../firebase'
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { hoyISO, estadoDosis, ultimasDosis, formatearFecha } from '../utils/vacunas'

const props = defineProps({ clienteId: String, mascotaId: String })

const tiposDosis = [
  { valor: 'vacuna', texto: 'Vacuna' },
  { valor: 'desparasitacion', texto: 'Desparasitación' }
]
const etiquetaTipo = (v) => tiposDosis.find(t => t.valor === v)?.texto || v

const tabs = [
  {
    clave: 'visitas', titulo: 'Historial clínico', agregar: 'Registrar visita', orden: 'fecha',
    campos: [
      { clave: 'fecha', etiqueta: 'Fecha', tipo: 'date', requerido: true },
      { clave: 'motivo', etiqueta: 'Motivo de consulta', tipo: 'text', requerido: true },
      { clave: 'diagnostico', etiqueta: 'Diagnóstico', tipo: 'textarea' },
      { clave: 'peso', etiqueta: 'Peso (kg)', tipo: 'number' },
      { clave: 'notas', etiqueta: 'Notas', tipo: 'textarea' }
    ],
    nuevo: () => ({ fecha: hoyISO(), motivo: '', diagnostico: '', peso: '', notas: '' })
  },
  {
    clave: 'tratamientos', titulo: 'Tratamientos', agregar: 'Nuevo tratamiento', orden: 'fechaInicio',
    campos: [
      { clave: 'nombre', etiqueta: 'Tratamiento / medicación', tipo: 'text', requerido: true },
      { clave: 'indicaciones', etiqueta: 'Dosis e indicaciones', tipo: 'textarea' },
      { clave: 'fechaInicio', etiqueta: 'Fecha de inicio', tipo: 'date', requerido: true },
      { clave: 'fechaFin', etiqueta: 'Fecha de fin (estimada o real)', tipo: 'date' },
      { clave: 'estado', etiqueta: 'Estado', tipo: 'select', requerido: true,
        opciones: [{ valor: 'activo', texto: 'Activo' }, { valor: 'terminado', texto: 'Terminado' }] }
    ],
    nuevo: () => ({ nombre: '', indicaciones: '', fechaInicio: hoyISO(), fechaFin: '', estado: 'activo' })
  },
  {
    clave: 'vacunas', titulo: 'Vacunación / Desparasitación', agregar: 'Registrar aplicación', orden: 'fecha',
    campos: [
      { clave: 'tipo', etiqueta: 'Tipo', tipo: 'select', requerido: true, opciones: tiposDosis },
      { clave: 'nombre', etiqueta: 'Nombre (ej. Sextuple, Antirrábica, Pipeta)', tipo: 'text', requerido: true },
      { clave: 'fecha', etiqueta: 'Fecha de aplicación', tipo: 'date', requerido: true },
      { clave: 'lote', etiqueta: 'Lote (opcional)', tipo: 'text' },
      { clave: 'proximaDosis', etiqueta: 'Fecha de próxima dosis / refuerzo', tipo: 'date' }
    ],
    nuevo: () => ({ tipo: 'vacuna', nombre: '', fecha: hoyISO(), lote: '', proximaDosis: '' })
  },
  {
    clave: 'placas', titulo: 'Placas radiográficas', agregar: 'Subir placa', orden: 'fecha',
    campos: [
      { clave: 'fecha', etiqueta: 'Fecha', tipo: 'date', requerido: true },
      { clave: 'zona', etiqueta: 'Zona (tórax, cadera, etc.)', tipo: 'text' },
      { clave: 'descripcion', etiqueta: 'Descripción / informe', tipo: 'textarea' },
      { clave: 'archivo', etiqueta: 'Imagen o PDF', tipo: 'file' }
    ],
    nuevo: () => ({ fecha: hoyISO(), zona: '', descripcion: '' })
  }
]

const cliente = ref(null)
const mascota = ref(null)
const cargado = ref(false)
const tab = ref('visitas')
const items = reactive({ visitas: [], tratamientos: [], vacunas: [], placas: [] })
const filtroTratamiento = ref('todos')
const form = ref(null)
const archivo = ref(null)
const guardando = ref(false)

const tabActual = computed(() => tabs.find(t => t.clave === tab.value))

const lista = computed(() => {
  let l = items[tab.value]
  if (tab.value === 'tratamientos' && filtroTratamiento.value !== 'todos') {
    l = l.filter(t => t.estado === filtroTratamiento.value)
  }
  return l
})

const resumenVacunas = computed(() => ultimasDosis(items.vacunas))
const alertas = computed(() =>
  resumenVacunas.value.filter(d => ['vencida', 'proxima'].includes(estadoDosis(d.proximaDosis)?.clave))
)

const ruta = (sub) => ['clientes', props.clienteId, 'mascotas', props.mascotaId, sub]

const cargarSub = async (sub) => {
  const t = tabs.find(x => x.clave === sub)
  const snap = await getDocs(collection(db, ...ruta(sub)))
  items[sub] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b[t.orden] || '').localeCompare(a[t.orden] || ''))
}

const cargar = async () => {
  const [c, m] = await Promise.all([
    getDoc(doc(db, 'clientes', props.clienteId)),
    getDoc(doc(db, 'clientes', props.clienteId, 'mascotas', props.mascotaId))
  ])
  cliente.value = c.exists() ? { id: c.id, ...c.data() } : null
  mascota.value = m.exists() ? { id: m.id, ...m.data() } : null
  cargado.value = true
  if (mascota.value) await Promise.all(tabs.map(t => cargarSub(t.clave)))
}

const abrirForm = (item) => {
  archivo.value = null
  form.value = item ? { ...item } : tabActual.value.nuevo()
}

watch(tab, () => { form.value = null })

const guardar = async () => {
  guardando.value = true
  try {
    const sub = tab.value
    const { id, ...data } = form.value

    if (sub === 'vacunas') {
      Object.assign(data, {
        clienteId: props.clienteId,
        mascotaId: props.mascotaId,
        mascotaNombre: mascota.value.nombre
      })
    }
    if (sub === 'placas' && archivo.value) {
      const path = `placas/${props.clienteId}/${props.mascotaId}/${Date.now()}_${archivo.value.name}`
      const sRef = storageRef(storage, path)
      await uploadBytes(sRef, archivo.value)
      if (data.path) await deleteObject(storageRef(storage, data.path)).catch(() => {})
      Object.assign(data, {
        path,
        url: await getDownloadURL(sRef),
        contentType: archivo.value.type,
        nombreArchivo: archivo.value.name
      })
    }

    if (id) await updateDoc(doc(db, ...ruta(sub), id), data)
    else await addDoc(collection(db, ...ruta(sub)), data)

    form.value = null
    await cargarSub(sub)
  } catch (e) {
    console.error(e)
    alert('No se pudo guardar: ' + e.message)
  } finally {
    guardando.value = false
  }
}

const terminarTratamiento = async (t) => {
  await updateDoc(doc(db, ...ruta('tratamientos'), t.id), { estado: 'terminado', fechaFin: t.fechaFin || hoyISO() })
  cargarSub('tratamientos')
}

const eliminar = async (item) => {
  if (!confirm('¿Eliminar este registro?')) return
  const sub = tab.value
  if (sub === 'placas' && item.path) await deleteObject(storageRef(storage, item.path)).catch(() => {})
  await deleteDoc(doc(db, ...ruta(sub), item.id))
  cargarSub(sub)
}

onMounted(cargar)
</script>

<style>
.tabs { display: flex; gap: 0.5rem; margin: 1rem 0; flex-wrap: wrap; }
.tab { padding: 0.4rem 0.9rem; border: 1px solid #ccc; border-radius: 0.25rem; background: #eee; cursor: pointer; }
.tab.activa { background: #3b82f6; color: white; border-color: #3b82f6; }
.alerta { background: #fff4e5; border: 1px solid #f59e0b; padding: 0.5rem 1rem; border-radius: 0.25rem; margin: 0.75rem 0; }
.estado-vencida { color: #b91c1c; font-weight: bold; }
.estado-proxima { color: #b45309; font-weight: bold; }
.estado-aldia { color: #15803d; }
.etiqueta-activa { color: #15803d; font-weight: bold; }
.etiqueta-terminada { color: #666; }
.placas { display: flex; flex-wrap: wrap; gap: 1rem; }
.placa { width: 220px; background: white; padding: 0.5rem; border: 1px solid #ddd; border-radius: 0.25rem; }
.placa img { width: 100%; height: 160px; object-fit: cover; background: #000; }
.placa-archivo { height: 160px; display: flex; align-items: center; justify-content: center; background: #eee; word-break: break-all; padding: 0.5rem; }
.modal-scroll { max-height: 90vh; overflow-y: auto; }
</style>
