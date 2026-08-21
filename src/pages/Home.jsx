// Home — v3.4.3
// Layout split-screen en móvil:
//   - Mapa fijo en la mitad superior (45dvh), lista scrolleable en la inferior.
//   - Ambos paneles visibles simultáneamente — sin tabs, sin scroll de página.
//   - Seleccionar un item de la lista hace flyTo en el mapa en tiempo real.
//   - Desktop mantiene el grid de dos columnas sin cambios.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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

const EL_SALVADOR_BOUNDS = {
  minLat: 12.8, maxLat: 14.8,
  minLng: -90.1, maxLng: -87.6,
}

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
  const mapSectionRef = useRef(null)

  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showReportForm,   setShowReportForm]   = useState(false)
  const [flyTarget,        setFlyTarget]        = useState(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState(null)
  const [openReport,       setOpenReport]       = useState(null)
  const [confirmError,     setConfirmError]     = useState(null)

  const myReportCount = useMemo(() => {
    if (!user) return 0
    return markers.filter((m) => m.userId === user.uid).length
  }, [markers, user])

  const displayName = user?.displayName || user?.email?.split('@')[0] || ''

  useEffect(() => {
    const handler = (e) => setOpenReport(e.detail)
    window.addEventListener('ecomap:openReport', handler)
    return () => window.removeEventListener('ecomap:openReport', handler)
  }, [])

  useEffect(() => {
    if (reportsLoading || markers.length === 0) return

    const params   = new URLSearchParams(window.location.search)
    const reportId = params.get('reportId')
    if (!reportId) return

    const marker = markers.find((m) => m.id === reportId)
    if (!marker) return

    setFlyTarget({ lat: marker.lat, lng: marker.lng })

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ecomap:openReport', { detail: marker }))
    }, 600)

    window.history.replaceState(null, '', window.location.pathname)
  }, [reportsLoading, markers])

  const handleMarkerPlace = useCallback((location) => {
    const { lat, lng } = location

    if (scope === 'insa') {
      if (
        lat < INSA_BOUNDS.minLat || lat > INSA_BOUNDS.maxLat ||
        lng < INSA_BOUNDS.minLng || lng > INSA_BOUNDS.maxLng
      ) return
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

  const handleLocationChange = useCallback((location) => {
    const { lat, lng } = location
    if (
      lat < EL_SALVADOR_BOUNDS.minLat || lat > EL_SALVADOR_BOUNDS.maxLat ||
      lng < EL_SALVADOR_BOUNDS.minLng || lng > EL_SALVADOR_BOUNDS.maxLng
    ) return

    setSelectedLocation({ lat, lng })
    setFlyTarget({ lat, lng })

    if (user && !showReportForm) {
      setShowReportForm(true)
    }
  }, [user, showReportForm])

  // Selección desde MarkerList — flyTo en tiempo real sin cambiar de vista.
  // El mapa siempre está visible (split-screen), solo se necesita el flyTo
  // y el highlight temporal del marcador seleccionado.
  const handleMarkerSelect = useCallback((marker) => {
    setFlyTarget({ lat: marker.lat, lng: marker.lng })
    setSelectedMarkerId(marker.id)

    setTimeout(() => {
      setSelectedMarkerId(null)
      setFlyTarget(null)
    }, 1800)
  }, [])

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
        scope,
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
      setFlyTarget(null)
      refresh()
    } catch (err) {
      console.error('Error creando reporte:', err)
      throw err
    }
  }

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

  const mapProps = {
    onMarkerPlace:   handleMarkerPlace,
    markers,
    flyTarget,
    selectedMarkerId,
    currentUserId:   user?.uid ?? null,
    onConfirmReport: handleConfirmReport,
    showReportForm,
  }

  const sidebarContent = (
    <>
      {confirmError && (
        <div className="warning-message">{confirmError}</div>
      )}

      <MarkerList markers={markers} onMarkerSelect={handleMarkerSelect} />
    </>
  )

  return (
    <div className="home">
      {isOffline && (
        <div className="offline-banner">
          Sin conexión — mostrando datos en caché. Los reportes nuevos se enviarán al reconectarse.
        </div>
      )}

      <div className="home-container">
        {/* Mapa — mitad superior en móvil, columna izquierda en desktop */}
        <div className="map-section" ref={mapSectionRef}>
          {scope === 'insa' ? (
            <INSAMapView {...mapProps} />
          ) : (
            <MapView {...mapProps} isDark={isDark} />
          )}
        </div>

        {/* Sidebar — mitad inferior scrolleable en móvil, columna derecha en desktop */}
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
            sidebarContent
          )}
        </div>
      </div>

      {showReportForm && (
        <div className="report-form-backdrop" onClick={handleCancelForm} />
      )}

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