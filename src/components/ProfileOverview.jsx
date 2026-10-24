import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import UserAvatar from './UserAvatar'
import { filterOwnReports, formatDate, getScope, STATUS_LABELS, summarizeReports } from '../utils/analytics'
import { getReportStatus } from '../utils/reportFilters'
import '../styles/pages/Workspace.css'
import '../styles/pages/Profile.css'

export default function ProfileOverview({ account, editor, photo, activity, session, accountError }) {
  const [tab, setTab] = useState('activity')
  const [filters, setFilters] = useState({ status: 'all', scope: 'todos', search: '' })
  const [limit, setLimit] = useState(10)
  const summary = useMemo(() => summarizeReports(activity.reports), [activity.reports])
  const filtered = useMemo(() => filterOwnReports(activity.reports, filters), [activity.reports, filters])
  const changeFilter = (key, value) => { setFilters((previous) => ({ ...previous, [key]: value })); setLimit(10) }
  const disabled = editor.saving || photo.busy
  return <div className="workspace account-page">
    <header className="workspace-header"><div><span className="workspace-kicker">TU ESPACIO EN ECOMAP</span><h1>Mi perfil</h1><p>Gestiona tu cuenta y consulta tus contribuciones.</p></div><Link to="/nacional" className="ui-button ui-button--secondary">Explorar el mapa <span aria-hidden="true">↗</span></Link></header>
    <div className="account-layout">
      <aside className="surface account-identity" aria-label="Tu cuenta">
        <div className="account-avatar"><UserAvatar name={account.name} size={80} photoURL={photo.previewUrl || account.photoURL} /></div>
        <h2>{account.name || 'Mi cuenta'}</h2><p className="account-email">{account.email}</p>
        {account.createdAt && <p className="account-since">En EcoMap desde {formatDate(account.createdAt)}</p>}
        <label className={`account-photo-picker${disabled ? ' is-disabled' : ''}`}>Cambiar fotografía<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Cambiar fotografía" onChange={(event) => { photo.onSelect(event.target.files?.[0]); event.target.value = '' }} disabled={disabled} /></label>
        <p className="account-photo-help">JPG, PNG o WebP. Hasta 5 MB.</p>
        {photo.fileName && <div className="account-photo-review"><p>{photo.fileName}</p><div><button className="ui-button" onClick={photo.onSave} disabled={disabled}>{photo.busy ? 'Guardando…' : 'Guardar foto'}</button><button className="text-button" onClick={photo.onCancel} disabled={disabled}>Cancelar</button></div></div>}
        {photo.error && <p className="workspace-inline-error" role="alert">{photo.error}</p>}
        <div className="account-identity-footer"><span>Tu actividad es pública.</span><p>El correo identifica tu cuenta de acceso.</p><button className="account-signout" onClick={session.onLogout} disabled={session.busy || disabled}>{session.busy ? 'Cerrando sesión…' : 'Cerrar sesión'}</button>{session.error && <p role="alert" className="workspace-inline-error">{session.error}</p>}</div>
      </aside>
      <div className="account-content">
        <div className="account-tabs" role="tablist" aria-label="Secciones del perfil">{[['activity', 'Mi actividad'], ['settings', 'Ajustes de cuenta']].map(([key, label]) => <button key={key} role="tab" id={`tab-${key}`} aria-selected={tab === key} aria-controls={`panel-${key}`} tabIndex={tab === key ? 0 : -1} onKeyDown={(event) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 'activity' : event.key === 'End' ? 'settings' : tab === 'activity' ? 'settings' : 'activity'; setTab(next); document.getElementById(`tab-${next}`)?.focus() } }} onClick={() => setTab(key)}>{label}</button>)}</div>
        {accountError && <p className="workspace-notice workspace-notice--error" role="alert">{accountError}</p>}
        <section id="panel-activity" role="tabpanel" aria-labelledby="tab-activity" hidden={tab !== 'activity'}>
          <div className="account-metrics">{[['Reportes enviados', summary.total], ['Resueltos', summary.resolved], ['Confirmaciones recibidas', summary.confirmations]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{activity.loading || activity.error ? '—' : value}</strong></div>)}</div>
          <section className="surface account-history">
            <div className="section-heading account-history-heading"><div><h2>Mis reportes</h2><p>El seguimiento de lo que has compartido.</p></div>{!activity.loading && !activity.error && <span className="quiet-count">{filtered.length} de {activity.reports.length}</span>}</div>
            <div className="account-history-controls"><label className="account-search"><span className="sr-only">Buscar mis reportes</span><input type="search" placeholder="Buscar en mis reportes" value={filters.search} onChange={(event) => changeFilter('search', event.target.value)} /></label><label><span className="sr-only">Estado de mis reportes</span><select value={filters.status} onChange={(event) => changeFilter('status', event.target.value)} aria-label="Estado de mis reportes"><option value="all">Todos los estados</option>{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label><span className="sr-only">Ámbito de mis reportes</span><select value={filters.scope} onChange={(event) => changeFilter('scope', event.target.value)} aria-label="Ámbito de mis reportes"><option value="todos">Todos los ámbitos</option><option value="nacional">Nacional</option><option value="insa">Campus INSA</option></select></label></div>
            {activity.loading ? <p className="workspace-empty" role="status">Cargando tus reportes…</p> : activity.error ? <div className="workspace-empty" role="alert"><p>{activity.error}</p><button className="ui-button ui-button--secondary" onClick={activity.onRetry}>Reintentar</button></div> : !filtered.length ? <div className="workspace-empty"><h3>{activity.reports.length ? 'No hay coincidencias' : 'Aún no has creado reportes'}</h3><p>{activity.reports.length ? 'Prueba otra búsqueda o cambia los filtros.' : 'Cuando identifiques un problema, puedes registrarlo en el mapa y darle seguimiento aquí.'}</p>{activity.reports.length ? <button className="text-button" onClick={() => { setFilters({ status: 'all', scope: 'todos', search: '' }); setLimit(10) }}>Limpiar filtros</button> : <Link className="ui-button ui-button--secondary" to="/nacional">Ir al mapa</Link>}</div> : <>
              <ul className="account-report-list">{filtered.slice(0, limit).map((report) => <li key={report.id}><Link className="account-report-link" to={`/${getScope(report)}?reportId=${encodeURIComponent(report.id)}`}><div className="account-report-thumbnail">{report.imageUrl ? <img src={report.imageUrl} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} /> : <span aria-hidden="true">↗</span>}</div><div className="account-report-copy"><div className="account-report-title"><h3>{report.category || 'Reporte'}</h3><span className={`report-state report-state--${getReportStatus(report)}`}>{STATUS_LABELS[getReportStatus(report)]}</span></div><p>{report.description || 'Sin descripción'}</p><div className="account-report-meta"><span>{getScope(report) === 'insa' ? 'Campus INSA' : 'Nacional'}</span><time>{formatDate(report.createdAt)}</time></div></div><span className="account-report-arrow" aria-hidden="true">↗</span></Link></li>)}</ul>
              {filtered.length > limit && <button className="account-load-more text-button" onClick={() => setLimit((value) => value + 10)}>Mostrar más reportes ({filtered.length - limit})</button>}
            </>}
          </section>
        </section>
        <section id="panel-settings" className="surface account-settings" role="tabpanel" aria-labelledby="tab-settings" hidden={tab !== 'settings'}>
          <div className="section-heading"><h2>Información de la cuenta</h2><p>El nombre y la fotografía se muestran junto a tus reportes y comentarios.</p></div>
          <form onSubmit={editor.onSubmit}><div className="account-form-field"><label htmlFor="profile-name">Nombre público</label><input id="profile-name" type="text" autoComplete="name" value={editor.draftName} onChange={(event) => editor.onNameChange(event.target.value)} minLength={2} maxLength={80} required disabled={disabled} /><p>Usa un nombre que la comunidad pueda reconocer.</p></div><div className="account-form-field"><label htmlFor="profile-email">Correo electrónico</label><input id="profile-email" type="email" value={account.email || ''} readOnly /><p>El correo está asociado a tu método de inicio de sesión.</p></div>{editor.error && <p className="workspace-inline-error" role="alert">{editor.error}</p>}{editor.success && <p className="workspace-inline-success" role="status">{editor.success}</p>}<div className="account-form-actions"><button className="ui-button" type="submit" disabled={disabled || editor.draftName.trim() === account.name || editor.draftName.trim().length < 2}>{editor.saving ? 'Guardando…' : 'Guardar cambios'}</button><button className="text-button" type="button" disabled={disabled || editor.draftName === account.name} onClick={() => editor.onNameChange(account.name)}>Descartar</button></div></form>
        </section>
      </div>
    </div>
  </div>
}
ProfileOverview.propTypes = { account: PropTypes.object.isRequired, editor: PropTypes.object.isRequired, photo: PropTypes.object.isRequired, activity: PropTypes.object.isRequired, session: PropTypes.object.isRequired, accountError: PropTypes.string }
