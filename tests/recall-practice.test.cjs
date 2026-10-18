const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/utils/recallPractice.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const loaded = { exports: {} }
new Function('module', 'exports', source)(loaded, loaded.exports)
const { recallItems, checkRecall } = loaded.exports

test('full-width input, separators and repeated answers normalize without inflating scores', () => {
  assert.deepEqual(recallItems('Ａpple，APPLE\n苹果、苹果；桥梁'), ['apple', '苹果', '桥梁'])
  assert.deepEqual(checkRecall(['apple', '苹果', '桥梁'], 'APPLE 苹果 苹果'), {
    correct: ['apple', '苹果'], missing: ['桥梁'], extra: [],
  })
})

test('unseen items count as extra; synonyms are not silently graded as exact matches', () => {
  assert.deepEqual(checkRecall(['月亮', '火车', '雨伞'], '月亮 列车 飞机'), {
    correct: ['月亮'], missing: ['火车', '雨伞'], extra: ['列车', '飞机'],
  })
})

test('empty input produces no recalled items', () => {
  assert.deepEqual(recallItems(' \n ，；'), [])
  assert.deepEqual(checkRecall(['桥梁'], ''), { correct: [], missing: ['桥梁'], extra: [] })
})
