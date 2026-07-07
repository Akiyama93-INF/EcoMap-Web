// MarkerList — Fase 4
// Añadido:
//   - Badge de estado por ítem (Pendiente / Confirmado / Resuelto)
//   - Recuperada estructura marker-item-stripe y marker-item-body

import React, { useState } from 'react'
import { getCategoryByName, CATEGORIES_ARRAY } from '../utils/categories'
import '../styles/components/MarkerList.css'

function MarkerList({ markers = [], onMarkerSelect }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = activeFilter === 'all'
    ? markers
    : markers.filter((m) => {
        const cat = getCategoryByName(m.category)
        return cat?.reportType === activeFilter
      })

  return (
    <div className="marker-list">
      <div className="marker-list-header">
        <h3 className="marker-list-title">
          Reportes
          <span className="marker-list-count">{filtered.length}</span>
        </h3>

        {/* Filtro rápido */}
        <div className="marker-filter">
          <button
            className={`filter-btn${activeFilter === 'all' ? ' active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Todos
          </button>
          {CATEGORIES_ARRAY.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn${activeFilter === cat.reportType ? ' active' : ''}`}
              style={activeFilter === cat.reportType ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
              onClick={() => setActiveFilter(cat.reportType)}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="no-markers">
          {markers.length === 0 ? 'No hay reportes disponibles' : 'No hay reportes en esta categoría'}
        </p>
      ) : (
        <ul>
          {filtered.map((marker) => {
            const cat   = getCategoryByName(marker.category)
            const color = cat?.color ?? '#7f8c8d'
            const icon  = cat?.icon  ?? '📍'
            const confirmCount = marker.confirmationCount ?? marker.confirmations?.length ?? 0

            const fecha = marker.createdAt?.toDate
              ? marker.createdAt.toDate().toLocaleDateString('es-SV', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
              : null

            const subtypeLabels = (cat?.subtypes ?? [])
              .filter((s) => (marker.subtypes ?? []).includes(s.id))
              .slice(0, 3)

            return (
              <li
                key={marker.id}
                onClick={() => onMarkerSelect?.(marker)}
                className="marker-item"
                title="Haz clic para ver en el mapa"
              >
                <div className="marker-item-stripe" style={{ backgroundColor: color }} />

                <div className="marker-item-body">
                  <div className="marker-item-header">
                    <span className="marker-item-badge" style={{ backgroundColor: color + '22', color }}>
                      {icon} {marker.category}
                    </span>
                    <div className="marker-item-right">
                      {confirmCount > 0 && (
                        <span className="marker-item-confirms" title={`${confirmCount} confirmaciones`}>
                          ✅ {confirmCount}
                        </span>
                      )}
                      <span className={`marker-status-badge marker-status-${marker.status ?? 'pending'}`}>
                        {(marker.status === 'pending' || !marker.status) && 'Pendiente'}
                        {marker.status === 'confirmed' && 'Confirmado'}
                        {marker.status === 'resolved'  && 'Resuelto'}
                      </span>
                    </div>
                  </div>

                  <p className="marker-item-desc">
                    {marker.description
                      ? marker.description.substring(0, 60) + (marker.description.length > 60 ? '...' : '')
                      : 'Sin descripción'}
                  </p>

                  {subtypeLabels.length > 0 && (
                    <div className="marker-item-subtypes">
                      {subtypeLabels.map((s) => (
                        <span key={s.id} className="marker-subtype-chip">{s.icon} {s.label}</span>
                      ))}
                      {(cat?.subtypes ?? []).filter((s) => (marker.subtypes ?? []).includes(s.id)).length > 3 && (
                        <span className="marker-subtype-chip">
                          +{(cat?.subtypes ?? []).filter((s) => (marker.subtypes ?? []).includes(s.id)).length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="marker-item-footer">
                    <small>👤 {marker.userName ?? 'Anónimo'}</small>
                    {fecha && <small>📅 {fecha}</small>}
                  </div>
                </div>

                <div className="marker-item-arrow">›</div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default MarkerList