// Hook personalizado para autenticación

import { useState, useEffect } from 'react'
import authService from '../firebase/authService'
import { getProfile } from '../firebase/profileService'

export const useAuth = () => {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (currentUser) => {
      if (!currentUser) {
        setUser(null)
        setLoading(false)
        return
      }

      // Si ya tiene displayName en Firebase Auth, úsalo directamente
      if (currentUser.displayName) {
        setUser(currentUser)
        setLoading(false)
        return
      }

      // Solo si NO tiene displayName, busca en Firestore
      try {
        const profile = await getProfile(currentUser.uid)
        // Guarda el user + el nombre resuelto como objeto plano separado
        setUser({
          ...currentUser,
          displayName: profile?.displayName ?? null,
        })
      } catch {
        setUser(currentUser)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, []) // ← sin dependencias, solo corre una vez

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return { user, loading, error, logout }
}

export default useAuth