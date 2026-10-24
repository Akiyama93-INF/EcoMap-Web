import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import useAnalyticsReports from '../hooks/useAnalyticsReports'
import { buildAnalytics, formatDate, getScope, reportsCSV, STATUS_LABELS } from '../utils/analytics'
import { getReportStatus } from '../utils/reportFilters'
import '../styles/pages/Workspace.css'
import '../styles/pages/Estadisticas.css'

function Breakdown({ title, description, rows, total }) {
  return <section className="surface breakdown">
    <div className="section-heading"><h2>{title}</h2><p>{description}</p></div>
    {rows.length ? <ol className="breakdown-list">{rows.map((row, index) => <li key={row.name}>
      <div className="breakdown-label"><span className="breakdown-rank">{String(index + 1).padStart(2, '0')}</span><span>{row.name}</span><strong>{row.count}</strong><small>{total ? Math.round(row.count / total * 100) : 0}%</small></div>
      <div className="breakdown-track" aria-hidden="true"><span style={{ width: `${total ? row.count / total * 100 : 0}%` }} /></div>
    </li>)}</ol> : <p className="workspace-empty">No hay registros para este desglose.</p>}
  </section>
}
Breakdown.propTypes = { title: PropTypes.string, description: PropTypes.string, rows: PropTypes.arrayOf(PropTypes.object), total: PropTypes.number }

function exportReports(reports) {
  const blob = new Blob([reportsCSV(reports)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = 'ecomap-reportes.csv'; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function Estadisticas() {
  const [scope, setScope] = useState('nacional')
  const [period, setPeriod] = useState('all')
  const { reports, loading, error, isOffline, retry } = useAnalyticsReports()
  const stats = useMemo(() => buildAnalytics(reports, { scope, period }), [reports, scope, period])
  const unavailable = loading || (Boolean(error) && !reports.length)
  const maximum = Math.max(1, ...stats.trend.map((item) => item.count))
  const scopeLabel = scope === 'insa' ? 'Campus INSA' : scope === 'todos' ? 'Todos los ámbitos' : 'El Salvador'
  const nationalTotal = stats.reports.filter((report) => getScope(report) === 'nacional').length
  return <div className="workspace insights-page">
    <header className="workspace-header">
      <div><span className="workspace-kicker">OBSERVATORIO ECOMAP</span><h1>Estadísticas</h1><p>Actividad ciudadana y seguimiento de los reportes.</p></div>
      <button className="ui-button ui-button--secondary" disabled={loading || !stats.total} onClick={() => exportReports(stats.reports)}>Descargar CSV <span aria-hidden="true">↓</span></button>
    </header>
    <div className="insights-toolbar">
      <div className="segmented-control" role="group" aria-label="Ámbito de las estadísticas">{[['nacional', 'Nacional'], ['insa', 'Campus INSA'], ['todos', 'Todos']].map(([value, label]) => <button key={value} aria-pressed={scope === value} onClick={() => setScope(value)}>{label}</button>)}</div>
      <label className="period-control">Periodo<select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">Todo el historial</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="365">Últimos 365 días</option></select></label>
    </div>
    {error && <div className="workspace-notice workspace-notice--error" role="alert">{error} {reports.length > 0 && 'Se conservan los últimos datos disponibles.'}<button className="text-button" onClick={retry}>Reintentar</button></div>}
    {isOffline && <p className="workspace-notice" role="status">Sin conexión. Los datos disponibles pueden no estar actualizados.</p>}
    <div className="insights-context"><span>{scopeLabel}</span><span>{loading ? 'Cargando datos…' : error && !reports.length ? 'Datos no disponibles' : `${stats.total} reportes en el periodo`}</span></div>
    <div className="metric-strip" aria-busy={loading}>{[['Reportes registrados', stats.total, 'En el periodo seleccionado'], ['Pendientes', stats.pending, 'Sin validación comunitaria'], ['Confirmados', stats.confirmed, 'Con respaldo de la comunidad'], ['Resueltos', stats.resolved, 'Marcados como atendidos']].map(([label, value, hint]) => <div className="metric" key={label}><span>{label}</span><strong>{unavailable ? '—' : value}</strong><small>{hint}</small></div>)}</div>
    {error && !reports.length ? <section className="surface insights-empty"><h2>Estadísticas no disponibles</h2><p>Vuelve a intentar la conexión para consultar los datos.</p></section> : !loading && !stats.total ? <section className="surface insights-empty"><span className="workspace-kicker">SIN REGISTROS</span><h2>No hay reportes en esta selección</h2><p>Prueba otro periodo o consulta todos los ámbitos.</p><button className="ui-button ui-button--secondary" onClick={() => { setPeriod('all'); setScope('todos') }}>Ver todo el historial</button></section> : <>
      <div className="insights-primary-grid">
        <section className="surface activity-panel" aria-busy={loading}>
          <div className="section-heading activity-heading"><div><h2>Actividad de reportes</h2><p>{stats.daily ? 'Registros diarios durante los últimos 30 días.' : period === '90' ? 'Registros por mes dentro del periodo.' : 'Registros mensuales. Se muestran los últimos 12 meses.'}</p></div><span className="chart-key"><i /> Registrados</span></div>
          <div className="activity-chart" role="img" aria-label={`Reportes registrados: ${stats.trend.map((item) => `${item.label}: ${item.count}`).join('; ')}`}>
            <div className="chart-scale" aria-hidden="true"><span>{maximum}</span><span>{Math.round(maximum / 2)}</span><span>0</span></div>
            <div className="chart-columns">{stats.trend.map((item, index) => <div className="chart-column" key={item.key} title={`${item.label}: ${item.count} reportes`}><div className="chart-bar-track"><div className="chart-bar" style={{ height: `${item.count / maximum * 100}%` }} /></div><span><span className={index % (stats.daily ? 6 : 2) !== 0 && index !== stats.trend.length - 1 ? 'chart-label-detail' : ''}>{!stats.daily || index % 6 === 0 || index === stats.trend.length - 1 ? item.label : ''}</span></span></div>)}</div>
          </div>
          <details className="chart-data"><summary>Consultar datos del gráfico</summary><div className="chart-data-grid">{stats.trend.map((item) => <div key={item.key}><span>{item.label}</span><strong>{item.count}</strong></div>)}</div></details>
        </section>
        <section className="surface followup-panel"><div className="section-heading"><h2>Seguimiento</h2><p>Estado actual de los reportes del periodo.</p></div><div className="resolution-number">{unavailable ? '—' : `${stats.resolutionRate}%`}</div><p className="resolution-caption">de los reportes están resueltos</p><div className="status-track" aria-hidden="true">{['resolved', 'confirmed', 'pending'].map((status) => <span className={`track-${status}`} key={status} style={{ width: `${stats.total ? stats[status] / stats.total * 100 : 0}%` }} />)}</div><ul className="status-legend">{['resolved', 'confirmed', 'pending'].map((status) => <li key={status}><span><i className={`dot-${status}`} />{STATUS_LABELS[status]}s</span><strong>{unavailable ? '—' : stats[status]}</strong></li>)}</ul><p className="data-note">La resolución es declarada por el autor del reporte.</p></section>
      </div>
      <div className="insights-secondary-grid"><Breakdown title="Tipos de reporte" description="Distribución sobre el total de esta selección." rows={stats.categories} total={stats.total} />{scope === 'insa' ? <section className="surface community-panel"><div className="section-heading"><h2>Participación comunitaria</h2><p>Respaldo recibido por los reportes del campus.</p></div><strong className="community-number">{stats.confirmations}</strong><p className="resolution-caption">confirmaciones recibidas</p><div className="community-detail"><span>Reportes con confirmaciones</span><strong>{stats.backed} de {stats.total}</strong></div><p className="data-note">Una confirmación indica que otra persona ha validado el reporte.</p></section> : <Breakdown title={scope === 'todos' ? 'Reportes por ámbito' : 'Departamentos registrados'} description={scope === 'todos' ? 'Distribución entre el mapa nacional y el campus.' : 'Solo se utiliza el departamento guardado en cada reporte.'} rows={scope === 'todos' ? stats.scopes : stats.departments} total={scope === 'todos' ? stats.total : nationalTotal} />}</div>
      <section className="surface recent-panel"><div className="section-heading"><h2>Últimos reportes</h2><p>Consulta el contexto de los registros más recientes.</p></div><div className="report-table"><div className="report-table-head"><span>Reporte</span><span>Ámbito</span><span>Estado</span><span>Fecha</span></div>{stats.recent.map((report) => <Link className="report-table-row" key={report.id} to={`/${getScope(report)}?reportId=${encodeURIComponent(report.id)}`}><span className="report-table-main"><strong>{report.category || 'Sin categoría'}</strong><span>{report.description || 'Sin descripción'}</span></span><span className="report-table-scope">{getScope(report) === 'insa' ? 'INSA' : 'Nacional'}</span><span className={`report-state report-state--${getReportStatus(report)}`}>{STATUS_LABELS[getReportStatus(report)]}</span><time>{formatDate(report.createdAt)}</time></Link>)}</div></section>
    </>}
    <footer className="insights-footnote">{stats.undated > 0 && `${stats.undated} registros sin fecha se incluyen en el total histórico, pero no en el gráfico. `}Los filtros de periodo utilizan la fecha de creación. Las cifras describen los reportes registrados en EcoMap.</footer>
  </div>
}
