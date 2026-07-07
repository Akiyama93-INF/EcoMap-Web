// Botón de "Mi Ubicación"
// Solicita geolocalización y notifica al mapa padre

import React from 'react'
import '../../styles/components/LocationButton.css'

function LocationButton({ onClick, loading, error }) {
  return (
    <div className="location-btn-wrapper">
      <button
        className={`location-btn ${loading ? 'loading' : ''}`}
        onClick={onClick}
        disabled={loading}
        title="Ir a mi ubicación"
        aria-label="Centrar mapa en mi ubicación"
      >
        {loading ? (
          <span className="location-btn-spinner" aria-hidden="true" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        )}
        <span>{loading ? 'Buscando...' : 'Mi ubicación'}</span>
      </button>

      {error && (
        <div className="location-btn-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

export default LocationButton
