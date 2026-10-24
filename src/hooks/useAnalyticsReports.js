import { useEffect, useState, useCallback } from 'react'
import firestoreService from '../firebase/firestoreService'

export default function useAnalyticsReports() {
  const [state, setState] = useState({ reports: [], loading: true, error: null })
  const [attempt, setAttempt] = useState(0)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const retry = useCallback(() => setAttempt((value) => value + 1), [])
  useEffect(() => {
    let active = true
    setState((previous) => ({ ...previous, loading: true, error: null }))
    const unsubscribe = firestoreService.subscribeToReports(
      (reports) => { if (active) setState({ reports, loading: false, error: null }) },
      () => { if (active) setState((previous) => ({ ...previous, loading: false, error: 'No pudimos actualizar las estadísticas.' })) },
    )
    return () => { active = false; unsubscribe() }
  }, [attempt])
  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) }
  }, [])
  return { ...state, isOffline, retry }
}
