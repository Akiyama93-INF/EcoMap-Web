// Estadisticas.jsx — v3
// Panel de estadísticas de reportes por categoría, estado y zona

import React, { useMemo } from 'react'
import useReports from '../hooks/useReports'
import { CATEGORIES_ARRAY, getCategoryByName } from '../utils/categories'
import Loading from '../components/Loading'
import '../styles/pages/Estadisticas.css'

// Departamentos de El Salvador con sus bounding boxes aproximadas
const DEPARTAMENTOS = [
  { nombre: 'Ahuachapán',    minLat: 13.75, maxLat: 14.10, minLng: -90.10, maxLng: -89.75 },
  { nombre: 'Santa Ana',     minLat: 13.85, maxLat: 14.35, minLng: -89.95, maxLng: -89.45 },
  { nombre: 'Sonsonate',     minLat: 13.55, maxLat: 13.95, minLng: -89.85, maxLng: -89.45 },
  { nombre: 'Chalatenango',  minLat: 13.90, maxLat: 14.45, minLng: -89.45, maxLng: -88.80 },
  { nombre: 'La Libertad',   minLat: 13.45, maxLat: 13.95, minLng: -89.55, maxLng: -89.05 },
  { nombre: 'San Salvador',  minLat: 13.60, maxLat: 13.85, minLng: -89.25, maxLng: -89.00 },
  { nombre: 'Cuscatlán',     minLat: 13.65, maxLat: 13.95, minLng: -89.10, maxLng: -88.80 },
  { nombre: 'La Paz',        minLat: 13.35, maxLat: 13.70, minLng: -89.10, maxLng: -88.65 },
  { nombre: 'Cabañas',       minLat: 13.75, maxLat: 14.10, minLng: -89.00, maxLng: -88.45 },
  { nombre: 'San Vicente',   minLat: 13.45, maxLat: 13.80, minLng: -88.85, maxLng: -88.40 },
  { nombre: 'Usulután',      minLat: 13.15, maxLat: 13.60, minLng: -88.65, maxLng: -87.95 },
  { nombre: 'San Miguel',    minLat: 13.25, maxLat: 13.80, minLng: -88.45, maxLng: -87.95 },
  { nombre: 'Morazán',       minLat: 13.55, maxLat: 14.00, minLng: -88.25, maxLng: -87.75 },
  { nombre: 'La Unión',      minLat: 13.15, maxLat: 13.75, minLng: -87.95, maxLng: -87.60 },
]

function getDepartamento(lat, lng) {
  return DEPARTAMENTOS.find(
    (d) => lat >= d.minLat && lat <= d.maxLat && lng >= d.minLng && lng <= d.maxLng
  )?.nombre ?? 'Sin zona'
}

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

function Estadisticas() {
  const { reports, loading } = useReports()

  const stats = useMemo(() => {
    const total     = reports.length
    const pendiente = reports.filter((r) => !r.status || r.status === 'pending').length
    const confirmado = reports.filter((r) => r.status === 'confirmed').length
    const resuelto  = reports.filter((r) => r.status === 'resolved').length

    // Por categoría
    const porCategoria = CATEGORIES_ARRAY.map((cat) => {
      const count = reports.filter((r) => r.category === cat.name).length
      return { ...cat, count }
    }).filter((c) => c.count > 0).sort((a, b) => b.count - a.count)

    const maxCat = porCategoria[0]?.count ?? 1

    // Por departamento
    const conteoDepto = {}
    reports.forEach((r) => {
      const depto = getDepartamento(r.lat, r.lng)
      conteoDepto[depto] = (conteoDepto[depto] ?? 0) + 1
    })

    const porDepto = Object.entries(conteoDepto)
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count)

    const maxDepto = porDepto[0]?.count ?? 1

    // Más confirmaciones
    const masConfirmado = [...reports].sort(
      (a, b) => (b.confirmationCount ?? 0) - (a.confirmationCount ?? 0)
    )[0] ?? null

    return { total, pendiente, confirmado, resuelto, porCategoria, maxCat, porDepto, maxDepto, masConfirmado }
  }, [reports])

  if (loading) return <Loading message="Cargando estadísticas..." />

  const tasaResolucion = stats.total > 0
    ? Math.round((stats.resuelto / stats.total) * 100)
    : 0

  return (
    <div className="est-page">
      <div className="est-container">

        <div className="est-header">
          <h1 className="est-titulo">Panel de Estadísticas</h1>
          <p className="est-subtitulo">Resumen de reportes ambientales en El Salvador</p>
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

          {/* Reportes por categoría */}
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

          {/* Reportes por departamento */}
          <div className="est-panel">
            <h2 className="est-panel-titulo">Reportes por departamento</h2>
            {stats.porDepto.length === 0 ? (
              <p className="est-vacio">Sin datos aún.</p>
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
                <span className="est-destacado-cat">{stats.masConfirmado.category}</span>
                <p className="est-destacado-desc">
                  {stats.masConfirmado.description
                    ? stats.masConfirmado.description.substring(0, 100) +
                      (stats.masConfirmado.description.length > 100 ? '...' : '')
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