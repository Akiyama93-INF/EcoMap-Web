// Hook que carga y actualiza el perfil del usuario actual desde Firestore

import { useState, useEffect, useCallback } from 'react'
import { getProfile, saveProfile, updateDisplayName } from '../firebase/profileService'
import authService from '../firebase/authService'

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const user = authService.getCurrentUser()

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return }
    try {
      const data = await getProfile(user.uid)
      setProfile(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => { load() }, [load])

  // Actualiza nombre en Firestore + Firebase Auth
  const updateProfile = async (displayName) => {
    if (!user) return
    try {
      await updateDisplayName(user.uid, displayName)
      await authService.updateUserProfile(displayName)
      setProfile((prev) => ({ ...prev, displayName }))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return { profile, loading, error, updateProfile, reload: load }
}

export default useUserProfile