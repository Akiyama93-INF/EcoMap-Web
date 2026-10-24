import { getCategoryByName } from './categories.js'

export function getReportStatus(report) {
  if (report.status === 'resolved') return 'resolved'
  if (report.status === 'confirmed') return 'confirmed'
  if ((report.confirmationCount ?? report.confirmations?.length ?? 0) > 0) return 'confirmed'
  return 'pending'
}

export function filterReports(reports, filters) {
  const query = filters.search.trim().toLocaleLowerCase('es')
  return reports.filter((report) => {
    if (filters.status !== 'all' && getReportStatus(report) !== filters.status) return false
    if (filters.category !== 'all' && getCategoryByName(report.category)?.id !== filters.category) return false
    return !query || [report.description, report.category, report.userName, report.department]
      .filter(Boolean).join(' ').toLocaleLowerCase('es').includes(query)
  }).sort((a, b) => filters.sortBy === 'confirmaciones'
    ? (b.confirmationCount ?? b.confirmations?.length ?? 0) - (a.confirmationCount ?? a.confirmations?.length ?? 0)
    : (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
}
