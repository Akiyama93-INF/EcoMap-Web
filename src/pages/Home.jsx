// Home — Fase 4
// Añadido:
//   - Validación de ubicación fuera de El Salvador
//   - Mensajes de progreso por pasos en handleReportSubmit
//   - onConfirmExisting para reportes duplicados
//   - Bienvenida personalizada con nombre y conteo de reportes propios
// Actualizado:
//   - isDark desde useTheme pasado a MapView para tiles oscuros
//   - isOffline desde useReports para mostrar banner sin conexión

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView           from '../components/MapView'
import ReportForm        from '../components/ReportForm'
import ReportPopup       from '../components/ReportPopup'
import MarkerList        from '../components/MarkerList'
import Loading           from '../components/Loading'
import useAuth           from '../hooks/useAuth'
import useReports        from '../hooks/useReports'
import useTheme          from '../hooks/useTheme'
import firestoreService  from '../firebase/firestoreService'
import cloudinaryService from '../firebase/cloudinaryService'
import { getCategoryByName } from '../utils/categories'
import '../styles/pages/Home.css'

const EL_SALVADOR_BOUNDS = {
  minLat: 12.8, maxLat: 14.8,
  minLng: -90.1, maxLng: -87.6,
}

function Home() {
  const navigate = useNavigate()
  const { user, loading: authLoading }                          = useAuth()
  const { reports: markers, loading: reportsLoading, isOffline, refresh } = useReports()
  const { isDark } = useTheme()

  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showReportForm,   setShowReportForm]   = useState(false)
  const [flyTarget,        setFlyTarget]        = useState(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState(null)
  const [openReport,       setOpenReport]       = useState(null)
  const [confirmError,     setConfirmError]     = useState(null)

  // Conteo de reportes propios — calculado desde markers ya cargados
  const myReportCount = useMemo(() => {
    if (!user) return 0
    return markers.filter((m) => m.userId === user.uid).length
  }, [markers, user])

  const displayName = user?.displayName || user?.email?.split('@')[0] || ''

  // Abrir modal de detalles desde botón del popup del mapa
  useEffect(() => {
    const handler = (e) => setOpenReport(e.detail)
    window.addEventListener('ecomap:openReport', handler)
    return () => window.removeEventListener('ecomap:openReport', handler)
  }, [])

  // Clic en el mapa → validar bounds → iniciar formulario
  const handleMarkerPlace = useCallback((location) => {
    const { lat, lng } = location
    if (
      lat < EL_SALVADOR_BOUNDS.minLat || lat > EL_SALVADOR_BOUNDS.maxLat ||
      lng < EL_SALVADOR_BOUNDS.minLng || lng > EL_SALVADOR_BOUNDS.maxLng
    ) {
      alert('Ese punto está fuera del área soportada. EcoMap solo funciona en El Salvador.')
      return
    }
    setSelectedLocation(location)
    if (user) {
      setShowReportForm(true)
    } else {
      navigate('/login')
    }
  }, [user, navigate])

  // Selección desde MarkerList → flyTo + abrir popup
  const handleMarkerSelect = useCallback((marker) => {
    setFlyTarget({ lat: marker.lat, lng: marker.lng })
    setSelectedMarkerId(marker.id)
    setTimeout(() => {
      setSelectedMarkerId(null)
      setFlyTarget(null)
    }, 1500)
  }, [])

  // Envío del formulario con mensajes de progreso
  const handleReportSubmit = async (formData, onProgress) => {
    try {
      let imageUrl = null
      if (formData.image && isOffline) {
        throw new Error('Sin conexión — no se pueden subir imágenes. Envía el reporte sin foto o intenta más tarde.')
      }
      if (formData.image) {
        onProgress?.('Subiendo imagen...')
        imageUrl = await cloudinaryService.uploadImage(formData.image)
      }

      onProgress?.('Guardando reporte...')
      const cat = getCategoryByName(formData.category)

      await firestoreService.createReport({
        userId:      user.uid,
        userName:    user.displayName ?? user.email,
        category:    formData.category,
        reportType:  cat?.reportType ?? 'citizen',
        subtypes:    formData.subtypes ?? [],
        description: formData.description,
        lat:         formData.location.lat,
        lng:         formData.location.lng,
        imageUrl,
      })

      onProgress?.('¡Reporte enviado!')
      await new Promise((r) => setTimeout(r, 800))

      setShowReportForm(false)
      setSelectedLocation(null)
      refresh()
    } catch (err) {
      console.error('Error creando reporte:', err)
      throw err
    }
  }

  // Confirmación colaborativa
  const handleConfirmReport = useCallback(async (reportId) => {
    if (!user) { navigate('/login'); return }
    setConfirmError(null)
    try {
      await firestoreService.confirmReport(reportId, user.uid)
      refresh()
    } catch (err) {
      setConfirmError(err.message)
      throw err
    }
  }, [user, navigate, refresh])

  const handleCancelForm = () => {
    setShowReportForm(false)
    setSelectedLocation(null)
  }

  if (authLoading || reportsLoading) return <Loading message="Iniciando EcoMap..." />

  return (
    <div className="home">

      {/* Banner de modo offline */}
      {isOffline && (
        <div className="offline-banner">
          Sin conexión — mostrando datos en caché. Los reportes nuevos se enviarán al reconectarse.
        </div>
      )}

      <div className="home-container">

        {/* Mapa */}
        <div className="map-section">
          <MapView
            onMarkerPlace={handleMarkerPlace}
            markers={markers}
            flyTarget={flyTarget}
            selectedMarkerId={selectedMarkerId}
            currentUserId={user?.uid ?? null}
            onConfirmReport={handleConfirmReport}
            showReportForm={showReportForm}
            isDark={isDark}
          />
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {showReportForm && user ? (
            <ReportForm
              location={selectedLocation}
              onSubmit={handleReportSubmit}
              onCancel={handleCancelForm}
              markers={markers}
              onConfirmExisting={async (report) => {
                await handleConfirmReport(report.id)
                setShowReportForm(false)
                setSelectedLocation(null)
              }}
            />
          ) : (
            <>
              <div className="welcome-section">
                {user ? (
                  <>
                    <h2>¡Hola, {displayName}!</h2>
                    <p>Haz clic en el mapa para reportar un punto ambiental en El Salvador.</p>
                    {myReportCount > 0 && (
                      <p className="welcome-stats">
                        Tienes <strong>{myReportCount}</strong> {myReportCount === 1 ? 'reporte enviado' : 'reportes enviados'}.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h2>Bienvenido a EcoMap</h2>
                    <p>Haga clic en el mapa para reportar un punto ambiental en El Salvador.</p>
                    <p className="login-prompt">
                      <a href="/login">Inicia sesión</a> para hacer reportes
                    </p>
                  </>
                )}
              </div>

              {confirmError && (
                <div className="warning-message">{confirmError}</div>
              )}

              <MarkerList markers={markers} onMarkerSelect={handleMarkerSelect} />
            </>
          )}
        </div>
      </div>

      {/* Backdrop cuando formulario está abierto */}
      {showReportForm && (
        <div className="report-form-backdrop" onClick={handleCancelForm} />
      )}

      {/* Modal de detalles */}
      {openReport && (
        <ReportPopup
          report={openReport}
          onClose={() => setOpenReport(null)}
          currentUserId={user?.uid ?? null}
          onUpdateStatus={async (reportId, status) => {
            await firestoreService.updateReportStatus(reportId, status)
            refresh()
            setOpenReport(null)
          }}
        />
      )}
    </div>
  )
}

export default Home