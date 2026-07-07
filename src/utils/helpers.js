// Funciones auxiliares

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida que una ubicación esté dentro de El Salvador
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} - True si está dentro de los límites
 */
export const isLocationInElSalvador = (lat, lng) => {
  const bounds = {
    north: 14.8,
    south: 12.8,
    east: -87.6,
    west: -90.1,
  }
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east
}

/**
 * Formatea una fecha en formato legible
 * @param {Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Calcula la distancia entre dos coordenadas en km
 * @param {number} lat1 - Latitud 1
 * @param {number} lng1 - Longitud 1
 * @param {number} lat2 - Latitud 2
 * @param {number} lng2 - Longitud 2
 * @returns {number} - Distancia en km
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Trunca texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} length - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, length = 50) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

/**
 * Valida un archivo de imagen
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato de imagen no válido. Usa JPG, PNG, GIF o WebP',
    }
  }

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `El archivo excede el tamaño máximo de ${maxSizeMB}MB`,
    }
  }

  return { isValid: true, error: null }
}

export default {
  isValidEmail,
  isLocationInElSalvador,
  formatDate,
  calculateDistance,
  truncateText,
  validateImageFile,
}
