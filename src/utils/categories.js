// utils/categories.js — Fase 4 + Infraestructura urbana
// Añadido:
//   - DAMAGED_POLE:      Poste de luz dañado
//   - PUBLIC_TAP:        Chorro público dañado
//   - DAMAGED_PIPELINE:  Tubería dañada
//   - ROAD_OBSTRUCTION:  Obstrucción vial

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
  DAMAGED_POLE: {
    id: 'poste_luz',
    name: 'Poste de luz dañado',
    icon: '💡',
    color: '#F59E0B',
    mapColor: '#D97706',
    reportType: 'infrastructure',
    description: 'Poste de alumbrado público que no funciona o representa un peligro',
    applyPrivacy: false,
    subtypes: [
      { id: 'lampara_apagada',  label: 'Lámpara apagada',        icon: '🔦' },
      { id: 'parpadeo',         label: 'Parpadeo intermitente',   icon: '⚡' },
      { id: 'poste_caido',      label: 'Poste caído / inclinado', icon: '🚧' },
      { id: 'cables_expuestos', label: 'Cables expuestos',        icon: '⛔' },
      { id: 'sin_lampara',      label: 'Sin lámpara (vandalismo)',icon: '🪝' },
      { id: 'otro',             label: 'Otro',                    icon: '❓' },
    ],
  },
  PUBLIC_TAP: {
    id: 'chorro_publico',
    name: 'Chorro público dañado',
    icon: '🚰',
    color: '#3B82F6',
    mapColor: '#2563EB',
    reportType: 'water',
    description: 'Chorro o fuente de agua pública que no funciona o presenta daños',
    applyPrivacy: false,
    subtypes: [
      { id: 'fuga_constante', label: 'Fuga constante',            icon: '💧' },
      { id: 'bloqueado',      label: 'Bloqueado / sin acceso',    icon: '🔒' },
      { id: 'grifo_roto',     label: 'Grifo roto o vandalizado',  icon: '🪛' },
      { id: 'sin_presion',    label: 'Sin presión de agua',       icon: '🚫' },
      { id: 'otro',           label: 'Otro',                      icon: '❓' },
    ],
  },
  DAMAGED_PIPELINE: {
    id: 'tuberia_danada',
    name: 'Tubería dañada',
    icon: '🔧',
    color: '#06B6D4',
    mapColor: '#0891B2',
    reportType: 'pipeline',
    description: 'Tubería rota, con fuga o que causa daños en la vía pública',
    applyPrivacy: false,
    subtypes: [
      { id: 'fuga_subterranea', label: 'Fuga subterránea',          icon: '💦' },
      { id: 'rotura_derrame',   label: 'Rotura con derrame visible', icon: '🌊' },
      { id: 'tuberia_expuesta', label: 'Tubería expuesta',           icon: '🏗️' },
      { id: 'hundimiento',      label: 'Hundimiento de calle',       icon: '⚠️' },
      { id: 'otro',             label: 'Otro',                       icon: '❓' },
    ],
  },
  ROAD_OBSTRUCTION: {
    id: 'obstruccion_vial',
    name: 'Obstrucción vial',
    icon: '🚧',
    color: '#EF4444',
    mapColor: '#DC2626',
    reportType: 'road',
    description: 'Objeto, material o situación que obstruye la vía pública',
    applyPrivacy: false,
    subtypes: [
      { id: 'llanta',       label: 'Llanta(s) abandonadas',   icon: '🛞' },
      { id: 'escombros',    label: 'Escombros / piedras',     icon: '🪨' },
      { id: 'arbol_caido',  label: 'Árbol caído',             icon: '🌳' },
      { id: 'vehiculo',     label: 'Vehículo abandonado',     icon: '🚗' },
      { id: 'construccion', label: 'Material de construcción',icon: '🏗️' },
      { id: 'bache',        label: 'Hoyo / bache grave',      icon: '🕳️' },
      { id: 'otro',         label: 'Otro',                    icon: '❓' },
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