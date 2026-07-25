// WelcomeModal — aparece una sola vez a visitantes nuevos sin cuenta
// Usa localStorage para recordar que ya fue visto

import React, { useState, useEffect } from 'react'
import '../styles/components/WelcomeModal.css'

const STORAGE_KEY = 'ecomap_welcomed'

function WelcomeModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Solo mostrar si nunca han visto el modal
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Pequeño delay para que no aparezca antes de que cargue el mapa
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="wm-overlay" role="dialog" aria-modal="true" aria-label="Bienvenida a EcoMap">
      <div className="wm-card">

        {/* Encabezado */}
        <div className="wm-header">
          <span className="wm-globe">🌎</span>
          <div>
            <h2 className="wm-title">¡Hola, bienvenido a EcoMap!</h2>
            <p className="wm-subtitle">Juntos por un El Salvador más limpio</p>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="wm-body">
          <p className="wm-intro">
            EcoMap es una plataforma ciudadana donde cualquier persona puede
            reportar problemas ambientales en El Salvador — desde basureros
            clandestinos hasta ríos contaminados — directamente en el mapa.
          </p>

          <div className="wm-features">
            <div className="wm-feature">
              <span className="wm-feature-icon">📍</span>
              <div>
                <strong>Reporta en segundos</strong>
                <p>Toca el mapa, elige la categoría y describe el problema.</p>
              </div>
            </div>
            <div className="wm-feature">
              <span className="wm-feature-icon">📷</span>
              <div>
                <strong>Adjunta una foto</strong>
                <p>Una imagen vale más que mil palabras — toma la foto desde la misma app.</p>
              </div>
            </div>
            <div className="wm-feature">
              <span className="wm-feature-icon">👥</span>
              <div>
                <strong>La comunidad confirma</strong>
                <p>Otros usuarios pueden validar tus reportes para darles más peso.</p>
              </div>
            </div>
          </div>

          <p className="wm-cta">
            Para reportar necesitas una cuenta — es gratis y toma menos de un minuto.
          </p>
        </div>

        {/* Acciones */}
        <div className="wm-actions">
          <a href="/register" className="wm-btn-register" onClick={handleClose}>
            Crear cuenta gratis
          </a>
          <button className="wm-btn-explore" onClick={handleClose}>
            Solo quiero explorar el mapa
          </button>
        </div>

      </div>
    </div>
  )
}

export default WelcomeModal
