// utils/privacy.js — Fase 3
// Coordenadas aproximadas para proteger la privacidad de los reportantes.
//
// Principio:
//   - Basureros e incidentes desplazan ~400 m para no revelar la dirección exacta
//   - Puntos ecológicos NO se desplazan: son sitios públicos que deben ser localizables
//   - El desplazamiento usa un hash del reportId como semilla → siempre es el mismo
//     para el mismo reporte (no cambia en cada render)

import CATEGORIES from './categories'

// Radio de desplazamiento en grados decimales por reportType
// 0.0035° ≈ 390 m en latitud ~13° (El Salvador)
const OFFSET_DEGREES = {
  citizen:    0.0035,   // Basurero clandestino
  incident:   0.0028,   // Incidente ambiental
  ecological: 0,        // Sin desplazamiento
}

// Radio del círculo visual en metros (dibujado en el mapa)
export const PRIVACY_CIRCLE_RADIUS_M = {
  citizen:    400,
  incident:   300,
  ecological: 0,
}

/**
 * Hash djb2 para generar un offset determinístico a partir del reportId.
 * Devuelve { dx, dy } en [-1, 1].
 */
function seededOffset(seed = '') {
  let h = 5381
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h, 31) ^ seed.charCodeAt(i)
  }
  const dx = (((h & 0xffff) / 0xffff) - 0.5) * 2        // [-1, 1]
  const dy = ((((h >>> 16) & 0xffff) / 0xffff) - 0.5) * 2 // [-1, 1]
  return { dx, dy }
}

/**
 * Devuelve el reportType de un reporte dados su categoría o reportType almacenado.
 * Primero usa el campo reportType guardado en Firestore;
 * si no existe, lo infiere desde categories.js.
 */
function resolveReportType(report) {
  if (report.reportType) return report.reportType
  const catEntry = Object.values(CATEGORIES).find(
    (c) => c.name === report.category || c.id === report.categoryId
  )
  return catEntry?.reportType ?? 'citizen'
}

/**
 * Calcula las coordenadas a mostrar en el mapa (posiblemente desplazadas).
 * @param {object} report  Documento de Firestore con al menos { id, lat, lng, category }
 * @returns {{ lat: number, lng: number }}
 */
export function approximateLocation(report) {
  const rType = resolveReportType(report)
  const radius = OFFSET_DEGREES[rType] ?? OFFSET_DEGREES.citizen

  if (radius === 0) return { lat: report.lat, lng: report.lng }

  const seed = report.id ?? `${report.lat}${report.lng}`
  const { dx, dy } = seededOffset(seed)

  return {
    lat: report.lat + dy * radius,
    lng: report.lng + dx * radius,
  }
}

/**
 * Devuelve el radio (metros) del círculo de privacidad para el mapa.
 * 0 = no dibujar círculo.
 * @param {object} report
 * @returns {number}
 */
export function getPrivacyRadius(report) {
  const rType = resolveReportType(report)
  return PRIVACY_CIRCLE_RADIUS_M[rType] ?? 400
}

/**
 * ¿Debe aplicarse privacidad a este reporte?
 */
export function needsPrivacy(report) {
  const rType = resolveReportType(report)
  return (OFFSET_DEGREES[rType] ?? 0) > 0
}

export default { approximateLocation, getPrivacyRadius, needsPrivacy }
