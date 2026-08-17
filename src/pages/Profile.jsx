// Página /perfil — editar nombre, foto de perfil y ver total de reportes
// Foto: se sube a Cloudinary, la URL se guarda en Firestore (users/{uid}.photoURL)
//       y en Firebase Auth (updateProfile).

import React, { useState, useEffect, useRef } from 'react'
import useAuth          from '../hooks/useAuth'
import useUserProfile   from '../hooks/useUserProfile'
import UserAvatar       from '../components/UserAvatar'
import cloudinaryService from '../firebase/cloudinaryService'
import firestoreService  from '../firebase/firestoreService'
import authService       from '../firebase/authService'
import { saveProfile }   from '../firebase/profileService'
import { getCategoryByName } from '../utils/categories'
import '../styles/pages/Profile.css'

const MAX_PHOTO_MB = 5
const ACCEPTED     = 'image/jpeg,image/png,image/webp'

function Profile() {
  const { user }                             = useAuth()
  const { profile, loading, updateProfile }  = useUserProfile()

  const [displayName,   setDisplayName]   = useState('')
  const [saving,        setSaving]        = useState(false)
  const [success,       setSuccess]       = useState(false)
  const [error,         setError]         = useState(null)
  const [reportCount,   setReportCount]   = useState(null)
  const [myReports,     setMyReports]     = useState([])

  // Foto de perfil
  const [photoPreview,  setPhotoPreview]  = useState(null)   // blob URL temporal
  const [photoFile,     setPhotoFile]     = useState(null)   // File object
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError,    setPhotoError]    = useState(null)
  const fileInputRef = useRef(null)

  // Precarga datos cuando el perfil llega
  useEffect(() => {
    if (profile?.displayName) setDisplayName(profile.displayName)
    if (profile?.photoURL)    setPhotoPreview(profile.photoURL)
    else if (user?.photoURL)  setPhotoPreview(user.photoURL)
  }, [profile, user])

  // Reportes propios — query directa, sin descargar todos los reportes
  useEffect(() => {
    if (!user) return
    firestoreService.getReportsByUser(user.uid).then((own) => {
      setReportCount(own.length)
      setMyReports(own)
    })
  }, [user])

  // ── Selección de imagen ──────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setPhotoError('El archivo debe ser una imagen (JPG, PNG o WebP)')
      return
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setPhotoError(`La imagen no puede superar ${MAX_PHOTO_MB} MB`)
      return
    }

    setPhotoError(null)
    setPhotoFile(file)
    // Preview local instantáneo sin esperar upload
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }

  // ── Upload de foto ───────────────────────────────────────────────────────
  const handlePhotoUpload = async () => {
    if (!photoFile || !user) return
    setPhotoError(null)
    setPhotoUploading(true)
    try {
      const photoURL = await cloudinaryService.uploadImage(photoFile)

      // Guarda en Firebase Auth
      await authService.updateUserProfile(displayName || profile?.displayName || '', photoURL)

      // Guarda en Firestore users/{uid}
      await saveProfile(user.uid, {
        displayName: displayName || profile?.displayName || '',
        email: user.email,
        photoURL,
      })

      setPhotoPreview(photoURL)
      setPhotoFile(null)
    } catch (err) {
      setPhotoError('Error al subir la foto: ' + err.message)
    } finally {
      setPhotoUploading(false)
    }
  }

  // ── Guardar nombre ───────────────────────────────────────────────────────
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

        {/* Avatar + foto */}
        <div className="profile-avatar-row">
          <div className="profile-photo-wrapper">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Foto de perfil"
                className="profile-photo"
              />
            ) : (
              <UserAvatar name={name} size={72} />
            )}

            {/* Botón de cámara superpuesto */}
            <button
              type="button"
              className="profile-photo-edit-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Cambiar foto de perfil"
              aria-label="Cambiar foto de perfil"
            >
              📷
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED}
              onChange={handlePhotoChange}
              className="profile-photo-input"
              aria-hidden="true"
            />
          </div>

          <div className="profile-name-block">
            <h1 className="profile-title">{name}</h1>
            <span className="profile-email-label">{user?.email}</span>
          </div>
        </div>

        {/* Botón de confirmación de foto — solo aparece si hay archivo nuevo */}
        {photoFile && (
          <div className="profile-photo-confirm">
            <span className="profile-photo-filename">{photoFile.name}</span>
            <button
              type="button"
              className="submit-btn submit-btn--photo"
              onClick={handlePhotoUpload}
              disabled={photoUploading}
            >
              {photoUploading ? 'Subiendo...' : 'Guardar foto'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setPhotoFile(null)
                setPhotoPreview(profile?.photoURL ?? user?.photoURL ?? null)
              }}
              disabled={photoUploading}
            >
              Cancelar
            </button>
          </div>
        )}

        {photoError && <p className="profile-error">{photoError}</p>}

        {/* Estadística */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="stat-value">{reportCount ?? '—'}</span>
            <span className="stat-label">Reportes enviados</span>
          </div>
        </div>

        {/* Formulario de nombre */}
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

        {/* Historial de reportes propios */}
        {myReports.length > 0 && (
          <div className="profile-history">
            <h2 className="profile-history-title">Mis reportes</h2>
            <ul className="profile-history-list">
              {myReports.map((r) => {
                const cat   = getCategoryByName(r.category)
                const color = cat?.color ?? '#7f8c8d'
                const fecha = r.createdAt?.toDate
                  ? r.createdAt.toDate().toLocaleDateString('es-SV', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })
                  : null

                const statusLabel = {
                  pending:   'Pendiente',
                  confirmed: 'Confirmado',
                  resolved:  'Resuelto',
                }[r.status ?? 'pending'] ?? 'Pendiente'

                const statusColor = {
                  pending:   '#f39c12',
                  confirmed: '#27ae60',
                  resolved:  '#2980b9',
                }[r.status ?? 'pending'] ?? '#f39c12'

                return (
                  <li key={r.id} className="profile-history-item">
                    <span
                      className="profile-history-stripe"
                      style={{ backgroundColor: color }}
                    />
                    <div className="profile-history-body">
                      <div className="profile-history-row">
                        <span className="profile-history-cat" style={{ color }}>
                          {cat?.icon} {r.category}
                        </span>
                        <span
                          className="profile-history-status"
                          style={{ color: statusColor }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="profile-history-desc">
                        {r.description
                          ? r.description.substring(0, 80) + (r.description.length > 80 ? '...' : '')
                          : 'Sin descripción'}
                      </p>
                      {fecha && (
                        <span className="profile-history-fecha">📅 {fecha}</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

      </div>
    </div>
  )
}

export default Profile