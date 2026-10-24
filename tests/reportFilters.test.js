import test from 'node:test'
import assert from 'node:assert/strict'
import { filterReports, getReportStatus } from '../src/utils/reportFilters.js'
import { CATEGORIES } from '../src/utils/categories.js'

const filters = { category: 'all', status: 'all', search: '', sortBy: 'fecha' }
const reports = [
  { id: 'campus', category: CATEGORIES.INSA_TRASH.name, status: 'active', description: 'Patio norte', createdAt: { toMillis: () => 1 } },
  { id: 'confirmed', category: CATEGORIES.CLANDESTINE_DUMP.name, status: 'active', department: 'Santa Ana', confirmations: ['user'], createdAt: { toMillis: () => 2 } },
  { id: 'resolved', category: CATEGORIES.CLANDESTINE_DUMP.name, status: 'resolved', confirmationCount: 3, createdAt: { toMillis: () => 3 } },
]

test('combines status, category and search without modifying the source', () => {
  const result = filterReports(reports, { ...filters, status: 'confirmed', category: CATEGORIES.CLANDESTINE_DUMP.id, search: 'santa ana' })
  assert.deepEqual(result.map((report) => report.id), ['confirmed'])
  assert.deepEqual(reports.map((report) => report.id), ['campus', 'confirmed', 'resolved'])
})

test('includes the institutional category and legacy active status', () => {
  assert.deepEqual(filterReports(reports, { ...filters, status: 'pending', category: CATEGORIES.INSA_TRASH.id }).map((report) => report.id), ['campus'])
  assert.equal(getReportStatus({}), 'pending')
  assert.equal(getReportStatus({ status: 'confirmed' }), 'confirmed')
  assert.equal(getReportStatus(reports[2]), 'resolved')
})

test('sorts timestamps and confirmation arrays and handles empty results', () => {
  assert.deepEqual(filterReports(reports, filters).map((report) => report.id), ['resolved', 'confirmed', 'campus'])
  assert.deepEqual(filterReports(reports, { ...filters, sortBy: 'confirmaciones' }).map((report) => report.id), ['resolved', 'confirmed', 'campus'])
  assert.deepEqual(filterReports(reports, { ...filters, search: 'sin coincidencias' }), [])
  assert.deepEqual(filterReports([], filters), [])
})

test('all stored status formats belong to exactly one displayed state', () => {
  const cases = [
    [{}, 'pending'],
    [{ status: 'active', confirmationCount: 0 }, 'pending'],
    [{ status: 'pending', confirmations: ['user'] }, 'confirmed'],
    [{ status: 'active', confirmationCount: 2 }, 'confirmed'],
    [{ status: 'confirmed' }, 'confirmed'],
    [{ status: 'resolved', confirmationCount: 5 }, 'resolved'],
  ]
  for (const [report, expected] of cases) assert.equal(getReportStatus(report), expected)
  const sample = cases.map(([report], index) => ({ ...report, id: index }))
  const counts = ['pending', 'confirmed', 'resolved'].map((status) => filterReports(sample, { ...filters, status }).length)
  assert.deepEqual(counts, [2, 3, 1])
  assert.equal(counts.reduce((sum, count) => sum + count, 0), sample.length)
})
