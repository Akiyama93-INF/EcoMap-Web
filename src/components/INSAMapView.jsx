// INSAMapView — Mapa interno del Instituto Nacional de Santa Ana (INSA)
//
// Usa Leaflet con CRS.Simple: sin tiles de OpenStreetMap.
// La imagen del plano se carga como ImageOverlay sobre un sistema de
// coordenadas propio (píxeles de la imagen).
//
// Sistema de coordenadas interno:
//   [0,    0   ] = esquina superior izquierda del plano
//   [1024, 1295] = esquina inferior derecha   (alto, ancho)
//
// Los marcadores guardados en Firestore con scope:"insa" usan este
// sistema. No son coordenadas GPS.
//
// Props reutilizados 1:1 con MapView:
//   onMarkerPlace, markers, flyTarget, selectedMarkerId,
//   currentUserId, onConfirmReport, showReportForm

import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { getCategoryByName, CATEGORIES } from '../utils/categories'
import '../styles/components/INSAMapView.css'

// ── Dimensiones reales de la imagen ──────────────────────────────────────────
const IMG_H   = 1024
const IMG_W   = 1295
const BOUNDS  = [[0, 0], [IMG_H, IMG_W]]   // [[minY, minX], [maxY, maxX]]
const CENTER  = [IMG_H / 2, IMG_W / 2]     // [512, 647]
const ZOOM_0  = 0
const MIN_Z   = -2
const MAX_Z   = 3

// URL de la imagen — debe estar en /public/
const PLAN_URL = '/insa-campus-map.png'

// ── Iconos de marcadores (misma lógica que MapView) ──────────────────────────
function createCategoryIcon(color, symbol) {
  return L.divIcon({
    className: '',
    html: `<div class="cat-marker" style="--marker-color:${color}">
      <span class="cat-marker-symbol">${symbol}</span>
      <div class="cat-marker-tail"></div>
    </div>`,
    iconSize:    [36, 44],
    iconAnchor:  [18, 44],
    popupAnchor: [0, -46],
  })
}

const CATEGORY_ICONS = {
  [CATEGORIES.CLANDESTINE_DUMP.id]:       createCategoryIcon(CATEGORIES.CLANDESTINE_DUMP.mapColor,       CATEGORIES.CLANDESTINE_DUMP.icon),
  [CATEGORIES.ECOLOGICAL_POINT.id]:       createCategoryIcon(CATEGORIES.ECOLOGICAL_POINT.mapColor,       CATEGORIES.ECOLOGICAL_POINT.icon),
  [CATEGORIES.ENVIRONMENTAL_INCIDENT.id]: createCategoryIcon(CATEGORIES.ENVIRONMENTAL_INCIDENT.mapColor, CATEGORIES.ENVIRONMENTAL_INCIDENT.icon),
  [CATEGORIES.CONTAMINATED_RIVER.id]:     createCategoryIcon(CATEGORIES.CONTAMINATED_RIVER.mapColor,     CATEGORIES.CONTAMINATED_RIVER.icon),
}
const DEFAULT_ICON = createCategoryIcon('#7f8c8d', '📍')
const CLICKED_ICON = createCategoryIcon('#3498db', '📍')

function getIconForMarker(marker) {
  const cat = getCategoryByName(marker.category)
  return (cat && CATEGORY_ICONS[cat.id]) ? CATEGORY_ICONS[cat.id] : DEFAULT_ICON
}

// ── Subcomponentes internos ───────────────────────────────────────────────────

// Restringe el mapa a los límites del plano y bloquea zoom fuera de rango
function PlanoBounds() {
  const map = useMap()
  useEffect(() => {
    map.setMaxBounds(BOUNDS)
    map.setMinZoom(MIN_Z)
    map.setMaxZoom(MAX_Z)
  }, [map])
  return null
}

// Captura clics sobre el plano y los convierte a coordenadas internas
function PlaноClickHandler({ onPlaноClick }) {
  useMapEvents({
    click(e) {
      if (onPlaноClick) {
        onPlaноClick({ lat: e.latlng.lat, lng: e.latlng.lng })
      }
    },
  })
  return null
}

// Vuela a un marcador cuando se selecciona desde la lista lateral
function MarkerOpener({ markerId, markerRefs }) {
  const map = useMap()
  useEffect(() => {
    if (!markerId) return
    const inst = markerRefs.current[markerId]
    if (inst) setTimeout(() => inst.openPopup(), 700)
  }, [markerId, markerRefs, map])
  return null
}

// Vuela a una posición programáticamente
function FlyTo({ position, zoom = 1 }) {
  const map = useMap()
  const prev = useRef(null)
  useEffect(() => {
    if (!position) return
    const same =
      prev.current &&
      prev.current.lat === position.lat &&
      prev.current.lng === position.lng
    if (!same) {
      map.flyTo([position.lat, position.lng], zoom, { duration: 1.0 })
      prev.current = position
    }
  }, [position, zoom, map])
  return null
}

// ── Popup enriquecido (misma lógica que ReportPopupLeaflet en MapView) ────────
function INSAPopup({ marker, cat, currentUserId, onConfirmReport }) {
  const color = cat?.color ?? '#7f8c8d'

  const [localCount, setLocalCount] = useState(marker.confirmationCount ?? 0)
  const [confirmed,  setConfirmed]  = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmErr, setConfirmErr] = useState(null)

  const alreadyConfirmed =
    confirmed ||
    (currentUserId && (marker.confirmations ?? []).includes(currentUserId))

  const isOwner = currentUserId && currentUserId === marker.userId

  const fecha = marker.createdAt?.toDate
    ? marker.createdAt.toDate().toLocaleDateString('es-SV', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : 'Sin fecha'

  const subtypeLabels = (cat?.subtypes ?? [])
    .filter((s) => (marker.subtypes ?? []).includes(s.id))
    .map((s) => `${s.icon} ${s.label}`)

  const handleConfirm = async () => {
    if (!currentUserId || alreadyConfirmed || confirming || isOwner) return
    setConfirming(true)
    setConfirmErr(null)
    try {
      await onConfirmReport(marker.id)
      setConfirmed(true)
      setLocalCount((c) => c + 1)
    } catch {
      setConfirmErr('No se pudo confirmar')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="popup-content">
      <div className="popup-category-badge" style={{ backgroundColor: color }}>
        <span>{cat?.icon ?? '📍'}</span>
        <span>{marker.category}</span>
      </div>

      {marker.imageUrl && (
        <img src={marker.imageUrl} alt="Reporte" className="popup-img" />
      )}

      <p className="popup-description">{marker.description}</p>

      {subtypeLabels.length > 0 && (
        <div className="popup-subtypes">
          {subtypeLabels.map((l) => (
            <span key={l} className="popup-subtype-chip">{l}</span>
          ))}
        </div>
      )}

      <div className="popup-meta">
        <span>👤 {marker.userName ?? 'Anónimo'}</span>
        <span>📅 {fecha}</span>
        {localCount > 0 && (
          <span className="popup-confirmations">
            ✅ {localCount} confirmación{localCount !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {confirmErr && <p className="popup-confirm-err">{confirmErr}</p>}

      <div className="popup-actions">
        {currentUserId && !isOwner && (
          <button
            className={`popup-confirm-btn${alreadyConfirmed ? ' confirmed' : ''}`}
            onClick={handleConfirm}
            disabled={alreadyConfirmed || confirming}
            title={alreadyConfirmed ? 'Ya confirmaste este reporte' : 'Confirmar que sigue siendo válido'}
          >
            {confirming ? '...' : alreadyConfirmed ? '✅ Confirmado' : '👍 Confirmar'}
          </button>
        )}

        <button
          className="popup-details-btn"
          onClick={() =>
            window.dispatchEvent(new CustomEvent('ecomap:openReport', { detail: marker }))
          }
        >
          Ver detalles
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
function INSAMapView({
  onMarkerPlace,
  markers,
  flyTarget,
  selectedMarkerId,
  currentUserId,
  onConfirmReport,
  showReportForm,
}) {
  const [clickedLocation, setClickedLocation] = useState(null)
  const markerRefs = useRef({})
  const mapRef     = useRef(null)

  // Invalidar tamaño cuando el sidebar abre/cierra (igual que MapView)
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 300)
    }
  }, [showReportForm])

  const handlePlaноClick = useCallback((loc) => {
    // Rechazar clics fuera del plano
    if (
      loc.lat < 0 || loc.lat > IMG_H ||
      loc.lng < 0 || loc.lng > IMG_W
    ) return

    setClickedLocation(loc)
    if (onMarkerPlace) onMarkerPlace(loc)
  }, [onMarkerPlace])

  return (
    <div className="insa-mapview-container">

      {/* Etiqueta institucional */}

      <MapContainer
        crs={L.CRS.Simple}
        center={CENTER}
        zoom={ZOOM_0}
        minZoom={MIN_Z}
        maxZoom={MAX_Z}
        className="insa-mapview"
        zoomControl={true}
        ref={mapRef}
        maxBounds={BOUNDS}
        maxBoundsViscosity={0.85}
      >
        {/* Plano del INSA como capa de imagen */}
        <ImageOverlay
          url={PLAN_URL}
          bounds={BOUNDS}
          opacity={1}
          zIndex={1}
        />

        <PlanoBounds />
        <PlaноClickHandler onPlaноClick={handlePlaноClick} />
        <FlyTo position={flyTarget} zoom={1} />
        <MarkerOpener markerId={selectedMarkerId} markerRefs={markerRefs} />

        {/* Marcador de ubicación seleccionada (pendiente de formulario) */}
        {clickedLocation && (
          <Marker
            position={[clickedLocation.lat, clickedLocation.lng]}
            icon={CLICKED_ICON}
          >
            <Popup>
              <div className="popup-content">
                <p className="popup-label">Ubicación seleccionada en el plano</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  Pos: ({Math.round(clickedLocation.lat)}, {Math.round(clickedLocation.lng)})
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de reportes existentes */}
        {markers.map((marker) => {
          const cat = getCategoryByName(marker.category)

          return (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={getIconForMarker(marker)}
              ref={(r) => { if (r) markerRefs.current[marker.id] = r }}
            >
              <Popup minWidth={230}>
                <INSAPopup
                  marker={marker}
                  cat={cat}
                  currentUserId={currentUserId}
                  onConfirmReport={onConfirmReport}
                />
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Instrucción de uso */}
      <div className="insa-map-hint">
        Haz clic sobre el plano para seleccionar una ubicación y crear un reporte
      </div>
    </div>
  )
}

export default INSAMapView
