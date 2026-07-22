// MapView — Fase 3
// Añadido sobre Fase 2:
//   - approximateLocation(): desplaza el marcador para categorías con applyPrivacy
//   - <Circle> de privacidad con radio variable según categoría
//   - Botón "Confirmar" en el popup del mapa (reportes colaborativos)
//   - Materiales aceptados visibles en popup de Punto ecológico
//   - Props nuevas: currentUserId, onConfirmReport
// Fix aplicado:
//   - mapRef + invalidateSize() al cambiar showReportForm (bug resolución mapa)

import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  MapContainer, TileLayer, Marker, Popup,
  Circle, useMap, useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import useGeolocation from '../hooks/useGeolocation'
import MapControls from './map/MapControls'
import UserLocationMarker from './map/UserLocationMarker'
import MapFlyTo from './map/MapFlyTo'
import { getCategoryByName, CATEGORIES } from '../utils/categories'
import { approximateLocation, getPrivacyRadius } from '../utils/privacy'
import '../styles/components/MapView.css'

const EL_SALVADOR_CENTER = [13.7942, -88.8965]
const EL_SALVADOR_BOUNDS = [[12.8, -90.1], [14.8, -87.6]]

function createCategoryIcon(color, symbol) {
  return L.divIcon({
    className: '',
    html: `<div class="cat-marker" style="--marker-color:${color}">
      <span class="cat-marker-symbol">${symbol}</span>
      <div class="cat-marker-tail"></div>
    </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -46],
  })
}

const CATEGORY_ICONS = {
  [CATEGORIES.CLANDESTINE_DUMP.id]:       createCategoryIcon(CATEGORIES.CLANDESTINE_DUMP.mapColor,       CATEGORIES.CLANDESTINE_DUMP.icon),
  [CATEGORIES.ECOLOGICAL_POINT.id]:       createCategoryIcon(CATEGORIES.ECOLOGICAL_POINT.mapColor,       CATEGORIES.ECOLOGICAL_POINT.icon),
  [CATEGORIES.ENVIRONMENTAL_INCIDENT.id]: createCategoryIcon(CATEGORIES.ENVIRONMENTAL_INCIDENT.mapColor, CATEGORIES.ENVIRONMENTAL_INCIDENT.icon),
}
const DEFAULT_ICON  = createCategoryIcon('#7f8c8d', '📍')
const CLICKED_ICON  = createCategoryIcon('#3498db', '📍')

function getIconForMarker(marker) {
  const cat = getCategoryByName(marker.category)
  return (cat && CATEGORY_ICONS[cat.id]) ? CATEGORY_ICONS[cat.id] : DEFAULT_ICON
}

function MapBounds({ onOutOfBounds }) {
  const map = useMap()

  useEffect(() => {
    map.setMaxBounds(EL_SALVADOR_BOUNDS)
    map.setMinZoom(8)
    map.setMaxZoom(18)
  }, [map])

  useMapEvents({
    drag() {
      const center = map.getCenter()
      const b = { minLat: 12.8, maxLat: 14.8, minLng: -90.1, maxLng: -87.6 }
      if (
        center.lat < b.minLat || center.lat > b.maxLat ||
        center.lng < b.minLng || center.lng > b.maxLng
      ) {
        onOutOfBounds?.()
      }
    }
  })

  return null
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) { if (onMapClick) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }) },
  })
  return null
}

function MarkerOpener({ markerId, markerRefs }) {
  const map = useMap()
  useEffect(() => {
    if (!markerId) return
    const inst = markerRefs.current[markerId]
    if (inst) setTimeout(() => inst.openPopup(), 700)
  }, [markerId, markerRefs, map])
  return null
}

function MapView({
  onMarkerPlace,
  markers = [],
  flyTarget,
  selectedMarkerId,
  currentUserId,
  onConfirmReport,
  showReportForm,
}) {
  const [clickedLocation, setClickedLocation]     = useState(null)
  const [internalFlyTarget, setInternalFlyTarget] = useState(null)
  const [outOfBoundsMsg, setOutOfBoundsMsg]       = useState(false)
  const activeFlyTarget = flyTarget || internalFlyTarget

  const {
    position: userPosition,
    loading: geoLoading,
    error: geoError,
    getCurrentPosition,
  } = useGeolocation()

  const markerRefs = useRef({})

  // ← FIX: ref al mapa para poder llamar invalidateSize()
  const mapRef = useRef(null)

  // ← FIX: cuando el sidebar abre o cierra, el mapa recalcula su tamaño
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize()
      }, 300)
    }
  }, [showReportForm])

  const handleMapClick = useCallback((loc) => {
    setClickedLocation(loc)
    if (onMarkerPlace) onMarkerPlace(loc)
  }, [onMarkerPlace])

  useEffect(() => {
    if (userPosition) setInternalFlyTarget({ lat: userPosition.lat, lng: userPosition.lng })
  }, [userPosition])

  const handleSearchSelect = useCallback(({ lat, lng }) => {
    setInternalFlyTarget({ lat, lng })
  }, [])

  const handleOutOfBounds = useCallback(() => {
    setOutOfBoundsMsg(true)
    setTimeout(() => setOutOfBoundsMsg(false), 2500)
  }, [])

  return (
    <div className="mapview-container">
      <MapControls
        onLocationSelect={handleSearchSelect}
        onMyLocation={getCurrentPosition}
        geoLoading={geoLoading}
        geoError={geoError}
        showReportForm={showReportForm}
      />

      {outOfBoundsMsg && (
        <div className="map-out-of-bounds">
          EcoMap solo opera dentro de El Salvador.
        </div>
      )}

      {/* ← FIX: ref={mapRef} para acceder a la instancia de Leaflet */}
      <MapContainer
        center={EL_SALVADOR_CENTER}
        zoom={9}
        className="mapview"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapBounds onOutOfBounds={handleOutOfBounds} />
        <MapFlyTo position={activeFlyTarget} zoom={14} />
        <MapClickHandler onMapClick={handleMapClick} />
        <UserLocationMarker position={userPosition} />
        <MarkerOpener markerId={selectedMarkerId} markerRefs={markerRefs} />

        {clickedLocation && (
          <Marker position={[clickedLocation.lat, clickedLocation.lng]} icon={CLICKED_ICON}>
            <Popup>
              <div className="popup-content">
                <p className="popup-label">Ubicación seleccionada</p>
                <p>{clickedLocation.lat.toFixed(5)}, {clickedLocation.lng.toFixed(5)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {markers.map((marker) => {
          const cat         = getCategoryByName(marker.category)
          const displayPos  = cat?.applyPrivacy
            ? approximateLocation(marker)
            : { lat: marker.lat, lng: marker.lng }
          const circleRadiusM = getPrivacyRadius(marker)

          return (
            <React.Fragment key={marker.id}>
              {circleRadiusM > 0 && (
                <Circle
                  center={[displayPos.lat, displayPos.lng]}
                  radius={circleRadiusM}
                  pathOptions={{
                    color:       cat?.color ?? '#7f8c8d',
                    fillColor:   cat?.color ?? '#7f8c8d',
                    fillOpacity: 0.07,
                    weight:      1.5,
                    dashArray:   '5 5',
                  }}
                />
              )}

              <Marker
                position={[displayPos.lat, displayPos.lng]}
                icon={getIconForMarker(marker)}
                ref={(r) => { if (r) markerRefs.current[marker.id] = r }}
              >
                <Popup minWidth={230}>
                  <ReportPopupLeaflet
                    marker={marker}
                    cat={cat}
                    currentUserId={currentUserId}
                    onConfirmReport={onConfirmReport}
                  />
                </Popup>
              </Marker>
            </React.Fragment>
          )
        })}
      </MapContainer>

      {clickedLocation && (
        <div className="map-info">
          <p>Ubicación seleccionada</p>
          <p>Lat: {clickedLocation.lat.toFixed(6)}</p>
          <p>Lng: {clickedLocation.lng.toFixed(6)}</p>
        </div>
      )}
    </div>
  )
}

function ReportPopupLeaflet({ marker, cat, currentUserId, onConfirmReport }) {
  const color = cat?.color ?? '#7f8c8d'

  const [localCount, setLocalCount]   = useState(marker.confirmationCount ?? 0)
  const [confirmed,  setConfirmed]    = useState(false)
  const [confirming, setConfirming]   = useState(false)
  const [confirmErr, setConfirmErr]   = useState(null)

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
    } catch (err) {
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

export default MapView
