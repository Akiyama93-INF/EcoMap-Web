// Página /perfil — editar nombre, ver email y total de reportes

import React, { useState, useEffect } from 'react'
import useAuth        from '../hooks/useAuth'
import useUserProfile from '../hooks/useUserProfile'
import UserAvatar     from '../components/UserAvatar'
import firestoreService from '../firebase/firestoreService'
import '../styles/pages/Profile.css'

function Profile() {
  const { user }                              = useAuth()
  const { profile, loading, updateProfile }  = useUserProfile()

  const [displayName,  setDisplayName]  = useState('')
  const [saving,       setSaving]       = useState(false)
  const [success,      setSuccess]      = useState(false)
  const [error,        setError]        = useState(null)
  const [reportCount,  setReportCount]  = useState(null)

  // Precarga el nombre cuando el perfil llega
  useEffect(() => {
    if (profile?.displayName) setDisplayName(profile.displayName)
  }, [profile])

  // Total de reportes del usuario
  useEffect(() => {
    if (!user) return
    firestoreService.getReports().then((all) => {
      setReportCount(all.filter((r) => r.userId === user.uid).length)
    })
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (displayName.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }
    setSaving(true)
    try {
      await updateProfile(displayName.trim())
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="profile-loading">Cargando perfil...</p>

  const name = displayName || user?.email?.split('@')[0] || ''

  return (
    <div className="profile-container">
      <div className="profile-card">

        <div className="profile-avatar-row">
          <UserAvatar name={name} size={72} />
          <h1 className="profile-title">{name}</h1>
        </div>

        {/* Estadística */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="stat-value">{reportCount ?? '—'}</span>
            <span className="stat-label">Reportes enviados</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="displayName">Nombre</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={user?.email ?? ''}
              disabled
              className="input-disabled"
            />
          </div>

          {error   && <p className="profile-error">{error}</p>}
          {success && <p className="profile-success">¡Perfil actualizado!</p>}

          <button type="submit" disabled={saving} className="submit-btn">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile