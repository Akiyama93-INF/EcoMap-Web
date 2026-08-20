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
    <div
      className="wm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida a EcoMap"
    >
      <div className="wm-card">

        {/* Encabezado */}
        <div className="wm-header">
          <span className="wm-globe">🌎</span>

          <div>
            <h2 className="wm-title">
              ¡Hola, bienvenido a EcoMap!
            </h2>

            <p className="wm-subtitle">
              Juntos por un El Salvador más limpio
            </p>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="wm-body">
          <div className="wm-features">

            {/* Paso 1 */}
            <div className="wm-feature">
              <span className="wm-feature-icon">📍</span>

              <div>
                <strong>1. Elige dónde ocurre</strong>

                <p>
                Toca el mapa en el lugar del problema o presiona{' '}
                <span className="wm-highlight">“Usar mi ubicación”</span>{' '}
                para marcarlo automáticamente.
              </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="wm-feature">
              <span className="wm-feature-icon">📝</span>

              <div>
                <strong>2. Describe el problema</strong>

                <p>
                  Selecciona una categoría, explica qué ocurre y,
                  si quieres, agrega una fotografía como evidencia.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="wm-feature">
              <span className="wm-feature-icon">👥</span>

              <div>
                <strong>3. Ayuda a la comunidad</strong>

                <p>
                  Envía tu reporte y permite que otros usuarios lo
                  consulten y confirmen si el problema sigue presente.
                </p>
              </div>
            </div>

          </div>

          {/* Aviso */}
          <p className="wm-cta">
            💡 <strong>Para reportar necesitas una cuenta</strong> —
            es gratis y toma menos de un minuto.
          </p>

        </div>

        {/* Acciones */}
        <div className="wm-actions">

          <a
            href="/register"
            className="wm-btn-register"
            onClick={handleClose}
          >
            Crear cuenta gratis
          </a>

          <button
            className="wm-btn-explore"
            onClick={handleClose}
          >
            Solo quiero explorar el mapa
          </button>

        </div>

      </div>
    </div>
  )
}

export default WelcomeModal