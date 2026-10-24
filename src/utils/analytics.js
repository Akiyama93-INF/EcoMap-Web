import { getReportStatus } from './reportFilters.js'

export const STATUS_LABELS = { pending: 'Pendiente', confirmed: 'Confirmado', resolved: 'Resuelto' }
export const getScope = (report) => report.scope === 'insa' ? 'insa' : 'nacional'
export const getConfirmations = (report) => report.confirmationCount ?? report.confirmations?.length ?? 0

export function reportDate(value) {
  if (value == null) return null
  const date = value.toDate ? value.toDate() : value instanceof Date ? value : typeof value.seconds === 'number' ? new Date(value.seconds * 1000) : new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

export const formatDate = (value) => {
  const date = reportDate(value)
  return date ? date.toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/El_Salvador' }) : 'Fecha no disponible'
}

const dayKey = (date) => new Date(date.getTime() - 6 * 3600000).toISOString().slice(0, 10)
const localMidnight = (key) => new Date(`${key}T00:00:00-06:00`)
const addDays = (date, days) => new Date(date.getTime() + days * 86400000)

export function summarizeReports(reports) {
  const counts = { pending: 0, confirmed: 0, resolved: 0 }
  let confirmations = 0
  let backed = 0
  for (const report of reports) { counts[getReportStatus(report)]++; confirmations += getConfirmations(report); if (getConfirmations(report) > 0) backed++ }
  return { total: reports.length, ...counts, confirmations, backed, resolutionRate: reports.length ? Math.round(counts.resolved / reports.length * 100) : 0 }
}

export function buildAnalytics(reports, { scope = 'todos', period = 'all', now = new Date() } = {}) {
  const today = localMidnight(dayKey(now))
  const start = period === 'all' ? null : addDays(today, 1 - Number(period))
  const filtered = reports.filter((report) => {
    if (scope !== 'todos' && getScope(report) !== scope) return false
    const date = reportDate(report.createdAt)
    if (date && date > now) return false
    return !start || (date && date >= start)
  })
  const summary = summarizeReports(filtered)
  const grouped = (keyFor) => {
    const map = new Map()
    for (const report of filtered) {
      const name = keyFor(report)
      if (name) map.set(name, (map.get(name) || 0) + 1)
    }
    return [...map].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'))
  }
  const categories = grouped((report) => report.category || 'Sin categoría')
  // Only use a recorded department: bounding rectangles overlap and are not reliable boundaries.
  const departments = grouped((report) => getScope(report) === 'nacional' ? (typeof report.department === 'string' && report.department.trim()) || 'Sin departamento registrado' : null)
  const scopes = grouped((report) => getScope(report) === 'insa' ? 'Campus INSA' : 'Nacional')
  const daily = period === '30'
  const keys = []
  if (daily) for (let i = 29; i >= 0; i--) keys.push(dayKey(addDays(today, -i)))
  else {
    const month = dayKey(now).slice(0, 7)
    const count = period === '90' ? 4 : 12
    const [year, number] = month.split('-').map(Number)
    for (let i = count - 1; i >= 0; i--) keys.push(new Date(Date.UTC(year, number - 1 - i, 1)).toISOString().slice(0, 7))
  }
  const trend = keys.map((key) => ({ key, count: 0, label: daily ? new Date(`${key}T12:00:00-06:00`).toLocaleDateString('es-SV', { day: 'numeric', month: 'short', timeZone: 'America/El_Salvador' }) : new Date(`${key}-15T12:00:00-06:00`).toLocaleDateString('es-SV', { month: 'short', year: '2-digit', timeZone: 'America/El_Salvador' }) }))
  for (const report of filtered) {
    const date = reportDate(report.createdAt)
    if (!date) continue
    const key = dayKey(date).slice(0, daily ? 10 : 7)
    const bucket = trend.find((item) => item.key === key)
    if (bucket) bucket.count++
  }
  const recent = [...filtered].sort((a, b) => (reportDate(b.createdAt)?.getTime() || 0) - (reportDate(a.createdAt)?.getTime() || 0)).slice(0, 5)
  return { ...summary, reports: filtered, categories, departments, scopes, trend, daily, recent, undated: filtered.filter((report) => !reportDate(report.createdAt)).length }
}

export function filterOwnReports(reports, { status = 'all', scope = 'todos', search = '' } = {}) {
  const query = search.trim().toLocaleLowerCase('es')
  return reports.filter((report) => (status === 'all' || getReportStatus(report) === status) && (scope === 'todos' || getScope(report) === scope) && (!query || `${report.description || ''} ${report.category || ''}`.toLocaleLowerCase('es').includes(query)))
    .sort((a, b) => (reportDate(b.createdAt)?.getTime() || 0) - (reportDate(a.createdAt)?.getTime() || 0))
}

export function reportsCSV(reports) {
  const cell = (value) => {
    const text = String(value ?? '')
    const safe = /^\s*[=+@-]|^[\t\r]/.test(text) ? "'" + text : text
    return `"${safe.replaceAll('"', '""')}"`
  }
  const rows = [['Categoría', 'Descripción', 'Ámbito', 'Estado actual', 'Fecha'], ...reports.map((report) => [report.category, report.description, getScope(report) === 'insa' ? 'INSA' : 'Nacional', STATUS_LABELS[getReportStatus(report)], formatDate(report.createdAt)])]
  return '\uFEFF' + rows.map((row) => row.map(cell).join(',')).join('\r\n')
}
