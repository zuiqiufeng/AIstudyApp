const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

test('mock UI content contains the core page payloads', () => {
  const filePath = path.join(__dirname, '../../static/mock-ui-content.json')
  const raw = fs.readFileSync(filePath, 'utf8')
  const payload = JSON.parse(raw)

  const requiredKeys = [
    'home',
    'hot',
    'knowledge',
    'detail',
    'mine',
    'favorites',
    'history'
  ]

  for (const key of requiredKeys) {
    assert.ok(payload[key], `missing mock content section: ${key}`)
  }

  assert.ok(Array.isArray(payload.home.hotList), 'home.hotList should be an array')
  assert.ok(Array.isArray(payload.hot.list), 'hot.list should be an array')
  assert.ok(Array.isArray(payload.knowledge.list), 'knowledge.list should be an array')
  assert.equal(payload.home.title, '', 'home.title should be blank so the homepage does not show the old headline copy')
})
