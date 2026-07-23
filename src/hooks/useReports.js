// Hook para obtener y refrescar reportes desde Firestore
// Actualizado:
//   - Migrado de getDocs a onSnapshot (subscribeToReports)
//   - Sincronización automática online/offline sin refresh manual
//   - Indicador isOffline basado en navigator.onLine

import { useState, useEffect } from 'react'
import firestoreService from '../firebase/firestoreService'

export const useReports = () => {
  const [reports,   setReports]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // ← Escuchar estado de conexión del navegador
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

  // ← Listener en tiempo real — se cancela al desmontar
  useEffect(() => {
    setLoading(true)
    const unsubscribe = firestoreService.subscribeToReports(
      (data) => {
        setReports(data)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  // refresh sigue existiendo para compatibilidad con el resto del código
  // pero con onSnapshot ya no es necesario llamarlo manualmente
  const refresh = () => {}

  return { reports, loading, error, isOffline, refresh }
}

export default useReports