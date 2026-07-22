// utils/categories.js — Fase 3
// Añadido:
//   - applyPrivacy: true/false por categoría
//   - subtypes: materiales aceptados para Punto ecológico
//   - getCategoryByType()
// Actualizado:
//   - CONTAMINATED_RIVER: nueva categoría para ríos contaminados

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
      { id: 'plastico',    label: 'Plástico',      icon: '🧴' },
      { id: 'vidrio',      label: 'Vidrio',         icon: '🫙' },
      { id: 'papel',       label: 'Papel / Cartón', icon: '📦' },
      { id: 'metal',       label: 'Metal',          icon: '🔩' },
      { id: 'electronico', label: 'Electrónicos',   icon: '💻' },
      { id: 'organico',    label: 'Orgánicos',      icon: '🌿' },
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
  CONTAMINATED_RIVER: {
    id: 'rio_contaminado',
    name: 'Río contaminado',
    icon: '🏞️',
    color: '#8e44ad',
    mapColor: '#7d3c98',
    reportType: 'river',
    description: 'Río o cuerpo de agua con contaminación visible',
    applyPrivacy: true,
    subtypes: [
      { id: 'basura',  label: 'Basura / desechos', icon: '🗑️' },
      { id: 'quimico', label: 'Químicos / espuma',  icon: '⚗️' },
      { id: 'aguas',   label: 'Aguas negras',       icon: '🚫' },
      { id: 'color',   label: 'Color anormal',      icon: '🎨' },
    ],
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