// Constantes de la aplicación

export const APP_NAME = 'EcoMap'
export const APP_VERSION = '1.0.0'

// Categorías de reportes
export const REPORT_CATEGORIES = {
  CLANDESTINE_DUMP: 'Basurero clandestino',
}

// Límites geográficos de El Salvador
export const EL_SALVADOR_BOUNDS = {
  north: 14.8,
  south: 12.8,
  east: -87.6,
  west: -90.1,
  center: {
    lat: 13.7942,
    lng: -88.8965,
  },
}

// Configuración del mapa
export const MAP_CONFIG = {
  defaultZoom: 9,
  minZoom: 8,
  maxZoom: 18,
}

// Mensajes de error
export const ERROR_MESSAGES = {
  LOCATION_REQUIRED: 'Debes seleccionar una ubicación',
  DESCRIPTION_REQUIRED: 'La descripción es requerida',
  INVALID_EMAIL: 'Email inválido',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres',
  PASSWORDS_NOT_MATCH: 'Las contraseñas no coinciden',
}

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  REPORT_CREATED: 'Reporte creado exitosamente',
  LOGIN_SUCCESS: 'Sesión iniciada correctamente',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  REGISTER_SUCCESS: 'Cuenta creada correctamente',
}

export default {
  APP_NAME,
  APP_VERSION,
  REPORT_CATEGORIES,
  EL_SALVADOR_BOUNDS,
  MAP_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
}
