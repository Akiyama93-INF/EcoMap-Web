import PropTypes from 'prop-types'
// Home — v3.4.3
// Layout split-screen en móvil:
//   - Mapa fijo en la mitad superior (45dvh), lista scrolleable en la inferior.
//   - Ambos paneles visibles simultáneamente — sin tabs, sin scroll de página.
//   - Seleccionar un item de la lista hace flyTo en el mapa en tiempo real.
//   - Desktop mantiene el grid de dos columnas sin cambios.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
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
import { filterReports } from '../utils/reportFilters'
import useDesktopLayout from '../hooks/useDesktopLayout'

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
  const selectionTimer = useRef(null)
  const isDesktop = useDesktopLayout()
  const [sidebarWidth, setSidebarWidth] = useState(400)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showReportForm,   setShowReportForm]   = useState(false)
  const [flyTarget,        setFlyTarget]        = useState(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState(null)
  const [openReport,       setOpenReport]       = useState(null)
  const [confirmError,     setConfirmError]     = useState(null)

  const [filters, setFilters] = useState({ category: 'all', status: 'all', sortBy: 'fecha', search: '' })
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [selectingLocation, setSelectingLocation] = useState(false)
  const visibleMarkers = useMemo(() => filterReports(markers, filters), [markers, filters])

  useEffect(() => {
    const handler = (e) => {
      if (!e.detail?.id) return
      setOpenReport(e.detail)
      setSidebarCollapsed(false)
      setShowReportForm(false)
      setSelectedLocation(null)
      setSelectingLocation(false)
      setFlyTarget({ lat: e.detail.lat, lng: e.detail.lng })
    }
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

    setSelectingLocation(false)
    setOpenReport(null)
    setSidebarCollapsed(false)
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
    if (isDesktop) {
      setOpenReport(marker)
      setSidebarCollapsed(false)
    }
    clearTimeout(selectionTimer.current)
    selectionTimer.current = setTimeout(() => {
      setSelectedMarkerId(null)
      setFlyTarget(null)
    }, 1800)
  }, [isDesktop])

  useEffect(() => () => clearTimeout(selectionTimer.current), [])

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

  const closeReport = useCallback(() => setOpenReport(null), [])
  const currentReport = openReport ? markers.find((marker) => marker.id === openReport.id) : null
  const reportDetails = currentReport && (
    <ReportPopup
      key={currentReport.id}
      report={currentReport}
      embedded={isDesktop}
      onClose={closeReport}
      currentUserId={user?.uid ?? null}
      currentUser={user ?? null}
      onUpdateStatus={async (reportId, status) => {
        await firestoreService.updateReportStatus(reportId, status, user?.uid)
        refresh()
      }}
    />
  )

  if (authLoading || reportsLoading) return <Loading message="Iniciando EcoMap..." />

  const mapProps = {
    onMarkerPlace:   handleMarkerPlace,
    markers: visibleMarkers,
    externalLocation: selectedLocation,
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

      <MarkerList markers={markers} visibleMarkers={visibleMarkers} filters={filters} onFiltersChange={setFilters} onMarkerSelect={handleMarkerSelect} />
    </>
  )

  return (
    <div className={`home${panelExpanded ? ' home--expanded' : ''}${showReportForm ? ' home--reporting' : ''}${isDesktop && sidebarCollapsed ? ' home--sidebar-collapsed' : ''}`} style={{ '--sidebar-width': `${sidebarWidth}px` }}>
      {isOffline && (
        <div className="offline-banner">
          Sin conexión — mostrando datos en caché. Los reportes nuevos se enviarán al reconectarse.
        </div>
      )}

      <header className="explore-header">
        <div className="explore-heading"><span className="explore-eyebrow">CUIDEMOS NUESTRO ENTORNO</span><h1>{scope === 'insa' ? 'Tu campus, mejor cada día' : 'Un mejor entorno empieza aquí'}</h1></div>
        <div className="explore-scopes" aria-label="Mapa actual"><NavLink to="/nacional" className={scope === 'nacional' ? 'active' : ''}>Nacional</NavLink><NavLink to="/insa" className={scope === 'insa' ? 'active' : ''}>INSA</NavLink></div>
        <button className="desktop-panel-toggle" aria-expanded={!sidebarCollapsed} aria-controls="explore-sidebar" onClick={() => setSidebarCollapsed((value) => !value)} disabled={showReportForm}>{sidebarCollapsed ? 'Mostrar reportes' : 'Ampliar mapa'}</button>
        <button className="explore-report" onClick={() => { setSelectingLocation((value) => !value); setPanelExpanded(false) }} aria-pressed={selectingLocation} disabled={showReportForm}>{selectingLocation ? 'Cancelar selección' : '+ Reportar'}</button>
      </header>
      {selectingLocation && <div className="explore-instruction" role="status">Selecciona el lugar del problema en el {scope === 'insa' ? 'plano del campus' : 'mapa'} para crear tu reporte.</div>}
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
        <aside className="sidebar" id="explore-sidebar" aria-label="Reportes y detalles" hidden={isDesktop && sidebarCollapsed}>
          <div className="desktop-panel-tools">
            <label htmlFor="sidebar-width">Ancho del panel</label>
            <input id="sidebar-width" type="range" min="340" max="560" step="20" value={sidebarWidth} onChange={(event) => setSidebarWidth(Number(event.target.value))} aria-valuetext={`${sidebarWidth} píxeles`} />
            <button onClick={() => setSidebarWidth(400)} title="Restablecer ancho del panel" aria-label="Restablecer ancho del panel">↺</button>
          </div>
          {!showReportForm && <button className="panel-toggle" aria-expanded={panelExpanded} aria-controls="report-list-panel" onClick={() => setPanelExpanded((value) => !value)}><span className="panel-grip" />{panelExpanded ? 'Ver más mapa' : 'Ver más reportes'}<span aria-hidden="true">{panelExpanded ? '↓' : '↑'}</span></button>}
          <div id="report-list-panel" className="sidebar-content">
          {isDesktop && reportDetails ? reportDetails : showReportForm && user ? (
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
        </aside>
      </div>

      {showReportForm && (
        <div className="report-form-backdrop" onClick={handleCancelForm} />
      )}

      {!isDesktop && reportDetails}

    </div>
  )
}

export default Home
Home.propTypes = {
  scope: PropTypes.oneOf(['nacional', 'insa']),
}
