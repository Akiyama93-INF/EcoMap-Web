// Hook para obtener y refrescar reportes desde Firestore
// Refactorizado en Fase 1: lógica de carga extraída a función reutilizable

import { useState, useEffect, useCallback } from 'react'
import firestoreService from '../firebase/firestoreService'

export const useReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await firestoreService.getReports()
      setReports(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  return { reports, loading, error, refresh: loadReports }
}

export default useReports
