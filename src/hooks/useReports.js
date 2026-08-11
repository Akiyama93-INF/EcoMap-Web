// Hook para obtener reportes según el contexto de EcoMap
//
// scope:
//   - "nacional" → reportes nacionales
//   - "insa"     → reportes del INSA
//
// Fix perf: query filtrada por scope directamente en Firestore
// en lugar de traer todo y filtrar en cliente.
// Compatibilidad: reportes sin campo scope se tratan como nacionales
// mediante el listener heredado.

import { useState, useEffect } from 'react'
import firestoreService from '../firebase/firestoreService'

export const useReports = (scope = 'nacional') => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // Estado de conexión
  useEffect(() => {
    const goOnline  = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)

    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Escuchar reportes filtrados por scope en Firestore
  useEffect(() => {
    setLoading(true)

    const unsubscribe = firestoreService.subscribeToReportsByScope(
      scope,
      (data) => {
        setReports(data)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Error obteniendo reportes:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [scope])

  // Se mantiene por compatibilidad
  const refresh = () => {}

  return {
    reports,
    loading,
    error,
    isOffline,
    refresh,
  }
}

export default useReports