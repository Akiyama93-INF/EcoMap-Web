// Home — Fase 4 + INSA
// Añadido:
//   - Validación de ubicación fuera de El Salvador
//   - Mensajes de progreso por pasos en handleReportSubmit
//   - onConfirmExisting para reportes duplicados
//   - Bienvenida personalizada con nombre y conteo de reportes propios
// Actualizado:
//   - isDark desde useTheme pasado a MapView para tiles oscuros
//   - isOffline desde useReports para mostrar banner sin conexión
//   - scope === 'insa' → renderiza INSAMapView con CRS.Simple
//     La validación GPS se salta para el plano interno del INSA.
//   - onLocationChange: el GPS del formulario puede actualizar selectedLocation
//     y mover el mapa al punto detectado (scope nacional únicamente)
// v3.2.6:
//   - Deep link: lee ?reportId al montar (después de que markers estén listos),
//     hace flyTo al marcador y dispara ecomap:openReport para abrir el popup.

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView           from '../components/MapView'
import INSAMapView       from '../components/INSAMapView'
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

// Límites geográficos de El Salvador — solo aplican al mapa nacional
const EL_SALVADOR_BOUNDS = {
  minLat: 12.8, maxLat: 14.8,
  minLng: -90.1, maxLng: -87.6,
}

// Límites del sistema de coordenadas interno del plano INSA (píxeles de imagen)
const INSA_BOUNDS = {
  minLat: 0, maxLat: 1024,
  minLng: 0, maxLng: 1295,
}

function Home({ scope = 'nacional' }) {
  const navigate = useNavigate()
  const { user, loading: authLoading }  = useAuth()
  const {
    reports: markers,
    loading: reportsLoading,
    isOffline,
    refresh
  } = useReports(scope)
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

  // Deep link — leer ?reportId del URL y abrir el reporte correspondiente
  // Se ejecuta cuando markers ya están cargados (reportsLoading === false)
  useEffect(() => {
    if (reportsLoading || markers.length === 0) return

    const params   = new URLSearchParams(window.location.search)
    const reportId = params.get('reportId')
    if (!reportId) return

    const marker = markers.find((m) => m.id === reportId)
    if (!marker) return

    // Volar al marcador en el mapa
    setFlyTarget({ lat: marker.lat, lng: marker.lng })

    // Abrir el popup de detalles con un pequeño delay para que el flyTo inicie primero
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ecomap:openReport', { detail: marker }))
    }, 600)

    // Limpiar el param del URL sin recargar la página
    const cleanUrl = window.location.pathname
    window.history.replaceState(null, '', cleanUrl)
  }, [reportsLoading, markers])

  // Clic en el mapa → validar bounds según scope → iniciar formulario
  const handleMarkerPlace = useCallback((location) => {
    const { lat, lng } = location

    if (scope === 'insa') {
      if (
        lat < INSA_BOUNDS.minLat || lat > INSA_BOUNDS.maxLat ||
        lng < INSA_BOUNDS.minLng || lng > INSA_BOUNDS.maxLng
      ) {
        return
      }
    } else {
      if (
        lat < EL_SALVADOR_BOUNDS.minLat || lat > EL_SALVADOR_BOUNDS.maxLat ||
        lng < EL_SALVADOR_BOUNDS.minLng || lng > EL_SALVADOR_BOUNDS.maxLng
      ) {
        alert('Ese punto está fuera del área soportada. EcoMap solo funciona en El Salvador.')
        return
      }
    }

    setSelectedLocation(location)
    if (user) {
      setShowReportForm(true)
    } else {
      navigate('/login')
    }
  }, [user, navigate, scope])

  // GPS del formulario → actualiza selectedLocation + vuela el mapa al punto
  // Solo aplica en scope nacional; en INSA no hay GPS real
  const handleLocationChange = useCallback((location) => {
    const { lat, lng } = location

    // Validar que la posición GPS esté dentro de El Salvador
    if (
      lat < EL_SALVADOR_BOUNDS.minLat || lat > EL_SALVADOR_BOUNDS.maxLat ||
      lng < EL_SALVADOR_BOUNDS.minLng || lng > EL_SALVADOR_BOUNDS.maxLng
    ) {
      // No bloqueamos con alert — el ReportForm ya mostrará el error de GPS
      return
    }

    setSelectedLocation({ lat, lng })
    setFlyTarget({ lat, lng })

    // Abrir formulario si el usuario está autenticado y no está ya abierto
    if (user && !showReportForm) {
      setShowReportForm(true)
    }
  }, [user, showReportForm])

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

        // Nacional o INSA — determina la colección lógica del reporte
        scope:       scope,

        category:    formData.category,
        reportType:  cat?.reportType ?? 'citizen',
        subtypes:    formData.subtypes ?? [],
        description: formData.description,
        // Para INSA: coordenadas internas del plano (0–1024, 0–1295)
        // Para Nacional: coordenadas GPS reales de El Salvador
        lat:         formData.location.lat,
        lng:         formData.location.lng,
        imageUrl,
      })

      onProgress?.('¡Reporte enviado!')
      await new Promise((r) => setTimeout(r, 800))

      setShowReportForm(false)
      setSelectedLocation(null)
      setFlyTarget(null)
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
    setFlyTarget(null)
  }

  if (authLoading || reportsLoading) return <Loading message="Iniciando EcoMap..." />

  // Props comunes para ambos mapas
  const mapProps = {
    onMarkerPlace:   handleMarkerPlace,
    markers,
    flyTarget,
    selectedMarkerId,
    currentUserId:   user?.uid ?? null,
    onConfirmReport: handleConfirmReport,
    showReportForm,
  }

  return (
    <div className="home">

      {/* Banner de modo offline */}
      {isOffline && (
        <div className="offline-banner">
          Sin conexión — mostrando datos en caché. Los reportes nuevos se enviarán al reconectarse.
        </div>
      )}

      <div className="home-container">

        {/* Mapa — Nacional usa Leaflet/OSM, INSA usa CRS.Simple + plano */}
        <div className="map-section">
          {scope === 'insa' ? (
            <INSAMapView {...mapProps} />
          ) : (
            <MapView {...mapProps} isDark={isDark} />
          )}
        </div>

        {/* Sidebar — idéntico para ambos scopes */}
        <div className="sidebar">
          {showReportForm && user ? (
            <ReportForm
              location={selectedLocation}
              onSubmit={handleReportSubmit}
              onCancel={handleCancelForm}
              markers={markers}
              scope={scope}
              onLocationChange={scope !== 'insa' ? handleLocationChange : undefined}
              onConfirmExisting={async (report) => {
                await handleConfirmReport(report.id)
                setShowReportForm(false)
                setSelectedLocation(null)
                setFlyTarget(null)
              }}
            />
          ) : (
            <>
              <div className="welcome-section">
                {user ? (
                  <>
                    <h2>¡Hola, {displayName}!</h2>
                    <p>
                      {scope === 'insa'
                        ? 'Haz clic en el plano para reportar una situación ambiental dentro del INSA.'
                        : 'Haz clic en el mapa o usa el GPS del formulario para reportar un punto ambiental.'
                      }
                    </p>
                    {myReportCount > 0 && (
                      <p className="welcome-stats">
                        Tienes <strong>{myReportCount}</strong> {myReportCount === 1 ? 'reporte enviado' : 'reportes enviados'}.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h2>
                      {scope === 'insa'
                        ? 'EcoMap — Instituto Nacional de Santa Ana'
                        : 'Bienvenido a EcoMap'
                      }
                    </h2>
                    <p>
                      {scope === 'insa'
                        ? 'Haz clic en el plano del Instituto Nacional de Santa Ana para reportar un punto ambiental.'
                        : 'Haz clic en el mapa para reportar un punto ambiental en El Salvador.'
                      }
                    </p>
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
          currentUser={user ?? null}
          onUpdateStatus={async (reportId, status) => {
            await firestoreService.updateReportStatus(reportId, status, user?.uid)
            refresh()
            setOpenReport(null)
          }}
        />
      )}
    </div>
  )
}

export default Home