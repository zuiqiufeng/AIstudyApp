# AI Workplace Learning Miniapp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Weixin miniapp MVP for workplace AI learning with daily check-in, curated AI hot topics, knowledge articles, favorites, and a lightweight admin publishing workflow.

**Architecture:** Keep the existing `uni-id-pages` authentication stack, replace the demo homepage with a tab-based content shell, and add three custom cloud objects: `ai-growth-co` for check-in, `ai-content-co` for end-user content access, and `ai-admin-co` for privileged content publishing. Store all new business data in dedicated UniCloud collections with a small shared business module for streak, card mapping, and admin-role checks.

**Tech Stack:** `uni-app` (Vue 3 compatible project structure), `uniCloud` cloud objects, `uni-id-pages`, UniCloud database schema JSON files, Node built-in test runner (`node --test`) for pure JS modules.

---

## Preflight

当前项目目录 `D:\Documents\HBuilderProjects\ai学习小程序` 不是 git 仓库。执行本计划前，如果你要按任务粒度提交，请先初始化版本库：

```bash
git -C "D:\Documents\HBuilderProjects\ai学习小程序" init
```

预期结果：输出 `Initialized empty Git repository` 或显示仓库已存在。

## File Structure

### Existing files to modify

- `D:\Documents\HBuilderProjects\ai学习小程序\package.json`
  - 增加 Node 原生测试脚本，避免为了 MVP 引入额外测试框架。
- `D:\Documents\HBuilderProjects\ai学习小程序\pages.json`
  - 增加 tabBar、业务页面路由、管理页路由，并保留 `uni-id-pages` 相关页面。
- `D:\Documents\HBuilderProjects\ai学习小程序\pages\index\index.vue`
  - 从示例首页改造成真实首页，承载签到卡和推荐内容。
- `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\db_init.json`
  - 注册新业务集合。

### New frontend files

- `D:\Documents\HBuilderProjects\ai学习小程序\utils\date.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\utils\content.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\utils\auth.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\services\growth.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\services\content.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\services\admin.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\components\checkin-card.vue`
- `D:\Documents\HBuilderProjects\ai学习小程序\components\article-list-card.vue`
- `D:\Documents\HBuilderProjects\ai学习小程序\components\empty-state.vue`
- `D:\Documents\HBuilderProjects\ai学习小程序\pages\hot\index.vue`
- `D:\Documents\HBuilderProjects\ai学习小程序\pages\knowledge\index.vue`
- `D:\Documents\HBuilderProjects\ai学习小程序\pages\content\detail.vue`
- `D:\Documents\HBuilderProjects\ai学习小程序\pages\mine\index.vue`
- `D:\Documents\HBuilderProjects\ai学习小程序\pages\mine\favorites.vue`
- `D:\Documents\HBuilderProjects\ai学习小程序\pages\mine\history.vue`
- `D:\Documents\HBuilderProjects\ai学习小程序\pages\admin\index.vue`
- `D:\Documents\HBuilderProjects\ai学习小程序\pages\admin\editor.vue`

### New backend files

- `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\common\ai-learning-shared\index.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-growth-co\index.obj.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-content-co\index.obj.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-admin-co\index.obj.js`

### New database schema files

- `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\article_hot.schema.json`
- `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\article_knowledge.schema.json`
- `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\user_checkin.schema.json`
- `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\user_favorite.schema.json`
- `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\user_view_history.schema.json`

### New tests and ops docs

- `D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\db-init.test.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js`
- `D:\Documents\HBuilderProjects\ai学习小程序\docs\operations\content-admin.md`

## Task 1: Add Shared Frontend Utilities and Test Harness

**Files:**
- Modify: `D:\Documents\HBuilderProjects\ai学习小程序\package.json`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\utils\date.js`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\utils\content.js`
- Test: `D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js`

- [ ] **Step 1: Write the failing test**

```js
// D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js
const test = require('node:test')
const assert = require('node:assert/strict')

const { formatDayKey, isSameDay } = require('../../utils/date')
const { buildSummaryText, toDetailQuery } = require('../../utils/content')

test('formatDayKey returns yyyy-mm-dd in local time', () => {
  const value = formatDayKey(new Date('2026-04-18T10:11:12+08:00'))
  assert.equal(value, '2026-04-18')
})

test('isSameDay compares local day keys', () => {
  assert.equal(
    isSameDay('2026-04-18T08:00:00+08:00', '2026-04-18T21:59:59+08:00'),
    true
  )
})

test('buildSummaryText prefers summary and trims whitespace', () => {
  assert.equal(buildSummaryText({ summary: '  AI 热点摘要  ' }), 'AI 热点摘要')
})

test('toDetailQuery builds a stable detail route query string', () => {
  assert.equal(toDetailQuery({ id: 'hot-1', type: 'hot' }), '/pages/content/detail?id=hot-1&type=hot')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js"
```

Expected: FAIL with `Cannot find module '../../utils/date'` or `Cannot find module '../../utils/content'`.

- [ ] **Step 3: Write minimal implementation**

```js
// D:\Documents\HBuilderProjects\ai学习小程序\utils\date.js
function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDayKey(input = new Date()) {
  const date = new Date(input)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function isSameDay(left, right) {
  return formatDayKey(left) === formatDayKey(right)
}

module.exports = {
  formatDayKey,
  isSameDay
}
```

```js
// D:\Documents\HBuilderProjects\ai学习小程序\utils\content.js
function buildSummaryText(article = {}) {
  return (article.summary || article.intro || '').trim()
}

function toDetailQuery({ id, type }) {
  return `/pages/content/detail?id=${id}&type=${type}`
}

module.exports = {
  buildSummaryText,
  toDetailQuery
}
```

```json
// D:\Documents\HBuilderProjects\ai学习小程序\package.json
{
  "scripts": {
    "test:shared": "node --test tests/shared",
    "test:cloud": "node --test tests/cloud"
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js"
```

Expected: PASS with 4 passing tests.

- [ ] **Step 5: Commit**

```bash
git -C "D:\Documents\HBuilderProjects\ai学习小程序" add package.json utils/date.js utils/content.js tests/shared/date-content.test.js
git -C "D:\Documents\HBuilderProjects\ai学习小程序" commit -m "test: add shared utility test harness"
```

## Task 2: Define Database Collections and Bootstrap Rules

**Files:**
- Modify: `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\db_init.json`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\article_hot.schema.json`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\article_knowledge.schema.json`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\user_checkin.schema.json`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\user_favorite.schema.json`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\user_view_history.schema.json`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\docs\operations\content-admin.md`
- Test: `D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\db-init.test.js`

- [ ] **Step 1: Write the failing test**

```js
// D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\db-init.test.js
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

test('db_init.json contains all MVP collections', () => {
  const raw = fs.readFileSync(
    'D:/Documents/HBuilderProjects/ai学习小程序/uniCloud-aliyun/database/db_init.json',
    'utf8'
  )
  const value = JSON.parse(raw)
  const expectedKeys = [
    'article_hot',
    'article_knowledge',
    'user_checkin',
    'user_favorite',
    'user_view_history'
  ]

  for (const key of expectedKeys) {
    assert.ok(value[key], `missing ${key}`)
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\db-init.test.js"
```

Expected: FAIL with `missing article_hot`.

- [ ] **Step 3: Write minimal implementation**

```json
// D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\db_init.json
{
  "opendb-device": {},
  "opendb-open-data": {},
  "opendb-verify-codes": {},
  "uni-id-device": {},
  "uni-id-log": {},
  "uni-id-permissions": {},
  "uni-id-roles": {},
  "uni-id-users": {},
  "article_hot": {},
  "article_knowledge": {},
  "user_checkin": {},
  "user_favorite": {},
  "user_view_history": {}
}
```

```json
// D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\article_hot.schema.json
{
  "bsonType": "object",
  "required": ["title", "summary", "content", "status", "publish_at", "created_at", "updated_at"],
  "properties": {
    "title": { "bsonType": "string" },
    "cover": { "bsonType": "string" },
    "summary": { "bsonType": "string" },
    "content": { "bsonType": "string" },
    "tags": { "bsonType": "array" },
    "source_name": { "bsonType": "string" },
    "source_url": { "bsonType": "string" },
    "publish_at": { "bsonType": "timestamp" },
    "is_recommend": { "bsonType": "bool" },
    "is_top": { "bsonType": "bool" },
    "status": { "enum": ["draft", "published", "offline"] },
    "view_count": { "bsonType": "int" },
    "favorite_count": { "bsonType": "int" },
    "created_at": { "bsonType": "timestamp" },
    "updated_at": { "bsonType": "timestamp" }
  }
}
```

```json
// D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\article_knowledge.schema.json
{
  "bsonType": "object",
  "required": ["title", "intro", "content", "category", "status", "created_at", "updated_at"],
  "properties": {
    "title": { "bsonType": "string" },
    "cover": { "bsonType": "string" },
    "intro": { "bsonType": "string" },
    "content": { "bsonType": "string" },
    "category": { "bsonType": "string" },
    "level": { "enum": ["beginner", "intermediate", "advanced"] },
    "is_recommend": { "bsonType": "bool" },
    "status": { "enum": ["draft", "published", "offline"] },
    "view_count": { "bsonType": "int" },
    "favorite_count": { "bsonType": "int" },
    "created_at": { "bsonType": "timestamp" },
    "updated_at": { "bsonType": "timestamp" }
  }
}
```

```json
// D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\user_checkin.schema.json
{
  "bsonType": "object",
  "required": ["user_id", "checkin_date", "checkin_time", "created_at"],
  "properties": {
    "user_id": { "bsonType": "string" },
    "checkin_date": { "bsonType": "string" },
    "checkin_time": { "bsonType": "timestamp" },
    "created_at": { "bsonType": "timestamp" }
  }
}
```

```json
// D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\user_favorite.schema.json
{
  "bsonType": "object",
  "required": ["user_id", "target_id", "target_type", "created_at"],
  "properties": {
    "user_id": { "bsonType": "string" },
    "target_id": { "bsonType": "string" },
    "target_type": { "enum": ["hot", "knowledge"] },
    "created_at": { "bsonType": "timestamp" }
  }
}
```

```json
// D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\database\user_view_history.schema.json
{
  "bsonType": "object",
  "required": ["user_id", "target_id", "target_type", "view_time"],
  "properties": {
    "user_id": { "bsonType": "string" },
    "target_id": { "bsonType": "string" },
    "target_type": { "enum": ["hot", "knowledge"] },
    "view_time": { "bsonType": "timestamp" }
  }
}
```

```md
<!-- D:\Documents\HBuilderProjects\ai学习小程序\docs\operations\content-admin.md -->
# 内容管理员初始化

1. 在 UniCloud 控制台给需要发布内容的用户添加 `content_admin` 角色。
2. 第一阶段不做角色管理后台，角色分配由控制台手动维护。
3. 管理页面只对携带 `content_admin` 角色的账号开放。
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\db-init.test.js"
```

Expected: PASS with the new collection keys present.

- [ ] **Step 5: Commit**

```bash
git -C "D:\Documents\HBuilderProjects\ai学习小程序" add uniCloud-aliyun/database/db_init.json uniCloud-aliyun/database/article_hot.schema.json uniCloud-aliyun/database/article_knowledge.schema.json uniCloud-aliyun/database/user_checkin.schema.json uniCloud-aliyun/database/user_favorite.schema.json uniCloud-aliyun/database/user_view_history.schema.json docs/operations/content-admin.md tests/shared/db-init.test.js
git -C "D:\Documents\HBuilderProjects\ai学习小程序" commit -m "feat: add mvp data collections"
```

## Task 3: Implement Shared Cloud Business Helpers

**Files:**
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\common\ai-learning-shared\index.js`
- Test: `D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js`

- [ ] **Step 1: Write the failing test**

```js
// D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js
const test = require('node:test')
const assert = require('node:assert/strict')

const {
  calcCheckinStats,
  buildArticleCard,
  assertAdminRole
} = require('../../uniCloud-aliyun/cloudfunctions/common/ai-learning-shared')

test('calcCheckinStats returns current streak and total days', () => {
  const result = calcCheckinStats(['2026-04-16', '2026-04-17', '2026-04-18'], '2026-04-18')
  assert.deepEqual(result, { streak: 3, total: 3, checkedToday: true })
})

test('buildArticleCard maps hot article data for frontend lists', () => {
  const result = buildArticleCard({
    _id: 'hot-1',
    title: 'OpenAI 新发布',
    summary: '总结',
    tags: ['模型'],
    publish_at: '2026-04-18'
  }, 'hot')

  assert.equal(result.id, 'hot-1')
  assert.equal(result.type, 'hot')
  assert.equal(result.summary, '总结')
})

test('assertAdminRole throws when user has no content_admin role', () => {
  assert.throws(() => assertAdminRole({ role: ['user'] }), /content_admin/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js"
```

Expected: FAIL with `Cannot find module '../../uniCloud-aliyun/cloudfunctions/common/ai-learning-shared'`.

- [ ] **Step 3: Write minimal implementation**

```js
// D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\common\ai-learning-shared\index.js
function calcCheckinStats(dayKeys = [], todayKey) {
  const uniqueKeys = Array.from(new Set(dayKeys)).sort()
  let streak = 0
  let cursor = todayKey
  const set = new Set(uniqueKeys)

  while (set.has(cursor)) {
    streak += 1
    const date = new Date(`${cursor}T00:00:00+08:00`)
    date.setDate(date.getDate() - 1)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    cursor = `${date.getFullYear()}-${month}-${day}`
  }

  return {
    streak,
    total: uniqueKeys.length,
    checkedToday: set.has(todayKey)
  }
}

function buildArticleCard(doc, type) {
  return {
    id: doc._id,
    type,
    title: doc.title,
    cover: doc.cover || '',
    summary: (doc.summary || doc.intro || '').trim(),
    tags: doc.tags || [],
    publishAt: doc.publish_at || doc.updated_at || doc.created_at
  }
}

function assertAdminRole(userInfo = {}) {
  const roles = userInfo.role || []
  if (!roles.includes('content_admin')) {
    throw new Error('content_admin role required')
  }
}

module.exports = {
  calcCheckinStats,
  buildArticleCard,
  assertAdminRole
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js"
```

Expected: PASS with 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git -C "D:\Documents\HBuilderProjects\ai学习小程序" add uniCloud-aliyun/cloudfunctions/common/ai-learning-shared/index.js tests/cloud/ai-learning-shared.test.js
git -C "D:\Documents\HBuilderProjects\ai学习小程序" commit -m "feat: add shared cloud business helpers"
```

## Task 4: Build the Check-in and Home Summary Cloud Object

**Files:**
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-growth-co\index.obj.js`
- Modify: `D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js`

- [ ] **Step 1: Write the failing test**

```js
// append to D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js
const { calcCheckinStats } = require('../../uniCloud-aliyun/cloudfunctions/common/ai-learning-shared')

test('calcCheckinStats returns zero streak when today is missing', () => {
  const result = calcCheckinStats(['2026-04-16', '2026-04-17'], '2026-04-18')
  assert.deepEqual(result, { streak: 0, total: 2, checkedToday: false })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js"
```

Expected: FAIL because `calcCheckinStats` currently returns the wrong streak when today is missing.

- [ ] **Step 3: Write minimal implementation**

```js
// update in D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\common\ai-learning-shared\index.js
function calcCheckinStats(dayKeys = [], todayKey) {
  const uniqueKeys = Array.from(new Set(dayKeys)).sort()
  const set = new Set(uniqueKeys)
  if (!set.has(todayKey)) {
    return {
      streak: 0,
      total: uniqueKeys.length,
      checkedToday: false
    }
  }

  let streak = 0
  let cursor = todayKey
  while (set.has(cursor)) {
    streak += 1
    const date = new Date(`${cursor}T00:00:00+08:00`)
    date.setDate(date.getDate() - 1)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    cursor = `${date.getFullYear()}-${month}-${day}`
  }

  return {
    streak,
    total: uniqueKeys.length,
    checkedToday: true
  }
}
```

```js
// D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-growth-co\index.obj.js
const db = uniCloud.database()
const { calcCheckinStats, buildArticleCard } = require('../common/ai-learning-shared')

const hotCollection = db.collection('article_hot')
const knowledgeCollection = db.collection('article_knowledge')
const checkinCollection = db.collection('user_checkin')

function getTodayKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

module.exports = {
  async getCheckinStatus() {
    const uid = this.authInfo.uid
    const todayKey = getTodayKey()
    const { data } = await checkinCollection.where({ user_id: uid }).get()
    return calcCheckinStats(data.map(item => item.checkin_date), todayKey)
  },

  async checkin() {
    const uid = this.authInfo.uid
    const todayKey = getTodayKey()
    const existing = await checkinCollection.where({ user_id: uid, checkin_date: todayKey }).get()
    if (existing.data.length) {
      return { checked: true, duplicate: true, ...calcCheckinStats(existing.data.map(item => item.checkin_date), todayKey) }
    }

    const now = Date.now()
    await checkinCollection.add({
      user_id: uid,
      checkin_date: todayKey,
      checkin_time: now,
      created_at: now
    })

    return {
      checked: true,
      duplicate: false,
      ...(await this.getCheckinStatus())
    }
  },

  async getHomeSummary() {
    const [checkinState, hotRes, knowledgeRes] = await Promise.all([
      this.getCheckinStatus(),
      hotCollection.where({ status: 'published', is_recommend: true }).orderBy('publish_at', 'desc').limit(3).get(),
      knowledgeCollection.where({ status: 'published', is_recommend: true }).orderBy('updated_at', 'desc').limit(3).get()
    ])

    return {
      checkin: checkinState,
      hotList: hotRes.data.map(item => buildArticleCard(item, 'hot')),
      knowledgeList: knowledgeRes.data.map(item => buildArticleCard(item, 'knowledge'))
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js"
node --check "D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-growth-co\index.obj.js"
```

Expected: tests PASS and `node --check` returns no syntax errors.

- [ ] **Step 5: Commit**

```bash
git -C "D:\Documents\HBuilderProjects\ai学习小程序" add uniCloud-aliyun/cloudfunctions/common/ai-learning-shared/index.js uniCloud-aliyun/cloudfunctions/ai-growth-co/index.obj.js tests/cloud/ai-learning-shared.test.js
git -C "D:\Documents\HBuilderProjects\ai学习小程序" commit -m "feat: add growth cloud object"
```

## Task 5: Build Content Query and Admin Publishing Cloud Objects

**Files:**
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-content-co\index.obj.js`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-admin-co\index.obj.js`
- Modify: `D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js`

- [ ] **Step 1: Write the failing test**

```js
// append to D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js
test('buildArticleCard falls back to intro for knowledge articles', () => {
  const result = buildArticleCard({
    _id: 'knowledge-1',
    title: '提示词技巧',
    intro: '知识简介'
  }, 'knowledge')

  assert.equal(result.summary, '知识简介')
})

test('assertAdminRole passes when user owns content_admin role', () => {
  assert.doesNotThrow(() => assertAdminRole({ role: ['user', 'content_admin'] }))
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js"
```

Expected: FAIL because `buildArticleCard` or role checks are incomplete.

- [ ] **Step 3: Write minimal implementation**

```js
// update in D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\common\ai-learning-shared\index.js
function buildArticleCard(doc, type) {
  return {
    id: doc._id,
    type,
    title: doc.title,
    cover: doc.cover || '',
    summary: (doc.summary || doc.intro || '').trim(),
    tags: doc.tags || (doc.category ? [doc.category] : []),
    publishAt: doc.publish_at || doc.updated_at || doc.created_at
  }
}
```

```js
// D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-content-co\index.obj.js
const db = uniCloud.database()
const dbCmd = db.command
const { buildArticleCard } = require('../common/ai-learning-shared')

const hotCollection = db.collection('article_hot')
const knowledgeCollection = db.collection('article_knowledge')
const favoriteCollection = db.collection('user_favorite')
const historyCollection = db.collection('user_view_history')

function getCollection(type) {
  return type === 'hot' ? hotCollection : knowledgeCollection
}

module.exports = {
  async listHotArticles({ page = 1, pageSize = 10 } = {}) {
    const { data } = await hotCollection
      .where({ status: 'published' })
      .orderBy('is_top', 'desc')
      .orderBy('publish_at', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return data.map(item => buildArticleCard(item, 'hot'))
  },

  async listKnowledgeArticles({ page = 1, pageSize = 10, category = '' } = {}) {
    const where = { status: 'published' }
    if (category) where.category = category
    const { data } = await knowledgeCollection
      .where(where)
      .orderBy('updated_at', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return data.map(item => buildArticleCard(item, 'knowledge'))
  },

  async getArticleDetail({ id, type }) {
    const collection = getCollection(type)
    const { data } = await collection.doc(id).get()
    const article = data[0]

    await collection.doc(id).update({ view_count: dbCmd.inc(1) })
    await historyCollection.add({
      user_id: this.authInfo.uid,
      target_id: id,
      target_type: type,
      view_time: Date.now()
    })

    return article
  },

  async toggleFavorite({ id, type }) {
    const uid = this.authInfo.uid
    const existing = await favoriteCollection.where({
      user_id: uid,
      target_id: id,
      target_type: type
    }).get()

    if (existing.data.length) {
      await favoriteCollection.doc(existing.data[0]._id).remove()
      return { favorite: false }
    }

    await favoriteCollection.add({
      user_id: uid,
      target_id: id,
      target_type: type,
      created_at: Date.now()
    })
    return { favorite: true }
  }
}
```

```js
// D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-admin-co\index.obj.js
const db = uniCloud.database()
const { assertAdminRole } = require('../common/ai-learning-shared')

function getTargetConfig(type) {
  if (type === 'hot') {
    return {
      collection: db.collection('article_hot'),
      fields: ['title', 'cover', 'summary', 'content', 'tags', 'source_name', 'source_url', 'publish_at', 'is_recommend', 'is_top', 'status']
    }
  }

  return {
    collection: db.collection('article_knowledge'),
    fields: ['title', 'cover', 'intro', 'content', 'category', 'level', 'is_recommend', 'status']
  }
}

module.exports = {
  async saveArticle({ id = '', type, payload }) {
    assertAdminRole(this.getUniversalClientInfo().userInfo || {})
    const { collection, fields } = getTargetConfig(type)
    const data = {}
    for (const field of fields) data[field] = payload[field]
    data.updated_at = Date.now()
    if (!id) {
      data.created_at = Date.now()
      data.view_count = 0
      data.favorite_count = 0
      return collection.add(data)
    }
    return collection.doc(id).update(data)
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud\ai-learning-shared.test.js"
node --check "D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-content-co\index.obj.js"
node --check "D:\Documents\HBuilderProjects\ai学习小程序\uniCloud-aliyun\cloudfunctions\ai-admin-co\index.obj.js"
```

Expected: tests PASS and both cloud objects have no syntax errors.

- [ ] **Step 5: Commit**

```bash
git -C "D:\Documents\HBuilderProjects\ai学习小程序" add uniCloud-aliyun/cloudfunctions/ai-content-co/index.obj.js uniCloud-aliyun/cloudfunctions/ai-admin-co/index.obj.js uniCloud-aliyun/cloudfunctions/common/ai-learning-shared/index.js tests/cloud/ai-learning-shared.test.js
git -C "D:\Documents\HBuilderProjects\ai学习小程序" commit -m "feat: add content and admin cloud objects"
```

## Task 6: Build the Frontend Service Layer and App Shell

**Files:**
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\utils\auth.js`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\services\growth.js`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\services\content.js`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\services\admin.js`
- Modify: `D:\Documents\HBuilderProjects\ai学习小程序\pages.json`

- [ ] **Step 1: Write the failing test**

```js
// append to D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js
const { requireLogin } = require('../../utils/auth')

test('requireLogin returns a boolean-like status for page guards', () => {
  assert.equal(typeof requireLogin({ hasLogin: true }), 'boolean')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js"
```

Expected: FAIL with `Cannot find module '../../utils/auth'`.

- [ ] **Step 3: Write minimal implementation**

```js
// D:\Documents\HBuilderProjects\ai学习小程序\utils\auth.js
function requireLogin(store) {
  return Boolean(store && store.hasLogin)
}

module.exports = {
  requireLogin
}
```

```js
// D:\Documents\HBuilderProjects\ai学习小程序\services\growth.js
const growthCo = uniCloud.importObject('ai-growth-co', { customUI: true })

export function getHomeSummary() {
  return growthCo.getHomeSummary()
}

export function getCheckinStatus() {
  return growthCo.getCheckinStatus()
}

export function submitCheckin() {
  return growthCo.checkin()
}
```

```js
// D:\Documents\HBuilderProjects\ai学习小程序\services\content.js
const contentCo = uniCloud.importObject('ai-content-co', { customUI: true })

export function getHotList(params) {
  return contentCo.listHotArticles(params)
}

export function getKnowledgeList(params) {
  return contentCo.listKnowledgeArticles(params)
}

export function getContentDetail(params) {
  return contentCo.getArticleDetail(params)
}

export function toggleFavorite(params) {
  return contentCo.toggleFavorite(params)
}
```

```js
// D:\Documents\HBuilderProjects\ai学习小程序\services\admin.js
const adminCo = uniCloud.importObject('ai-admin-co', { customUI: true })

export function saveArticle(payload) {
  return adminCo.saveArticle(payload)
}
```

```json
// key changes in D:\Documents\HBuilderProjects\ai学习小程序\pages.json
{
  "pages": [
    { "path": "pages/index/index" },
    { "path": "pages/hot/index" },
    { "path": "pages/knowledge/index" },
    { "path": "pages/content/detail" },
    { "path": "pages/mine/index" },
    { "path": "pages/mine/favorites" },
    { "path": "pages/mine/history" },
    { "path": "pages/admin/index" },
    { "path": "pages/admin/editor" }
  ],
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages/hot/index", "text": "热点" },
      { "pagePath": "pages/knowledge/index", "text": "知识" },
      { "pagePath": "pages/mine/index", "text": "我的" }
    ]
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js"
node --check "D:\Documents\HBuilderProjects\ai学习小程序\services\growth.js"
node --check "D:\Documents\HBuilderProjects\ai学习小程序\services\content.js"
node --check "D:\Documents\HBuilderProjects\ai学习小程序\services\admin.js"
```

Expected: shared tests PASS and service files report no syntax errors.

- [ ] **Step 5: Commit**

```bash
git -C "D:\Documents\HBuilderProjects\ai学习小程序" add utils/auth.js services/growth.js services/content.js services/admin.js pages.json tests/shared/date-content.test.js
git -C "D:\Documents\HBuilderProjects\ai学习小程序" commit -m "feat: add frontend service layer and app shell routing"
```

## Task 7: Build Home, List, Detail, and Mine Pages

**Files:**
- Modify: `D:\Documents\HBuilderProjects\ai学习小程序\pages\index\index.vue`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\components\checkin-card.vue`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\components\article-list-card.vue`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\components\empty-state.vue`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\pages\hot\index.vue`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\pages\knowledge\index.vue`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\pages\content\detail.vue`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\pages\mine\index.vue`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\pages\mine\favorites.vue`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\pages\mine\history.vue`

- [ ] **Step 1: Write the failing test**

```js
// append to D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js
const { buildSummaryText } = require('../../utils/content')

test('buildSummaryText falls back to intro for knowledge content cards', () => {
  assert.equal(buildSummaryText({ intro: '知识摘要' }), '知识摘要')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js"
```

Expected: FAIL because `buildSummaryText` only handles `summary`.

- [ ] **Step 3: Write minimal implementation**

```js
// update in D:\Documents\HBuilderProjects\ai学习小程序\utils\content.js
function buildSummaryText(article = {}) {
  return (article.summary || article.intro || '').trim()
}
```

```vue
<!-- D:\Documents\HBuilderProjects\ai学习小程序\components\checkin-card.vue -->
<template>
  <view class="checkin-card">
    <view class="header">
      <text class="title">今日签到</text>
      <text class="streak">连续 {{ value.streak || 0 }} 天</text>
    </view>
    <button class="checkin-btn" type="primary" :disabled="value.checkedToday" @click="$emit('submit')">
      {{ value.checkedToday ? '今日已签到' : '立即签到' }}
    </button>
  </view>
</template>

<script setup>
defineProps({
  value: {
    type: Object,
    default: () => ({ checkedToday: false, streak: 0, total: 0 })
  }
})
</script>
```

```vue
<!-- D:\Documents\HBuilderProjects\ai学习小程序\components\article-list-card.vue -->
<template>
  <view class="article-card" @click="$emit('select', item)">
    <text class="title">{{ item.title }}</text>
    <text class="summary">{{ item.summary }}</text>
    <view class="tags">
      <text v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>
```

```vue
<!-- D:\Documents\HBuilderProjects\ai学习小程序\pages\index\index.vue -->
<template>
  <view class="page">
    <checkin-card :value="home.checkin" @submit="onCheckin" />
    <view class="section">
      <text class="section-title">今日热点</text>
      <article-list-card v-for="item in home.hotList" :key="item.id" :item="item" @select="goDetail" />
    </view>
    <view class="section">
      <text class="section-title">知识精选</text>
      <article-list-card v-for="item in home.knowledgeList" :key="item.id" :item="item" @select="goDetail" />
    </view>
  </view>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import CheckinCard from '@/components/checkin-card.vue'
import ArticleListCard from '@/components/article-list-card.vue'
import { getHomeSummary, submitCheckin } from '@/services/growth.js'
import { toDetailQuery } from '@/utils/content'

const home = reactive({
  checkin: { checkedToday: false, streak: 0, total: 0 },
  hotList: [],
  knowledgeList: []
})

async function loadHome() {
  const result = await getHomeSummary()
  home.checkin = result.checkin
  home.hotList = result.hotList
  home.knowledgeList = result.knowledgeList
}

async function onCheckin() {
  home.checkin = await submitCheckin()
}

function goDetail(item) {
  uni.navigateTo({ url: toDetailQuery(item) })
}

onMounted(loadHome)
</script>
```

```vue
<!-- D:\Documents\HBuilderProjects\ai学习小程序\pages\hot\index.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import ArticleListCard from '@/components/article-list-card.vue'
import { getHotList } from '@/services/content.js'
import { toDetailQuery } from '@/utils/content'

const list = ref([])
async function loadList() {
  list.value = await getHotList({ page: 1, pageSize: 10 })
}
function goDetail(item) {
  uni.navigateTo({ url: toDetailQuery(item) })
}
onMounted(loadList)
</script>
```

```vue
<!-- D:\Documents\HBuilderProjects\ai学习小程序\pages\knowledge\index.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import ArticleListCard from '@/components/article-list-card.vue'
import { getKnowledgeList } from '@/services/content.js'
import { toDetailQuery } from '@/utils/content'

const list = ref([])
async function loadList() {
  list.value = await getKnowledgeList({ page: 1, pageSize: 10 })
}
function goDetail(item) {
  uni.navigateTo({ url: toDetailQuery(item) })
}
onMounted(loadList)
</script>
```

```vue
<!-- D:\Documents\HBuilderProjects\ai学习小程序\pages\content\detail.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { getContentDetail, toggleFavorite } from '@/services/content.js'

const article = ref({})
const favorite = ref(false)
const query = defineProps ? null : null

async function loadDetail(options) {
  article.value = await getContentDetail({
    id: options.id,
    type: options.type
  })
}

async function onToggleFavorite() {
  const result = await toggleFavorite({ id: article.value._id, type: article.value.type })
  favorite.value = result.favorite
}

onMounted(() => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  loadDetail(current.options)
})
</script>
```

```vue
<!-- D:\Documents\HBuilderProjects\ai学习小程序\pages\mine\index.vue -->
<script setup>
import { computed } from 'vue'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'

const nickname = computed(() => store.userInfo.nickname || '微信用户')

function goFavorites() {
  uni.navigateTo({ url: '/pages/mine/favorites' })
}

function goHistory() {
  uni.navigateTo({ url: '/pages/mine/history' })
}
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js"
```

Expected: shared tests PASS.

Manual verification:

1. 在 HBuilderX 中运行到微信开发者工具。
2. 登录后进入首页，确认签到卡在首屏。
3. 点击签到后按钮变为“今日已签到”。
4. 切换到底部 tab，确认“热点”“知识”“我的”页面均可打开。
5. 点击内容卡片，确认能进入详情页。

- [ ] **Step 5: Commit**

```bash
git -C "D:\Documents\HBuilderProjects\ai学习小程序" add pages/index/index.vue components/checkin-card.vue components/article-list-card.vue components/empty-state.vue pages/hot/index.vue pages/knowledge/index.vue pages/content/detail.vue pages/mine/index.vue pages/mine/favorites.vue pages/mine/history.vue utils/content.js tests/shared/date-content.test.js
git -C "D:\Documents\HBuilderProjects\ai学习小程序" commit -m "feat: build home content and mine pages"
```

## Task 8: Build Admin Pages and Final Integration Checks

**Files:**
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\pages\admin\index.vue`
- Create: `D:\Documents\HBuilderProjects\ai学习小程序\pages\admin\editor.vue`
- Modify: `D:\Documents\HBuilderProjects\ai学习小程序\services\admin.js`

- [ ] **Step 1: Write the failing test**

```js
// append to D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js
test('toDetailQuery supports knowledge routes for admin preview reuse', () => {
  assert.equal(
    toDetailQuery({ id: 'knowledge-7', type: 'knowledge' }),
    '/pages/content/detail?id=knowledge-7&type=knowledge'
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js"
```

Expected: FAIL if route builder is still limited or malformed.

- [ ] **Step 3: Write minimal implementation**

```js
// update in D:\Documents\HBuilderProjects\ai学习小程序\services\admin.js
export function listAdminArticles(params) {
  return adminCo.listAdminArticles(params)
}
```

```vue
<!-- D:\Documents\HBuilderProjects\ai学习小程序\pages\admin\index.vue -->
<template>
  <view class="page">
    <button @click="goEditor('hot')">新增热点</button>
    <button @click="goEditor('knowledge')">新增知识</button>
  </view>
</template>

<script setup>
function goEditor(type) {
  uni.navigateTo({ url: `/pages/admin/editor?type=${type}` })
}
</script>
```

```vue
<!-- D:\Documents\HBuilderProjects\ai学习小程序\pages\admin\editor.vue -->
<template>
  <view class="page">
    <input v-model="form.title" placeholder="标题" />
    <textarea v-model="form.content" placeholder="正文" />
    <button type="primary" @click="onSubmit">保存</button>
  </view>
</template>

<script setup>
import { reactive } from 'vue'
import { saveArticle } from '@/services/admin.js'

const pages = getCurrentPages()
const current = pages[pages.length - 1]
const type = current.options.type || 'hot'
const form = reactive({
  title: '',
  summary: '',
  intro: '',
  content: '',
  tags: [],
  category: '',
  level: 'beginner',
  status: 'draft',
  is_recommend: false,
  is_top: false
})

async function onSubmit() {
  await saveArticle({
    type,
    payload: form
  })
  uni.showToast({ title: '保存成功', icon: 'none' })
  uni.navigateBack()
}
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\shared\date-content.test.js"
node --check "D:\Documents\HBuilderProjects\ai学习小程序\services\admin.js"
```

Expected: shared tests PASS and admin service has no syntax errors.

Manual verification:

1. 使用带 `content_admin` 角色的账号登录。
2. 进入 `/pages/admin/index`，确认可以打开编辑页。
3. 新增一篇热点和一篇知识内容。
4. 发布后返回前台首页、热点页、知识页，确认可见。
5. 用普通账号访问管理页，确认服务端返回权限错误。

- [ ] **Step 5: Commit**

```bash
git -C "D:\Documents\HBuilderProjects\ai学习小程序" add pages/admin/index.vue pages/admin/editor.vue services/admin.js tests/shared/date-content.test.js
git -C "D:\Documents\HBuilderProjects\ai学习小程序" commit -m "feat: add lightweight admin publishing pages"
```

## Final Verification Checklist

- 在 UniCloud 数据库执行 `db_init.json` 初始化新集合。
- 为测试管理员账号添加 `content_admin` 角色。
- 重新上传 `ai-growth-co`、`ai-content-co`、`ai-admin-co` 云对象。
- 运行共享测试：

```bash
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\shared"
node --test "D:\Documents\HBuilderProjects\ai学习小程序\tests\cloud"
```

- 在 HBuilderX 中运行到微信开发者工具，手工验证以下路径：
  - 首页签到
  - 热点列表与详情
  - 知识列表与详情
  - 收藏与浏览记录
  - 我的页面
  - 管理发布页

## Spec Coverage Check

- `微信登录`：继续复用现有 `uni-id-pages`，无须重做认证流程。
- `首页`：Task 6 与 Task 7 覆盖首页壳子、签到卡、精选内容。
- `每日签到`：Task 4 实现签到状态、签到动作和首页摘要。
- `AI 热点列表和详情`：Task 5 和 Task 7 覆盖。
- `AI 知识列表和详情`：Task 5 和 Task 7 覆盖。
- `收藏功能`：Task 5 提供接口，Task 7 在详情和我的页消费。
- `我的页面`：Task 7 覆盖。
- `内容后台发布能力`：Task 5 和 Task 8 覆盖。

## Plan Self-Review

- 已检查计划中的文件路径，全部对应当前项目结构或新增目标路径。
- 已检查云对象、前端服务和页面之间的方法命名，`getHomeSummary`、`checkin`、`listHotArticles`、`saveArticle` 在前后端保持一致。
- 未发现 `TBD`、`TODO` 或“后续补充”类占位步骤。
