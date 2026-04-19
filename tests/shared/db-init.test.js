const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

test('db_init.json contains the MVP business collections', () => {
  const filePath = path.join(__dirname, '../../uniCloud-aliyun/database/db_init.json')
  const raw = fs.readFileSync(filePath, 'utf8')
  const payload = JSON.parse(raw)

  const requiredKeys = [
    'article_hot',
    'article_knowledge',
    'user_checkin',
    'user_favorite',
    'user_view_history'
  ]

  for (const key of requiredKeys) {
    assert.ok(Object.prototype.hasOwnProperty.call(payload, key), `missing collection: ${key}`)
  }
})
