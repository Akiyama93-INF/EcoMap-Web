import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import ProfileOverview from '../components/ProfileOverview'
import Loading from '../components/Loading'
import cloudinaryService from '../firebase/cloudinaryService'
import firestoreService from '../firebase/firestoreService'
import authService from '../firebase/authService'
import { getProfile } from '../firebase/profileService'
import '../styles/pages/Workspace.css'

function ProfileAccount({ user }) {
  const [account, setAccount] = useState({ name: user.displayName || '', email: user.email || '', photoURL: user.photoURL || null })
  const [draftName, setDraftName] = useState(user.displayName || '')
  const [accountLoading, setAccountLoading] = useState(true)
  const [accountError, setAccountError] = useState(null)
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError, setReportsError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(null)

  useEffect(() => {
    let active = true
    getProfile(user.uid).then((profile) => {
      if (!active) return
      const name = profile?.displayName || user.displayName || ''
      setAccount({ name, email: user.email || '', photoURL: profile?.photoURL || user.photoURL || null, createdAt: profile?.createdAt })
      setDraftName(name)
    }).catch(() => { if (active) setAccountError('No pudimos cargar todos los datos de tu cuenta. Se muestran los datos de tu sesión.') })
      .finally(() => { if (active) setAccountLoading(false) })
    return () => { active = false }
  }, [user.uid])

  useEffect(() => {
    let active = true
    setReportsLoading(true); setReportsError(null)
    firestoreService.getReportsByUser(user.uid).then((own) => { if (active) setReports(own) })
      .catch(() => { if (active) setReportsError('No pudimos cargar tus reportes. Tus datos siguen guardados.') })
      .finally(() => { if (active) setReportsLoading(false) })
    return () => { active = false }
  }, [user.uid, attempt])

  useEffect(() => {
    if (!photoFile) { setPhotoPreview(null); return }
    const url = URL.createObjectURL(photoFile)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photoFile])

  const saveName = async (event) => {
    event.preventDefault()
    if (saving || photoBusy) return
    const name = draftName.trim()
    if (name.length < 2 || name.length > 80) { setSaveError('El nombre debe tener entre 2 y 80 caracteres.'); return }
    setSaving(true); setSaveError(null); setSuccess(null)
    try { await authService.updateUserProfile(name); setAccount((previous) => ({ ...previous, name })); setDraftName(name); setSuccess('Tu nombre se actualizó correctamente.') }
    catch { setSaveError('No pudimos guardar el nombre. Intenta de nuevo.') }
    finally { setSaving(false) }
  }
  const selectPhoto = (file) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setPhotoError('Selecciona una imagen JPG, PNG o WebP.'); return }
    if (file.size > 5 * 1024 * 1024) { setPhotoError('La imagen no puede superar 5 MB.'); return }
    setPhotoError(null); setPhotoFile(file)
  }
  const savePhoto = async () => {
    if (!photoFile || photoBusy || saving) return
    setPhotoBusy(true); setPhotoError(null)
    try {
      const photoURL = await cloudinaryService.uploadImage(photoFile)
      if (typeof photoURL !== 'string' || !photoURL.startsWith('https://')) throw new Error('Respuesta de imagen no válida')
      await authService.updateUserProfile(account.name || user.displayName || user.email?.split('@')[0] || 'Usuario', photoURL)
      setAccount((previous) => ({ ...previous, photoURL })); setPhotoFile(null)
    } catch { setPhotoError('No pudimos guardar la foto. Puedes volver a intentarlo.') }
    finally { setPhotoBusy(false) }
  }
  const logout = async () => {
    if (loggingOut || !window.confirm('¿Quieres cerrar tu sesión de EcoMap?')) return
    setLoggingOut(true); setLogoutError(null)
    try { await authService.logout() }
    catch { setLogoutError('No pudimos cerrar la sesión. Intenta de nuevo.'); setLoggingOut(false) }
  }
  if (accountLoading) return <Loading message="Cargando tu cuenta…" />
  return <ProfileOverview account={account} accountError={accountError}
    editor={{ draftName, onNameChange: (value) => { setDraftName(value); setSuccess(null); setSaveError(null) }, onSubmit: saveName, saving, error: saveError, success }}
    photo={{ previewUrl: photoPreview, fileName: photoFile?.name, error: photoError, busy: photoBusy, onSelect: selectPhoto, onSave: savePhoto, onCancel: () => { setPhotoFile(null); setPhotoError(null) } }}
    activity={{ reports, loading: reportsLoading, error: reportsError, onRetry: () => setAttempt((value) => value + 1) }}
    session={{ onLogout: logout, busy: loggingOut, error: logoutError }} />
}
ProfileAccount.propTypes = { user: PropTypes.object.isRequired }

export default function Profile() {
  const { user, loading } = useAuth()
  if (loading) return <Loading message="Cargando tu cuenta…" />
  if (!user) return <div className="workspace account-page"><section className="surface account-guest"><span className="workspace-kicker">TU CUENTA</span><h1>Tu actividad, en un solo lugar</h1><p>Inicia sesión para consultar tus reportes y administrar tu perfil.</p><Link className="ui-button" to="/login">Iniciar sesión</Link><Link className="text-button" to="/nacional">Volver al mapa</Link></section></div>
  return <ProfileAccount key={user.uid} user={user} />
}
