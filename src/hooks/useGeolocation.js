// Hook para geolocalización del usuario
// Solicita permisos, retorna posición y maneja errores

import { useState, useCallback } from 'react'

export const useGeolocation = () => {
  const [position, setPosition] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        setLoading(false)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permiso de ubicación denegado. Permite el acceso en la configuración del navegador.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('No se pudo obtener tu ubicación. Intenta de nuevo.')
            break
          case err.TIMEOUT:
            setError('La solicitud de ubicación tardó demasiado. Intenta de nuevo.')
            break
          default:
            setError('Error desconocido al obtener ubicación.')
        }
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    )
  }, [])

  const clearPosition = useCallback(() => {
    setPosition(null)
    setError(null)
  }, [])

  return { position, loading, error, getCurrentPosition, clearPosition }
}

export default useGeolocation
