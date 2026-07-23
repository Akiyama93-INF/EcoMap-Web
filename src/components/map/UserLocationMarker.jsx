// Marcador azul de la ubicación actual del usuario
// Actualizado:
//   - Doble pulso animado para mejor visibilidad
//   - Usa variables CSS para respetar dark mode

import React from 'react'
import { Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'

const userLocationIcon = L.divIcon({
  className: '',
  html: `<div class="user-location-icon">
    <div class="user-location-pulse"></div>
    <div class="user-location-pulse user-location-pulse--delay"></div>
    <div class="user-location-dot"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
})

function UserLocationMarker({ position }) {
  if (!position) return null

  return (
    <>
      <Marker position={[position.lat, position.lng]} icon={userLocationIcon}>
        <Popup>
          <div>
            <strong>Tu ubicación actual</strong>
            {position.accuracy && (
              <p style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>
                Precisión: ±{Math.round(position.accuracy)} m
              </p>
            )}
          </div>
        </Popup>
      </Marker>

      {position.accuracy && position.accuracy > 50 && (
        <Circle
          center={[position.lat, position.lng]}
          radius={position.accuracy}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.08,
            weight: 1,
          }}
        />
      )}
    </>
  )
}

export default UserLocationMarker