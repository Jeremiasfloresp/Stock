export const DIAS_AVISO = 30

export const hoyISO = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const diasHasta = (fechaISO) => {
  const a = new Date(`${hoyISO()}T00:00:00`)
  const b = new Date(`${fechaISO}T00:00:00`)
  return Math.round((b - a) / 86400000)
}

export const estadoDosis = (proximaDosis) => {
  if (!proximaDosis) return null
  const dias = diasHasta(proximaDosis)
  if (dias < 0) return { clave: 'vencida', texto: `Vencida hace ${-dias} día(s)`, dias }
  if (dias <= DIAS_AVISO) return { clave: 'proxima', texto: dias === 0 ? 'Vence hoy' : `Vence en ${dias} día(s)`, dias }
  return { clave: 'aldia', texto: 'Al día', dias }
}

// Solo cuenta la dosis más reciente de cada vacuna/desparasitación por mascota.
export const ultimasDosis = (dosis) => {
  const mapa = new Map()
  for (const d of dosis) {
    const k = `${d.mascotaId || ''}|${d.tipo}|${(d.nombre || '').trim().toLowerCase()}`
    const actual = mapa.get(k)
    if (!actual || (d.fecha || '') > (actual.fecha || '')) mapa.set(k, d)
  }
  return [...mapa.values()]
}

export const formatearFecha = (iso) => {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
