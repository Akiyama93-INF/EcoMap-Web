import test from 'node:test'
import assert from 'node:assert/strict'
import { buildAnalytics, filterOwnReports, reportDate, reportsCSV, summarizeReports } from '../src/utils/analytics.js'

const now = new Date('2026-10-24T18:00:00Z')
const reports = [
  { id: 'legacy', category: 'Basura', status: 'active', createdAt: { toDate: () => new Date('2026-09-25T06:00:00Z') } },
  { id: 'old', scope: 'nacional', department: 'Santa Ana', category: 'Basura', status: 'resolved', createdAt: new Date('2026-08-01T12:00:00Z'), confirmations: ['a'] },
  { id: 'campus', scope: 'insa', category: 'Basura botada', status: 'active', confirmationCount: 2, description: 'Patio norte', createdAt: { seconds: Date.parse('2026-10-24T07:00:00Z') / 1000 } },
  { id: 'undated', scope: 'insa', status: 'pending' },
  { id: 'future', scope: 'nacional', createdAt: new Date('2027-01-01') },
]

test('scope totals include legacy national reports and preserve source data', () => {
  const result = buildAnalytics(reports, { scope: 'nacional', now })
  assert.equal(result.total, 2)
  assert.equal(result.pending, 1)
  assert.equal(result.resolved, 1)
  assert.equal(result.resolutionRate, 50)
  assert.equal(reports.length, 5)
})
test('30-day window includes the boundary at midnight in El Salvador', () => {
  const boundary = { id: 'outside', createdAt: new Date('2026-09-25T05:59:59Z') }
  const result = buildAnalytics([...reports, boundary], { period: '30', now })
  assert.deepEqual(result.reports.map((report) => report.id), ['legacy', 'campus'])
  assert.equal(result.trend.length, 30)
  assert.equal(result.trend[0].key, '2026-09-25')
  assert.equal(result.trend.reduce((sum, bucket) => sum + bucket.count, 0), 2)
})
test('all-history totals retain undated reports but not future records', () => {
  const result = buildAnalytics(reports, { now })
  assert.equal(result.total, 4)
  assert.equal(result.undated, 1)
  assert.equal(result.pending + result.confirmed + result.resolved, result.total)
  assert.equal(result.trend.reduce((sum, bucket) => sum + bucket.count, 0), 3)
})
test('departments use recorded data instead of guessing from coordinates', () => {
  const result = buildAnalytics(reports, { scope: 'nacional', now })
  assert.equal(result.departments.find((item) => item.name === 'Sin departamento registrado').count, 1)
  assert.equal(result.departments.find((item) => item.name === 'Santa Ana').count, 1)
  assert.equal(result.departments.reduce((sum, item) => sum + item.count, 0), result.total)
})
test('campus and categories are included and remain separate', () => {
  const result = buildAnalytics(reports, { scope: 'insa', now })
  assert.equal(result.total, 2)
  assert.equal(result.confirmed, 1)
  assert.deepEqual(result.departments, [])
  assert.equal(result.categories.find((item) => item.name === 'Basura botada').count, 1)
})
test('empty data does not produce invalid percentages', () => {
  const result = buildAnalytics([], { period: '365', now })
  assert.equal(result.resolutionRate, 0)
  assert.equal(result.total, 0)
  assert.equal(result.trend.length, 12)
})
test('report dates accept Firestore and native formats and reject invalid dates', () => {
  assert.equal(reportDate(null), null)
  assert.equal(reportDate('invalid'), null)
  assert.equal(reportDate({ seconds: 0 }).getTime(), 0)
  assert.equal(reportDate({ toDate: () => now }).getTime(), now.getTime())
})
test('own report filters combine scope, state and text and sort by date', () => {
  assert.deepEqual(filterOwnReports(reports, { scope: 'insa', status: 'confirmed', search: 'NORTE' }).map((item) => item.id), ['campus'])
  assert.deepEqual(filterOwnReports(reports, { search: 'not-found' }), [])
  const stats = summarizeReports(reports.slice(0, 4))
  assert.equal(stats.confirmations, 3)
  assert.equal(stats.backed, 2)
  assert.equal(stats.pending + stats.confirmed + stats.resolved, stats.total)
})
test('CSV preserves quotes and line breaks and neutralizes spreadsheet formulas', () => {
  const csv = reportsCSV([{ category: 'Basura', description: 'Texto "citado",\nnueva línea' }, { description: ' =HYPERLINK("x")' }])
  assert.ok(csv.startsWith('\uFEFF'))
  assert.ok(csv.includes('"Texto ""citado"",\nnueva línea"'))
  assert.ok(csv.includes('"\' =HYPERLINK(""x"")"'))
  assert.ok(csv.includes('"Nacional","Pendiente"'))
})
