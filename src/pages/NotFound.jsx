// NotFound — 404 con identidad de EcoMap
// Marcador perdido, mapa roto, tono salvadoreño

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/pages/NotFound.css'

// Coordenadas falsas que cambian cada render — efecto de "ubicación perdida"
function randomCoord(min, max) {
  return (Math.random() * (max - min) + min).toFixed(4)
}

function NotFound() {
  const [coords, setCoords] = useState({ lat: '13.6929', lng: '-89.2182' })
  const [blinking, setBlinking] = useState(false)

  // Cada 2s simula que el GPS intenta encontrar la ubicación
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true)
      setTimeout(() => {
        setCoords({
          lat: randomCoord(13.15, 14.45),
          lng: randomCoord(-90.10, -87.60),
        })
        setBlinking(false)
      }, 300)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="nf-container">

      {/* Fondo de cuadrícula estilo mapa */}
      <div className="nf-map-grid" aria-hidden="true">
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} className="nf-grid-cell" />
        ))}
      </div>

      <div className="nf-card">

        {/* Marcador SVG animado */}
        <div className="nf-marker-wrap" aria-hidden="true">
          <div className="nf-pulse" />
          <svg
            className="nf-marker-svg"
            viewBox="0 0 64 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Cuerpo del marcador */}
            <path
              d="M32 4C18.7 4 8 14.7 8 28c0 18 24 48 24 48s24-30 24-48C56 14.7 45.3 4 32 4z"
              fill="var(--primary-color)"
              opacity="0.15"
              stroke="var(--primary-color)"
              strokeWidth="3"
            />
            {/* Signo de interrogación dentro */}
            <text
              x="32"
              y="38"
              textAnchor="middle"
              fontSize="22"
              fontWeight="800"
              fill="var(--primary-color)"
              fontFamily="system-ui, sans-serif"
            >
              ?
            </text>
          </svg>
        </div>

        {/* Código y título */}
        <div className="nf-code" aria-hidden="true">404</div>
        <h1 className="nf-title">Reporte no encontrado</h1>
        <p className="nf-subtitle">
          Este punto no existe en el mapa. La URL puede estar mal escrita
          o el reporte fue eliminado.
        </p>

        {/* Coordenadas falsas parpadeando */}
        <div className={`nf-coords${blinking ? ' nf-coords--blink' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {blinking ? 'Buscando señal GPS...' : `${coords.lat}, ${coords.lng}`}
        </div>

        {/* Acciones */}
        <div className="nf-actions">
          <Link to="/nacional" className="nf-btn nf-btn--primary">
            Ir al mapa nacional
          </Link>
          <Link to="/insa" className="nf-btn nf-btn--secondary">
            Mapa del INSA
          </Link>
        </div>

        {/* Pie */}
        <p className="nf-footer">
          ¿Querías reportar algo?{' '}
          <Link to="/nacional" className="nf-link">Haz clic en el mapa</Link>
          {' '}y ayuda a mantener El Salvador limpio.
        </p>

      </div>
    </div>
  )
}

export default NotFound