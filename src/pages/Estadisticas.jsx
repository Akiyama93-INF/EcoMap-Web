// Estadisticas.jsx — v4
// Añadido:
//   - Selector de scope: Nacional / INSA / Todos
//   - Para scope INSA: sección de departamentos reemplazada por zonas del campus
//   - Para scope Todos: ambas secciones, con badge de origen por reporte
//   - Corrección: useReports() recibe el scope activo, no mezcla coordenadas GPS e internas

import React, { useState, useMemo } from 'react'
import useReports from '../hooks/useReports'
import { CATEGORIES_ARRAY, getCategoryByName } from '../utils/categories'
import Loading from '../components/Loading'
import '../styles/pages/Estadisticas.css'

// ── Departamentos de El Salvador ──────────────────────────────────────────────
const DEPARTAMENTOS = [
  { nombre: 'Ahuachapán',   minLat: 13.75, maxLat: 14.10, minLng: -90.10, maxLng: -89.75 },
  { nombre: 'Santa Ana',    minLat: 13.85, maxLat: 14.35, minLng: -89.95, maxLng: -89.45 },
  { nombre: 'Sonsonate',    minLat: 13.55, maxLat: 13.95, minLng: -89.85, maxLng: -89.45 },
  { nombre: 'Chalatenango', minLat: 13.90, maxLat: 14.45, minLng: -89.45, maxLng: -88.80 },
  { nombre: 'La Libertad',  minLat: 13.45, maxLat: 13.95, minLng: -89.55, maxLng: -89.05 },
  { nombre: 'San Salvador', minLat: 13.60, maxLat: 13.85, minLng: -89.25, maxLng: -89.00 },
  { nombre: 'Cuscatlán',    minLat: 13.65, maxLat: 13.95, minLng: -89.10, maxLng: -88.80 },
  { nombre: 'La Paz',       minLat: 13.35, maxLat: 13.70, minLng: -89.10, maxLng: -88.65 },
  { nombre: 'Cabañas',      minLat: 13.75, maxLat: 14.10, minLng: -89.00, maxLng: -88.45 },
  { nombre: 'San Vicente',  minLat: 13.45, maxLat: 13.80, minLng: -88.85, maxLng: -88.40 },
  { nombre: 'Usulután',     minLat: 13.15, maxLat: 13.60, minLng: -88.65, maxLng: -87.95 },
  { nombre: 'San Miguel',   minLat: 13.25, maxLat: 13.80, minLng: -88.45, maxLng: -87.95 },
  { nombre: 'Morazán',      minLat: 13.55, maxLat: 14.00, minLng: -88.25, maxLng: -87.75 },
  { nombre: 'La Unión',     minLat: 13.15, maxLat: 13.75, minLng: -87.95, maxLng: -87.60 },
]

function getDepartamento(lat, lng) {
  return (
    DEPARTAMENTOS.find(
      (d) => lat >= d.minLat && lat <= d.maxLat && lng >= d.minLng && lng <= d.maxLng
    )?.nombre ?? 'Sin zona'
  )
}

// ── Zonas del campus INSA ─────────────────────────────────────────────────────
// Definidas en coordenadas internas del plano (píxeles de imagen 1295×1024).
// División aproximada en 4 cuadrantes + zonas clave.
const ZONAS_INSA = [
  { nombre: 'Talleres (zona norte)',   minLat: 0,   maxLat: 420, minLng: 0,   maxLng: 1295 },
  { nombre: 'Aulas Magna y patios',    minLat: 420, maxLat: 700, minLng: 250, maxLng: 800  },
  { nombre: 'Talleres técnicos (este)',minLat: 100, maxLat: 700, minLng: 800, maxLng: 1295 },
  { nombre: 'Bloque de aulas (sur)',   minLat: 700, maxLat: 1024,minLng: 250, maxLng: 1295 },
  { nombre: 'Acceso y parqueo (oeste)',minLat: 420, maxLat: 1024,minLng: 0,   maxLng: 250  },
]

function getZonaINSA(lat, lng) {
  return (
    ZONAS_INSA.find(
      (z) => lat >= z.minLat && lat <= z.maxLat && lng >= z.minLng && lng <= z.maxLng
    )?.nombre ?? 'Zona no identificada'
  )
}

// ── Subcomponentes UI ─────────────────────────────────────────────────────────
function BarraHorizontal({ valor, maximo, color }) {
  const pct = maximo > 0 ? Math.round((valor / maximo) * 100) : 0
  return (
    <div className="est-barra-bg">
      <div
        className="est-barra-fill"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

function TarjetaStat({ label, valor, sub, color }) {
  return (
    <div className="est-tarjeta" style={{ borderLeftColor: color }}>
      <span className="est-tarjeta-valor" style={{ color }}>{valor}</span>
      <span className="est-tarjeta-label">{label}</span>
      {sub && <span className="est-tarjeta-sub">{sub}</span>}
    </div>
  )
}

// ── Hook de reportes combinados para scope "todos" ────────────────────────────
function useCombinedReports(scope) {
  const nacional = useReports(scope === 'todos' ? 'nacional' : scope)
  const insa     = useReports(scope === 'todos' ? 'insa'     : scope)

  if (scope === 'todos') {
    return {
      reports: [
        ...nacional.reports.map((r) => ({ ...r, _scope: 'nacional' })),
        ...insa.reports.map((r)     => ({ ...r, _scope: 'insa'     })),
      ],
      loading: nacional.loading || insa.loading,
    }
  }

  // scope específico — devolver el hook ya invocado con ese scope
  const source = scope === 'insa' ? insa : nacional
  return {
    reports: source.reports.map((r) => ({ ...r, _scope: scope })),
    loading: source.loading,
  }
}

// ── Componente principal ──────────────────────────────────────────────────────
function Estadisticas() {
  const [scope, setScope] = useState('nacional')
  const { reports, loading } = useCombinedReports(scope)

  const stats = useMemo(() => {
    const total      = reports.length
    const pendiente  = reports.filter((r) => !r.status || r.status === 'pending').length
    const confirmado = reports.filter((r) => r.status === 'confirmed').length
    const resuelto   = reports.filter((r) => r.status === 'resolved').length

    // Por categoría
    const porCategoria = CATEGORIES_ARRAY.map((cat) => {
      const count = reports.filter((r) => r.category === cat.name).length
      return { ...cat, count }
    }).filter((c) => c.count > 0).sort((a, b) => b.count - a.count)

    const maxCat = porCategoria[0]?.count ?? 1

    // Por departamento — solo reportes nacionales
    const reportesNacionales = reports.filter((r) => r._scope === 'nacional')
    const conteoDepto = {}
    reportesNacionales.forEach((r) => {
      const depto = getDepartamento(r.lat, r.lng)
      conteoDepto[depto] = (conteoDepto[depto] ?? 0) + 1
    })
    const porDepto = Object.entries(conteoDepto)
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count)
    const maxDepto = porDepto[0]?.count ?? 1

    // Por zona INSA — solo reportes INSA
    const reportesINSA = reports.filter((r) => r._scope === 'insa')
    const conteoZona = {}
    reportesINSA.forEach((r) => {
      const zona = getZonaINSA(r.lat, r.lng)
      conteoZona[zona] = (conteoZona[zona] ?? 0) + 1
    })
    const porZonaINSA = Object.entries(conteoZona)
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count)
    const maxZona = porZonaINSA[0]?.count ?? 1

    // Reporte más confirmado
    const masConfirmado = [...reports].sort(
      (a, b) => (b.confirmationCount ?? 0) - (a.confirmationCount ?? 0)
    )[0] ?? null

    return {
      total, pendiente, confirmado, resuelto,
      porCategoria, maxCat,
      porDepto, maxDepto,
      porZonaINSA, maxZona,
      masConfirmado,
    }
  }, [reports])

  if (loading) return <Loading message="Cargando estadísticas..." />

  const tasaResolucion = stats.total > 0
    ? Math.round((stats.resuelto / stats.total) * 100)
    : 0

  const mostrarDepto  = scope === 'nacional' || scope === 'todos'
  const mostrarZonas  = scope === 'insa'     || scope === 'todos'

  const subtitulos = {
    nacional: 'Reportes ambientales en El Salvador',
    insa:     'Reportes dentro del Instituto Nacional de Santa Ana',
    todos:    'Vista combinada: EcoMap Nacional + Instituto Nacional de Santa Ana',
  }

  return (
    <div className="est-page">
      <div className="est-container">

        {/* Encabezado */}
        <div className="est-header">
          <h1 className="est-titulo">Panel de Estadísticas</h1>
          <p className="est-subtitulo">{subtitulos[scope]}</p>
        </div>

        {/* Selector de scope */}
        <div className="est-scope-tabs">
          {[
            { key: 'nacional', label: '🌍 EcoMap Nacional' },
            { key: 'insa',     label: '🏫 EcoMap INSA'     },
            { key: 'todos',    label: '📊 Todos'           },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`est-scope-tab${scope === key ? ' active' : ''}`}
              onClick={() => setScope(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tarjetas resumen */}
        <div className="est-tarjetas">
          <TarjetaStat
            label="Total de reportes"
            valor={stats.total}
            color="var(--primary-color)"
          />
          <TarjetaStat
            label="Pendientes"
            valor={stats.pendiente}
            sub={stats.total > 0 ? `${Math.round((stats.pendiente / stats.total) * 100)}%` : '—'}
            color="#f39c12"
          />
          <TarjetaStat
            label="Confirmados"
            valor={stats.confirmado}
            sub={stats.total > 0 ? `${Math.round((stats.confirmado / stats.total) * 100)}%` : '—'}
            color="#27ae60"
          />
          <TarjetaStat
            label="Resueltos"
            valor={stats.resuelto}
            sub={`Tasa de resolución: ${tasaResolucion}%`}
            color="#2980b9"
          />
        </div>

        <div className="est-grid">

          {/* Reportes por categoría — siempre visible */}
          <div className="est-panel">
            <h2 className="est-panel-titulo">Reportes por categoría</h2>
            {stats.porCategoria.length === 0 ? (
              <p className="est-vacio">Sin datos aún.</p>
            ) : (
              <ul className="est-lista">
                {stats.porCategoria.map((cat) => (
                  <li key={cat.id} className="est-fila">
                    <div className="est-fila-info">
                      <span className="est-fila-icon">{cat.icon}</span>
                      <span className="est-fila-nombre">{cat.name}</span>
                      <span className="est-fila-count" style={{ color: cat.color }}>{cat.count}</span>
                    </div>
                    <BarraHorizontal valor={cat.count} maximo={stats.maxCat} color={cat.color} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Reportes por departamento — Nacional y Todos */}
          {mostrarDepto && (
            <div className="est-panel">
              <h2 className="est-panel-titulo">
                {scope === 'todos' ? 'Departamentos (Nacional)' : 'Reportes por departamento'}
              </h2>
              {stats.porDepto.length === 0 ? (
                <p className="est-vacio">Sin datos nacionales aún.</p>
              ) : (
                <ul className="est-lista">
                  {stats.porDepto.map(({ nombre, count }) => (
                    <li key={nombre} className="est-fila">
                      <div className="est-fila-info">
                        <span className="est-fila-nombre">📍 {nombre}</span>
                        <span className="est-fila-count" style={{ color: 'var(--primary-color)' }}>{count}</span>
                      </div>
                      <BarraHorizontal valor={count} maximo={stats.maxDepto} color="var(--primary-color)" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Reportes por zona INSA — INSA y Todos */}
          {mostrarZonas && (
            <div className="est-panel">
              <h2 className="est-panel-titulo">
                {scope === 'todos' ? 'Zonas del campus (INSA)' : 'Reportes por zona del campus'}
              </h2>
              {stats.porZonaINSA.length === 0 ? (
                <p className="est-vacio">Sin datos del campus aún.</p>
              ) : (
                <ul className="est-lista">
                  {stats.porZonaINSA.map(({ nombre, count }) => (
                    <li key={nombre} className="est-fila">
                      <div className="est-fila-info">
                        <span className="est-fila-nombre">🏫 {nombre}</span>
                        <span className="est-fila-count" style={{ color: '#2ecc71' }}>{count}</span>
                      </div>
                      <BarraHorizontal valor={count} maximo={stats.maxZona} color="#2ecc71" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

        </div>

        {/* Reporte más confirmado */}
        {stats.masConfirmado && (stats.masConfirmado.confirmationCount ?? 0) > 0 && (
          <div className="est-panel est-panel-destacado">
            <h2 className="est-panel-titulo">Reporte más confirmado</h2>
            <div className="est-destacado">
              <span className="est-destacado-icon">
                {getCategoryByName(stats.masConfirmado.category)?.icon ?? '📍'}
              </span>
              <div className="est-destacado-info">
                <div className="est-destacado-header">
                  <span className="est-destacado-cat">{stats.masConfirmado.category}</span>
                  {scope === 'todos' && (
                    <span className={`est-scope-badge est-scope-badge--${stats.masConfirmado._scope}`}>
                      {stats.masConfirmado._scope === 'insa' ? '🏫 INSA' : '🌍 Nacional'}
                    </span>
                  )}
                </div>
                <p className="est-destacado-desc">
                  {stats.masConfirmado.description
                    ? stats.masConfirmado.description.substring(0, 120) +
                      (stats.masConfirmado.description.length > 120 ? '...' : '')
                    : 'Sin descripción'}
                </p>
                <span className="est-destacado-confirm">
                  ✅ {stats.masConfirmado.confirmationCount ?? 0} confirmaciones —
                  por {stats.masConfirmado.userName ?? 'Anónimo'}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Estadisticas
