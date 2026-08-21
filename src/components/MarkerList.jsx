// MarkerList — v3.4.1
// Añadido:
//   - Estado selectedId: al presionar un item, se aplica la clase
//     marker-item--selected durante 1.5 s para feedback visual (glow verde).
//   - onMarkerSelect se llama igual que antes — sin cambios en la API.

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { getCategoryByName, CATEGORIES_ARRAY } from '../utils/categories'
import '../styles/components/MarkerList.css'

const APP_URL = 'https://ecomapwebproyect.netlify.app'

function buildWhatsAppLink(marker) {
  const cat  = getCategoryByName(marker.category)
  const icon = cat?.icon ?? '📍'

  const rawDesc  = marker.description || 'Sin descripción'
  const desc     = rawDesc.length > 120 ? rawDesc.substring(0, 120) + '...' : rawDesc
  const confirms = marker.confirmationCount ?? marker.confirmations?.length ?? 0
  const fecha = marker.createdAt?.toDate
    ? marker.createdAt.toDate().toLocaleDateString('es-SV', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null

  const link = `${APP_URL}/?reportId=${marker.id}`

  const lines = [
    `${icon} *Reporte EcoMap*`,
    `*Categoría:* ${marker.category}`,
    marker.department ? `*Departamento:* ${marker.department}` : null,
    `*Descripción:* ${desc}`,
    confirms > 0 ? `✅ *${confirms} confirmación${confirms !== 1 ? 'es' : ''}*` : null,
    fecha ? `📅 ${fecha}` : null,
    `*Ver reporte:* ${link}`,
  ].filter(Boolean).join('\n')

  return `https://wa.me/?text=${encodeURIComponent(lines)}`
}

function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="ml-highlight">{part}</mark>
          : part
      )}
    </>
  )
}

function MarkerList({ markers = [], onMarkerSelect }) {
  const [activeFilter,  setActiveFilter]  = useState('all')
  const [sortBy,        setSortBy]        = useState('fecha')
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  // ID del item que acaba de ser seleccionado (para el glow temporal)
  const [selectedId,    setSelectedId]    = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (
        e.key === '/' &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setSearchQuery('')
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    inputRef.current?.focus()
  }, [])

  const countById = useMemo(() => {
    const counts = {}
    markers.forEach((m) => {
      const cat = getCategoryByName(m.category)
      if (cat?.id) counts[cat.id] = (counts[cat.id] ?? 0) + 1
    })
    return counts
  }, [markers])

  const filtered = useMemo(() => {
    let base = activeFilter === 'all'
      ? markers
      : markers.filter((m) => {
          const cat = getCategoryByName(m.category)
          return cat?.id === activeFilter
        })

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      base = base.filter((m) => {
        const haystack = [
          m.description ?? '',
          m.category    ?? '',
          m.userName    ?? '',
          m.department  ?? '',
        ].join(' ').toLowerCase()
        return haystack.includes(q)
      })
    }

    return [...base].sort((a, b) => {
      if (sortBy === 'confirmaciones') {
        const ca = a.confirmationCount ?? a.confirmations?.length ?? 0
        const cb = b.confirmationCount ?? b.confirmations?.length ?? 0
        return cb - ca
      }
      const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0)
      const db = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0)
      return db - da
    })
  }, [markers, activeFilter, sortBy, searchQuery])

  const isSearching = searchQuery.trim().length > 0

  // Al presionar un item: aplica glow temporal + llama al handler del padre
  const handleItemClick = useCallback((marker) => {
    setSelectedId(marker.id)
    onMarkerSelect?.(marker)
    setTimeout(() => setSelectedId(null), 1500)
  }, [onMarkerSelect])

  return (
    <div className="marker-list">
      <div className="marker-list-header">

        <h3 className="marker-list-title">
          Reportes
          <span className="marker-list-count">
            {isSearching
              ? <>{filtered.length} <span className="ml-count-of">de {markers.length}</span></>
              : filtered.length
            }
          </span>
        </h3>

        <div className={`ml-search-wrapper${searchFocused ? ' ml-search-wrapper--focused' : ''}`}>
          <svg className="ml-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="ml-search-input"
            placeholder="Buscar por descripción, categoría, usuario…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Buscar reportes"
          />
          {isSearching ? (
            <button
              className="ml-search-clear"
              onClick={clearSearch}
              aria-label="Limpiar búsqueda"
              title="Limpiar"
            >
              ×
            </button>
          ) : (
            <span className="ml-search-hint" aria-hidden="true">/</span>
          )}
        </div>

        <div className="marker-filter">
          <button
            className={`filter-btn${activeFilter === 'all' ? ' active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Todos
            {markers.length > 0 && (
              <span className="filter-btn-count">{markers.length}</span>
            )}
          </button>
          {CATEGORIES_ARRAY.filter((cat) => (countById[cat.id] ?? 0) > 0).map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn${activeFilter === cat.id ? ' active' : ''}`}
              style={activeFilter === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
              onClick={() => setActiveFilter(cat.id)}
              title={cat.name}
            >
              {cat.icon}
              <span className="filter-btn-count">{countById[cat.id]}</span>
            </button>
          ))}
        </div>

        <div className="marker-sort">
          <span className="marker-sort-label">Ordenar:</span>
          <button
            className={`sort-btn${sortBy === 'fecha' ? ' active' : ''}`}
            onClick={() => setSortBy('fecha')}
          >
            Más reciente
          </button>
          <button
            className={`sort-btn${sortBy === 'confirmaciones' ? ' active' : ''}`}
            onClick={() => setSortBy('confirmaciones')}
          >
            Confirmaciones
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ml-empty">
          {isSearching ? (
            <>
              <span className="ml-empty-icon">🔍</span>
              <p className="ml-empty-msg">Sin resultados para <strong>"{searchQuery}"</strong></p>
              <button className="ml-empty-clear" onClick={clearSearch}>Limpiar búsqueda</button>
            </>
          ) : (
            <>
              <span className="ml-empty-icon">🗺️</span>
              <p className="ml-empty-msg">
                {markers.length === 0 ? 'No hay reportes disponibles' : 'No hay reportes en esta categoría'}
              </p>
            </>
          )}
        </div>
      ) : (
        <ul>
          {filtered.map((marker) => {
            const cat   = getCategoryByName(marker.category)
            const color = cat?.color ?? '#7f8c8d'
            const icon  = cat?.icon  ?? '📍'
            const confirmCount = marker.confirmationCount ?? marker.confirmations?.length ?? 0
            const q = searchQuery.trim()
            const isSelected = selectedId === marker.id

            const fecha = marker.createdAt?.toDate
              ? marker.createdAt.toDate().toLocaleDateString('es-SV', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
              : null

            const subtypeLabels = (cat?.subtypes ?? [])
              .filter((s) => (marker.subtypes ?? []).includes(s.id))
              .slice(0, 3)

            const descRaw = marker.description
              ? marker.description.substring(0, 60) + (marker.description.length > 60 ? '...' : '')
              : 'Sin descripción'

            return (
              <li
                key={marker.id}
                className={`marker-item${isSelected ? ' marker-item--selected' : ''}`}
                title="Haz clic para ver en el mapa"
              >
                <div
                  className="marker-item-stripe"
                  style={{ backgroundColor: color }}
                  onClick={() => handleItemClick(marker)}
                />

                <div className="marker-item-body" onClick={() => handleItemClick(marker)}>
                  <div className="marker-item-header">
                    <span className="marker-item-badge" style={{ backgroundColor: color + '22', color }}>
                      {icon} <Highlight text={marker.category} query={q} />
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
                    <Highlight text={descRaw} query={q} />
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
                    <small>👤 <Highlight text={marker.userName ?? 'Anónimo'} query={q} /></small>
                    {fecha && <small>📅 {fecha}</small>}
                  </div>
                </div>

                <div className="marker-item-actions">
                  <a
                    href={buildWhatsAppLink(marker)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="marker-whatsapp-btn"
                    title="Compartir por WhatsApp"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                  <div className="marker-item-arrow" onClick={() => handleItemClick(marker)}>›</div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default MarkerList