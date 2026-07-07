// utils/categories.js — Fase 3
// Añadido:
//   - applyPrivacy: true/false por categoría
//   - subtypes: materiales aceptados para Punto ecológico
//   - getCategoryByType()

export const CATEGORIES = {
  CLANDESTINE_DUMP: {
    id: 'basurero_clandestino',
    name: 'Basurero clandestino',
    icon: '🗑️',
    color: '#e74c3c',
    mapColor: '#c0392b',
    reportType: 'citizen',
    description: 'Sitio donde se deposita basura de forma ilegal',
    applyPrivacy: true,
    subtypes: [],
  },
  ECOLOGICAL_POINT: {
    id: 'punto_ecologico',
    name: 'Punto ecológico',
    icon: '♻️',
    color: '#2ecc71',
    mapColor: '#27ae60',
    reportType: 'ecological',
    description: 'Punto de recolección autorizado de residuos reciclables',
    applyPrivacy: false,
    subtypes: [
      { id: 'plastico',  label: 'Plástico',      icon: '🧴' },
      { id: 'vidrio',    label: 'Vidrio',         icon: '🫙' },
      { id: 'papel',     label: 'Papel / Cartón', icon: '📦' },
      { id: 'metal',     label: 'Metal',          icon: '🔩' },
      { id: 'electronico', label: 'Electrónicos', icon: '💻' },
      { id: 'organico',  label: 'Orgánicos',      icon: '🌿' },
    ],
  },
  ENVIRONMENTAL_INCIDENT: {
    id: 'incidente_ambiental',
    name: 'Incidente ambiental',
    icon: '⚠️',
    color: '#f39c12',
    mapColor: '#d68910',
    reportType: 'incident',
    description: 'Derrame, quema ilegal u otro incidente ambiental',
    applyPrivacy: true,
    subtypes: [],
  },
}

export const CATEGORIES_ARRAY = Object.values(CATEGORIES)

export const getCategoryById = (id) =>
  CATEGORIES_ARRAY.find((c) => c.id === id)

export const getCategoryByName = (name) =>
  CATEGORIES_ARRAY.find((c) => c.name === name)

export const getCategoryByType = (type) =>
  CATEGORIES_ARRAY.find((c) => c.reportType === type)

export default CATEGORIES
