// ReportPopup — v3 + comentarios
// Añadido:
//   - Badge de estado (Pendiente / Confirmado / Resuelto)
//   - Botón para marcar como Resuelto (solo dueño del reporte)
//   - Dirección aproximada via Nominatim reverse geocoding
//   - Sección de comentarios en tiempo real con listener de Firestore

import React, { useState, useEffect, useRef } from 'react'
import { getCategoryByName } from '../utils/categories'
import { firestoreService } from '../firebase/firestoreService'
import '../styles/components/ReportPopup.css'

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  color: '#f39c12', bg: '#fef9e7', border: '#f39c12' },
  confirmed: { label: 'Confirmado', color: '#27ae60', bg: '#e8f8f0', border: '#27ae60' },
  resolved:  { label: 'Resuelto',   color: '#2980b9', bg: '#eaf4fb', border: '#2980b9' },
}

function getStatus(report) {
  return STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending
}

function useReverseGeocode(lat, lng) {
  const [direccion, setDireccion] = useState('Cargando dirección...')

  useEffect(() => {
    if (!lat || !lng) {
      setDireccion(null)
      return
    }

    let cancelado = false

    const fetchDireccion = async () => {
      try {
        const url =
          `https://nominatim.openstreetmap.org/reverse` +
          `?lat=${lat}&lon=${lng}&format=json&accept-language=es&zoom=16`

        const res = await fetch(url, {
          headers: { 'Accept-Language': 'es' },
        })

        if (!res.ok) throw new Error('Respuesta no válida')

        const data = await res.json()

        if (cancelado) return

        const addr = data.address ?? {}

        const partes = [
          addr.road ?? addr.pedestrian ?? addr.footway ?? null,
          addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? null,
          addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? null,
          addr.state ?? null,
        ].filter(Boolean)

        setDireccion(partes.length > 0 ? partes.join(', ') : 'Dirección no disponible')
      } catch {
        if (!cancelado) setDireccion('Dirección no disponible')
      }
    }

    fetchDireccion()

    return () => { cancelado = true }
  }, [lat, lng])

  return direccion
}

function ComentarioItem({ comentario, currentUserId, reportId, color }) {
  const [eliminando, setEliminando] = useState(false)
  const esPropio = currentUserId && currentUserId === comentario.userId

  const fecha = comentario.createdAt?.toDate
    ? comentario.createdAt.toDate().toLocaleDateString('es-SV', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : ''

  const handleEliminar = async () => {
    if (!window.confirm('¿Eliminar este comentario?')) return
    setEliminando(true)
    try {
      await firestoreService.deleteComment(reportId, comentario.id, currentUserId)
    } catch {
      setEliminando(false)
    }
  }

  const inicial = (comentario.userName ?? 'A')[0].toUpperCase()

  return (
    <div className="rp-comment">
      <div className="rp-comment-avatar" style={{ backgroundColor: color + 'cc' }}>
        {comentario.photoURL
          ? <img src={comentario.photoURL} alt={comentario.userName} className="rp-comment-avatar-img" />
          : inicial
        }
      </div>
      <div className="rp-comment-content">
        <div className="rp-comment-header">
          <span className="rp-comment-author">{comentario.userName ?? 'Anónimo'}</span>
          {fecha && <span className="rp-comment-fecha">{fecha}</span>}
          {esPropio && (
            <button
              className="rp-comment-delete"
              onClick={handleEliminar}
              disabled={eliminando}
              title="Eliminar comentario"
            >
              ×
            </button>
          )}
        </div>
        <p className="rp-comment-text">{comentario.text}</p>
      </div>
    </div>
  )
}

function ReportPopup({ report, onClose, currentUserId, currentUser, onUpdateStatus }) {
  if (!report) return null

  const cat    = getCategoryByName(report.category)
  const color  = cat?.color ?? '#7f8c8d'
  const status = getStatus(report)
  const isOwner = currentUserId && currentUserId === report.userId

  const fecha = report.createdAt?.toDate
    ? report.createdAt.toDate().toLocaleDateString('es-SV', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    : 'Fecha no disponible'

  const confirmCount = report.confirmationCount ?? report.confirmations?.length ?? 0

  const subtypeLabels = (cat?.subtypes ?? [])
    .filter((s) => (report.subtypes ?? []).includes(s.id))
    .map((s) => ({ ...s }))

  const direccion = useReverseGeocode(report.lat, report.lng)

  // ── Comentarios ──────────────────────────────────────────────
  const [comentarios, setComentarios]     = useState([])
  const [textoNuevo, setTextoNuevo]       = useState('')
  const [enviando, setEnviando]           = useState(false)
  const [errorEnvio, setErrorEnvio]       = useState(null)
  const comentariosEndRef                 = useRef(null)

  useEffect(() => {
    const unsub = firestoreService.subscribeToComments(
      report.id,
      (data) => setComentarios(data),
      (err)  => console.error('Comentarios error:', err)
    )
    return () => unsub()
  }, [report.id])

  useEffect(() => {
    comentariosEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comentarios])

  const handleEnviarComentario = async () => {
    const texto = textoNuevo.trim()
    if (!texto || !currentUserId) return
    setEnviando(true)
    setErrorEnvio(null)
    try {
      await firestoreService.addComment(report.id, {
        userId:   currentUserId,
        userName: currentUser?.displayName ?? 'Anónimo',
        photoURL: currentUser?.photoURL ?? null,
        text:     texto,
      })
      setTextoNuevo('')
    } catch {
      setErrorEnvio('No se pudo enviar el comentario. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviarComentario()
    }
  }

  return (
    <div className="rp-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="rp-card" onClick={(e) => e.stopPropagation()}>

        {/* Encabezado */}
        <div className="rp-header" style={{ backgroundColor: color }}>
          <div className="rp-header-content">
            <span className="rp-icon">{cat?.icon ?? '📍'}</span>
            <div>
              <p className="rp-type">Reporte</p>
              <h3 className="rp-category">{report.category}</h3>
            </div>
          </div>
          <button className="rp-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        {/* Imagen */}
        {report.imageUrl && (
          <div className="rp-img-wrapper">
            <img src={report.imageUrl} alt="Fotografía del reporte" className="rp-img" />
          </div>
        )}

        {/* Cuerpo */}
        <div className="rp-body">

          {/* Badge de estado */}
          <div className="rp-status-row">
            <span
              className="rp-status-badge"
              style={{ color: status.color, backgroundColor: status.bg, borderColor: status.border }}
            >
              {report.status === 'pending'   && '🕐'}
              {report.status === 'confirmed' && '✅'}
              {report.status === 'resolved'  && '🔵'}
              {!report.status                && '🕐'}
              {' '}{status.label}
            </span>

            {isOwner && report.status !== 'resolved' && (
              <button
                className="rp-resolve-btn"
                onClick={() => onUpdateStatus?.(report.id, 'resolved')}
              >
                Marcar como resuelto
              </button>
            )}
          </div>

          {/* Descripción */}
          <section className="rp-section">
            <h4>Descripción</h4>
            <p>{report.description || 'Sin descripción'}</p>
          </section>

          {/* Materiales — solo Punto ecológico */}
          {subtypeLabels.length > 0 && (
            <section className="rp-section">
              <h4>Materiales aceptados</h4>
              <div className="rp-subtypes">
                {subtypeLabels.map((s) => (
                  <span key={s.id} className="rp-subtype-chip" style={{ borderColor: color, color: cat.mapColor }}>
                    {s.icon} {s.label}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Confirmaciones */}
          {confirmCount > 0 && (
            <section className="rp-section">
              <h4>Confirmaciones</h4>
              <div className="rp-confirm-count">
                <span className="rp-confirm-badge">✅ {confirmCount}</span>
                <span>
                  {confirmCount === 1
                    ? 'persona confirmó que este reporte sigue siendo válido'
                    : 'personas confirmaron que este reporte sigue siendo válido'}
                </span>
              </div>
            </section>
          )}

          {/* Metadatos */}
          <section className="rp-meta-grid">
            <div className="rp-meta-item">
              <span className="rp-meta-label">Reportado por</span>
              <span className="rp-meta-value">👤 {report.userName ?? 'Anónimo'}</span>
            </div>
            <div className="rp-meta-item">
              <span className="rp-meta-label">Fecha</span>
              <span className="rp-meta-value">📅 {fecha}</span>
            </div>

            <div className="rp-meta-item rp-meta-full">
              <span className="rp-meta-label">
                Dirección aproximada
                {cat?.applyPrivacy && (
                  <span className="rp-privacy-tag" title="Ubicación aproximada">
                    🔒 aprox.
                  </span>
                )}
              </span>
              <span className="rp-meta-value rp-meta-address">
                📍 {direccion}
              </span>
              <span className="rp-meta-coords">
                {report.lat?.toFixed(4)}, {report.lng?.toFixed(4)}
              </span>
            </div>

            <div className="rp-meta-item">
              <span className="rp-meta-label">Categoría</span>
              <span
                className="rp-meta-badge"
                style={{ backgroundColor: color + '22', color }}
              >
                {cat?.icon} {report.category}
              </span>
            </div>
          </section>

          {/* ── Comentarios ───────────────────────────────────── */}
          <section className="rp-section rp-comments-section">
            <h4>
              Comentarios
              {comentarios.length > 0 && (
                <span className="rp-comments-count">{comentarios.length}</span>
              )}
            </h4>

            {comentarios.length === 0 ? (
              <p className="rp-comments-empty">Sin comentarios aún. Sé el primero.</p>
            ) : (
              <div className="rp-comments-list">
                {comentarios.map((c) => (
                  <ComentarioItem
                    key={c.id}
                    comentario={c}
                    currentUserId={currentUserId}
                    reportId={report.id}
                    color={color}
                  />
                ))}
                <div ref={comentariosEndRef} />
              </div>
            )}

            {currentUserId ? (
              <div className="rp-comment-form">
                <textarea
                  className="rp-comment-input"
                  placeholder="Escribe un comentario..."
                  value={textoNuevo}
                  onChange={(e) => setTextoNuevo(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  maxLength={500}
                  disabled={enviando}
                />
                {errorEnvio && <p className="rp-comment-error">{errorEnvio}</p>}
                <button
                  className="rp-comment-submit"
                  onClick={handleEnviarComentario}
                  disabled={enviando || !textoNuevo.trim()}
                  style={{ backgroundColor: color, borderColor: color }}
                >
                  {enviando ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            ) : (
              <p className="rp-comments-login">Inicia sesión para comentar.</p>
            )}
          </section>
        </div>

        {/* Pie */}
        <div className="rp-footer">
          <button className="rp-btn-close" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

export default ReportPopup