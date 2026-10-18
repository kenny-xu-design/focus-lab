const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function load(file) {
  const filename = path.join(__dirname, '..', file)
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = { exports: {} }
  new Function('module', 'exports', 'require', source)(module, module.exports, require)
  return module.exports
}

const { makeNumberLayout, isNumberLayout, groupRange, numberMetrics, comparableNumberRecords, improvementSummary } = load('src/utils/numberTraining.ts')
const { migrateTrainingArchive, trainingBackup } = load('src/utils/trainingPersistence.ts')

test('both board sizes have complete unique layouts and groups cover the whole board', () => {
  for (const size of [4, 5]) {
    const layout = makeNumberLayout(size)
    assert.equal(layout.length, size * size)
    assert.equal(isNumberLayout(layout), true)
    assert.deepEqual(Array.from({ length: size }, (_, index) => groupRange(index, size)).flat(),
      Array.from({ length: size * size }, (_, index) => index + 1))
  }
  assert.equal(isNumberLayout(Array(16).fill(1)), false)
  assert.equal(isNumberLayout(Array.from({ length: 16 }, (_, index) => index)), false)
})

const score = (id, ms, extra = {}, fields = {}) => ({ id: String(id), participantId: 'person-a', installationId: 'browser-a',
  date: `2026-10-${String(id).padStart(2, '0')}T00:00:00Z`, errors: 0,
  extra: { ...numberMetrics(makeNumberLayout(4), 'search', ms, 'compact:coarse:calm-teal-v1', false), ...extra }, ...fields })

test('progress separates people, browser installs, mode, board size, theme and repeated layouts', () => {
  const valid = score(1, 10000)
  const input = [valid, score(2, 9000, { mode: 'grouped' }), score(3, 9000, { boardSize: 5 }),
    score(4, 9000, { repeatedLayout: true }), score(5, 9000, { environment: 'wide:fine:old-theme' }),
    score(6, 9000, {}, { participantId: 'person-b' }), score(7, 9000, {}, { installationId: 'browser-b' }),
    score(8, NaN), { id: 'legacy', durationSeconds: 12 }]
  assert.deepEqual(comparableNumberRecords(input, 'person-a', 'browser-a', 'search', 4, 'compact:coarse:calm-teal-v1'), [valid])
})

test('improvement uses non-overlapping clean windows; slow or erroneous rounds do not fake gains', () => {
  const scores = [10000, 12000, 11000, 8000, 9000, 10000].map((ms, index) => score(index + 1, ms))
  assert.equal(improvementSummary(scores.slice(0, 5)), null)
  assert.deepEqual(improvementSummary(scores), { baselineMs: 11000, recentMs: 9000, percent: 18.2 })
  assert.equal(improvementSummary([...scores.slice(0, 5), score(6, 1000, {}, { errors: 3 })]), null)
  const slower = [...scores.slice(0, 3), ...[15000, 16000, 17000].map((ms, i) => score(i + 4, ms))]
  assert(improvementSummary(slower).percent < 0)
})

test('v2 archives preserve every old collection and do not invent attribution for old records', () => {
  const old = { records: [{ id: 'old-training' }], gameRecords: [{ id: 'old-game' }],
    plans: [{ id: 'old-plan' }], layoutSnapshots: [{ id: 'old-layout', numbers: makeNumberLayout(5) }] }
  const migrated = migrateTrainingArchive(old)
  for (const key of ['records', 'gameRecords', 'plans', 'layoutSnapshots']) assert.deepEqual(migrated[key], old[key])
  assert.equal(migrated.records[0].participantId, undefined)
  assert(migrated.participant.id)
  assert(migrated.installationId)
  assert.equal(migrateTrainingArchive(migrated).participant.id, migrated.participant.id)
  const exported = JSON.parse(JSON.stringify(trainingBackup(migrated)))
  assert.equal(exported.storageVersion, 3)
  assert.deepEqual(exported.data.records, old.records)
  assert.deepEqual(exported.data.layoutSnapshots, old.layoutSnapshots)
})

test('primary theme text and button labels meet 4.5:1 contrast', () => {
  const luminance = (hex) => {
    const rgb = hex.match(/\w\w/g).map((part) => parseInt(part, 16) / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
  }
  for (const [a, b] of [['173436', 'ffffff'], ['4f6564', 'f1f5f4'], ['ffffff', '125f57'], ['125f57', 'deefea']]) {
    const values = [luminance(a), luminance(b)].sort((a, b) => b - a)
    assert((values[0] + .05) / (values[1] + .05) >= 4.5, `${a}/${b}`)
  }
})
