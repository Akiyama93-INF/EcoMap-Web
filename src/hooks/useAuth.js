// Hook personalizado para autenticación
// TODO: Implementar lógica adicional de autenticación

import { useState, useEffect } from 'react'
import authService from '../firebase/authService'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

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
