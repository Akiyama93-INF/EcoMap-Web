// Contenedor de controles del mapa: SearchBar y LocationButton
// Se renderiza sobre el mapa como overlay

import React from 'react'
import SearchBar from './SearchBar'
import LocationButton from './LocationButton'
import '../../styles/components/MapControls.css'

function MapControls({ onLocationSelect, onMyLocation, geoLoading, geoError }) {
  return (
    <div className="map-controls">
      <SearchBar onLocationSelect={onLocationSelect} />
      <LocationButton
        onClick={onMyLocation}
        loading={geoLoading}
        error={geoError}
      />
    </div>
  )
}

export default MapControls
