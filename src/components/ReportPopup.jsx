import PropTypes from 'prop-types'
// ReportPopup — v3.4.0
// Cambios vs v3.3:
//   - Barra de respaldo visual (foto / ubicación / confirmaciones)
//   - Estado con contexto temporal ("Confirmado · hace 3 días")
//   - Indicador de antigüedad del reporte
//   - Jerarquía visual mejorada en el cuerpo

import React, { useState, useEffect, useRef } from 'react'
import { getReportStatus } from '../utils/reportFilters'
import { getCategoryByName } from '../utils/categories'
import { firestoreService } from '../firebase/firestoreService'
import '../styles/components/ReportPopup.css'

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  color: '#f39c12', bg: '#fef9e7', border: '#f39c12' },
  confirmed: { label: 'Confirmado', color: '#27ae60', bg: '#e8f8f0', border: '#27ae60' },
  resolved:  { label: 'Resuelto',   color: '#2980b9', bg: '#eaf4fb', border: '#2980b9' },
}

function getStatus(report) {
  return STATUS_CONFIG[getReportStatus(report)] ?? STATUS_CONFIG.pending
}

function tiempoRelativo(date) {
  if (!date) return null
  const diff = Date.now() - date.getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 2)   return 'hace un momento'
  if (mins < 60)  return `hace ${mins} min`
  if (hours < 24) return `hace ${hours} h`
  if (days === 1) return 'ayer'
  if (days < 30)  return `hace ${days} días`
  const months = Math.floor(days / 30)
  if (months < 12) return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`
  const years = Math.floor(months / 12)
  return `hace ${years} ${years === 1 ? 'año' : 'años'}`
}

function useReverseGeocode(lat, lng, scope) {
  const [direccion, setDireccion] = useState('Cargando dirección...')

  useEffect(() => {
    if (scope === 'insa') {
      setDireccion('Campus del Instituto Nacional de Santa Ana')
      return
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setDireccion(null)
      return
    }

    setDireccion('Cargando dirección...')
    let cancelado = false
    const controller = new AbortController()

    const fetchDireccion = async () => {
      try {
        const url =
          `https://nominatim.openstreetmap.org/reverse` +
          `?lat=${lat}&lon=${lng}&format=json&accept-language=es&zoom=16`

        const res = await fetch(url, {
          headers: { 'Accept-Language': 'es' },
          signal: controller.signal,
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

    return () => { cancelado = true; controller.abort() }
  }, [lat, lng, scope])

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

// ── Barra de respaldo ────────────────────────────────────────────────────────
function RespaldoBar({ hasImage, confirmCount }) {
  const items = [
    {
      active: hasImage,
      icon:   hasImage ? '📷' : '📷',
      label:  hasImage ? 'Con fotografía' : 'Sin fotografía',
    },
    {
      active: true,
      icon:   '📍',
      label:  'Ubicación registrada',
    },
    {
      active: confirmCount > 0,
      icon:   '👥',
      label:  confirmCount > 0
        ? `${confirmCount} ${confirmCount === 1 ? 'confirmación' : 'confirmaciones'}`
        : 'Sin confirmaciones',
    },
  ]

  return (
    <div className="rp-respaldo">
      {items.map((item, i) => (
        <div
          key={i}
          className={`rp-respaldo-item ${item.active ? 'rp-respaldo-item--active' : 'rp-respaldo-item--inactive'}`}
        >
          <span className="rp-respaldo-icon">{item.icon}</span>
          <span className="rp-respaldo-label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function ReportPopup({ report, onClose, currentUserId, currentUser, onUpdateStatus, embedded = false }) {

  const cat    = getCategoryByName(report.category)
  const color  = cat?.color ?? '#7f8c8d'
  const status = getStatus(report)
  const isOwner = currentUserId && currentUserId === report.userId

  const fechaDate = report.createdAt?.toDate ? report.createdAt.toDate() : null
  const fechaLarga = fechaDate
    ? fechaDate.toLocaleDateString('es-SV', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    : 'Fecha no disponible'
  const fechaRelativa = fechaDate ? tiempoRelativo(fechaDate) : null

  const confirmCount = report.confirmationCount ?? report.confirmations?.length ?? 0
  const hasImage = Boolean(report.imageUrl)

  const subtypeLabels = (cat?.subtypes ?? [])
    .filter((s) => (report.subtypes ?? []).includes(s.id))
    .map((s) => ({ ...s }))

  const direccion = useReverseGeocode(report.lat, report.lng, report.scope)

  // ── Comentarios ──────────────────────────────────────────────────────────
  const [confirmingResolve, setConfirmingResolve] = useState(false)
  const [comentarios, setComentarios]     = useState([])
  const [textoNuevo, setTextoNuevo]       = useState('')
  const [enviando, setEnviando]           = useState(false)
  const [errorEnvio, setErrorEnvio]       = useState(null)
  const cardRef = useRef(null)
  const [resolving, setResolving] = useState(false)
  const [resolveError, setResolveError] = useState(null)
  const [commentsError, setCommentsError] = useState(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const scroller = embedded ? cardRef.current?.closest('.sidebar-content') : null
    const previousScroll = scroller?.scrollTop ?? 0
    if (scroller) scroller.scrollTop = 0
    if (!embedded) document.body.style.overflow = 'hidden'
    cardRef.current?.focus({ preventScroll: true })
    const handleKeys = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current() }
      if (embedded || event.key !== 'Tab') return
      const focusable = Array.from(cardRef.current?.querySelectorAll('button:not(:disabled), a[href], textarea:not(:disabled), input:not(:disabled), [tabindex="0"]') || []).filter((element) => element.getClientRects().length)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first) { event.preventDefault(); return }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === cardRef.current)) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === cardRef.current)) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeys)
    return () => {
      document.removeEventListener('keydown', handleKeys)
      if (!embedded) document.body.style.overflow = previousOverflow
      if (scroller) scroller.scrollTop = previousScroll
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [embedded])

  useEffect(() => {
    const unsub = firestoreService.subscribeToComments(
      report.id,
      (data) => setComentarios(data),
      () => setCommentsError('No se pudieron cargar los comentarios. Vuelve a abrir el reporte para reintentar.')
    )
    return () => unsub()
  }, [report.id])



  const handleEnviarComentario = async () => {
    const texto = textoNuevo.trim()
    if (texto.length < 3 || !currentUserId || enviando) return
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
    <div className={embedded ? 'rp-embedded' : 'rp-overlay'} onClick={embedded ? undefined : onClose} role={embedded ? 'region' : 'dialog'} aria-label="Detalle del reporte" aria-modal={embedded ? undefined : true}>
      <div className="rp-card" ref={cardRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        {embedded && <button className="rp-back" onClick={onClose}>← Volver a los reportes</button>}

        {/* Encabezado */}
        <div className="rp-header" style={{ backgroundColor: color }}>
          <div className="rp-header-content">
            <span className="rp-icon">{cat?.icon ?? '📍'}</span>
            <div>
              <p className="rp-type">Reporte ambiental</p>
              <h3 className="rp-category">{report.category}</h3>
              {fechaRelativa && (
                <p className="rp-header-fecha">{fechaRelativa}</p>
              )}
            </div>
          </div>
          <button className="rp-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        {/* Imagen */}
        {hasImage && (
          <div className="rp-img-wrapper">
            <img src={report.imageUrl} alt="Fotografía del reporte" className="rp-img" />
          </div>
        )}

        {/* Barra de respaldo */}
        <RespaldoBar hasImage={hasImage} confirmCount={confirmCount} />

        {/* Cuerpo */}
        <div className="rp-body">

          {/* Estado + acción de resolución */}
          <div className="rp-status-row">
            <div className="rp-status-left">
              <span
                className="rp-status-badge"
                style={{ color: status.color, backgroundColor: status.bg, borderColor: status.border }}
              >
                {getReportStatus(report) === 'pending'   && '🕐'}
                {getReportStatus(report) === 'confirmed' && '✅'}
                {getReportStatus(report) === 'resolved'  && '🔵'}
                {' '}{status.label}
              </span>
              {/* Contexto del estado */}
              <span className="rp-status-context">
                {getReportStatus(report) === 'confirmed' && confirmCount > 0 &&
                  `Validado por ${confirmCount} ${confirmCount === 1 ? 'persona' : 'personas'}`
                }
                {getReportStatus(report) === 'pending' &&
                  'Esperando validación comunitaria'
                }
                {getReportStatus(report) === 'resolved' &&
                  'Problema resuelto'
                }
              </span>
            </div>

            {isOwner && report.status !== 'resolved' && (
              confirmingResolve ? (
                <div className="rp-resolve-confirm">
                  <span className="rp-resolve-confirm-text">¿Marcar como resuelto?</span>
                  <button
                    className="rp-resolve-btn rp-resolve-btn--yes"
                    disabled={resolving}
                    onClick={async () => {
                      if (resolving) return
                      setResolving(true)
                      setResolveError(null)
                      try {
                        await onUpdateStatus(report.id, 'resolved')
                        setConfirmingResolve(false)
                      } catch {
                        setResolveError('No se pudo actualizar el estado. Intenta de nuevo.')
                      } finally {
                        setResolving(false)
                      }
                    }}
                  >
                    {resolving ? 'Guardando...' : 'Sí, resuelto'}
                  </button>
                  <button
                    className="rp-resolve-btn rp-resolve-btn--no"
                    disabled={resolving}
                    onClick={() => setConfirmingResolve(false)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  className="rp-resolve-btn"
                  onClick={() => setConfirmingResolve(true)}
                >
                  Marcar resuelto
                </button>
              )
            )}
          </div>

          {resolveError && <p className="error-message" role="alert">{resolveError}</p>}

          {/* Descripción */}
          <section className="rp-section">
            <h4>Descripción</h4>
            <p>{report.description || 'Sin descripción'}</p>
          </section>

          {/* Materiales — solo Punto ecológico */}
          {subtypeLabels.length > 0 && (
            <section className="rp-section">
              <h4>{cat?.id === 'punto_ecologico' ? 'Materiales aceptados' : 'Detalles del problema'}</h4>
              <div className="rp-subtypes">
                {subtypeLabels.map((s) => (
                  <span key={s.id} className="rp-subtype-chip" style={{ borderColor: color, color: cat.mapColor }}>
                    {s.icon} {s.label}
                  </span>
                ))}
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
              <span className="rp-meta-value" title={fechaLarga}>📅 {fechaRelativa ?? fechaLarga}</span>
            </div>

            <div className="rp-meta-item rp-meta-full">
              <span className="rp-meta-label">
                {report.scope === 'insa' ? 'Ubicación en el campus' : 'Dirección aproximada'}
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
                {report.scope === 'insa' ? `Plano: ${Math.round(report.lat)}, ${Math.round(report.lng)}` : `${report.lat?.toFixed(4)}, ${report.lng?.toFixed(4)}`}
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

            {commentsError && <p className="rp-comment-error" role="alert">{commentsError}</p>}
            {!commentsError && comentarios.length === 0 ? (
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

              </div>
            )}

            {currentUserId ? (
              <div className="rp-comment-form">
                <textarea
                  className="rp-comment-input"
                  placeholder="Escribe un comentario..."
                  aria-label="Escribe un comentario"
                  value={textoNuevo}
                  onChange={(e) => setTextoNuevo(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  maxLength={500}
                  disabled={enviando}
                />
                <div className="rp-comment-meta">
                  {errorEnvio && <p className="rp-comment-error">{errorEnvio}</p>}
                  <span
                    className="rp-comment-counter"
                    style={{ color: textoNuevo.length >= 480 ? 'var(--text-danger, #e74c3c)' : 'var(--text-muted)' }}
                  >
                    {textoNuevo.length}/500
                  </span>
                </div>
                <button
                  className="rp-comment-submit"
                  onClick={handleEnviarComentario}
                  disabled={enviando || textoNuevo.trim().length < 3}
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
ComentarioItem.propTypes = {
  comentario: PropTypes.object.isRequired,
  currentUserId: PropTypes.string,
  reportId: PropTypes.string,
  color: PropTypes.string,
}

RespaldoBar.propTypes = {
  hasImage: PropTypes.bool,
  confirmCount: PropTypes.number,
}

ReportPopup.propTypes = {
  report: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  currentUserId: PropTypes.string,
  currentUser: PropTypes.object,
  onUpdateStatus: PropTypes.func,
  embedded: PropTypes.bool,
}
