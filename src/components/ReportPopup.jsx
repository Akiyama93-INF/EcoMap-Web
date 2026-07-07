// ReportPopup — Fase 4
// Añadido:
//   - Badge de estado (Pendiente / Confirmado / Resuelto)
//   - Botón para marcar como Resuelto (solo dueño del reporte)

import React from 'react'
import { getCategoryByName } from '../utils/categories'
import '../styles/components/ReportPopup.css'

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  color: '#f39c12', bg: '#fef9e7', border: '#f39c12' },
  confirmed: { label: 'Confirmado', color: '#27ae60', bg: '#e8f8f0', border: '#27ae60' },
  resolved:  { label: 'Resuelto',   color: '#2980b9', bg: '#eaf4fb', border: '#2980b9' },
}

function getStatus(report) {
  return STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending
}

function ReportPopup({ report, onClose, currentUserId, onUpdateStatus }) {
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

            {/* Botón marcar resuelto — solo dueño y si no está resuelto */}
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
            <div className="rp-meta-item">
              <span className="rp-meta-label">
                Coordenadas
                {cat?.applyPrivacy && (
                  <span className="rp-privacy-tag" title="Ubicación aproximada">
                    🔒 aprox.
                  </span>
                )}
              </span>
              <span className="rp-meta-value">
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