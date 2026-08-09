// Hook para obtener reportes según el contexto de EcoMap
//
// scope:
//   - "nacional" → reportes nacionales
//   - "insa"     → reportes del INSA
//
// Los reportes antiguos que no tengan scope se consideran nacionales.

import { useState, useEffect } from 'react'
import firestoreService from '../firebase/firestoreService'

export const useReports = (scope = 'nacional') => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // Estado de conexión
  useEffect(() => {
    const goOnline = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Escuchar reportes
  useEffect(() => {
    setLoading(true)

    const unsubscribe = firestoreService.subscribeToReports(
      (data) => {

        const filteredReports = data.filter((report) => {

          // Compatibilidad:
          // reportes antiguos sin "scope" pertenecen a Nacional.
          const reportScope = report.scope ?? 'nacional'

          return reportScope === scope
        })

        setReports(filteredReports)
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