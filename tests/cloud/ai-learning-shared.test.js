const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const Module = require('node:module')

const sharedModulePath = path.join(__dirname, '../../uniCloud-aliyun/cloudfunctions/common/ai-learning-shared/index.js')

function loadSharedModule({ uniIdCommon } = {}) {
  const originalLoad = Module._load
  delete require.cache[sharedModulePath]

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'uni-id-common' && uniIdCommon) {
      return uniIdCommon
    }
    return originalLoad.call(this, request, parent, isMain)
  }

  const shared = require(sharedModulePath)

  return {
    shared,
    restore() {
      delete require.cache[sharedModulePath]
      Module._load = originalLoad
    }
  }
}

test('calcCheckinStats returns an active streak only when today is included', () => {
  const { shared, restore } = loadSharedModule()
  try {
    const result = shared.calcCheckinStats(['2026-04-16', '2026-04-17', '2026-04-18'], '2026-04-18')
    assert.deepEqual(result, { streak: 3, total: 3, checkedToday: true })
  } finally {
    restore()
  }
})

test('calcCheckinStats returns zero streak when today is missing', () => {
  const { shared, restore } = loadSharedModule()
  try {
    const result = shared.calcCheckinStats(['2026-04-16', '2026-04-17'], '2026-04-18')
    assert.deepEqual(result, { streak: 0, total: 2, checkedToday: false })
  } finally {
    restore()
  }
})

test('buildArticleCard maps hot or knowledge documents into a frontend card shape', () => {
  const { shared, restore } = loadSharedModule()
  try {
    const result = shared.buildArticleCard({
      _id: 'knowledge-1',
      title: '提示词技巧',
      intro: '知识简介',
      cover: 'https://example.com/cover.png',
      category: '办公提效',
      updated_at: '2026-04-18'
    }, 'knowledge')

    assert.equal(result.id, 'knowledge-1')
    assert.equal(result.type, 'knowledge')
    assert.equal(result.summary, '知识简介')
    assert.equal(result.cover, 'https://example.com/cover.png')
    assert.deepEqual(result.tags, ['办公提效'])
  } finally {
    restore()
  }
})

test('buildArticleDetail maps backend detail fields into the mini program detail shape', () => {
  const { shared, restore } = loadSharedModule()
  try {
    const result = shared.buildArticleDetail({
      _id: 'knowledge-2',
      title: 'AI知识拆解',
      intro: '知识摘要',
      cover: 'https://example.com/detail-cover.png',
      category: '办公提效',
      tags: ['提示词', '效率'],
      blocks: [
        { title: '第一节', body: '正文 A', quote: false },
        { title: '第二节', body: '正文 B', quote: true }
      ],
      level: 'advanced',
      read_minutes: 12,
      audience: '产品经理',
      publish_at: '2026-04-18',
      source_name: 'OpenAI',
      source_url: 'https://openai.com'
    }, 'knowledge', true)

    assert.equal(result.id, 'knowledge-2')
    assert.equal(result.type, 'knowledge')
    assert.equal(result.summary, '知识摘要')
    assert.equal(result.cover, 'https://example.com/detail-cover.png')
    assert.equal(result.level, 'advanced')
    assert.equal(result.read_minutes, 12)
    assert.equal(result.audience, '产品经理')
    assert.equal(result.source_name, 'OpenAI')
    assert.equal(result.source_url, 'https://openai.com')
    assert.equal(result.favorite, true)
    assert.deepEqual(result.blocks, [
      { title: '第一节', body: '正文 A', quote: false },
      { title: '第二节', body: '正文 B', quote: true }
    ])
  } finally {
    restore()
  }
})

test('resolveAuthInfo uses uni-id-common to parse the current cloud object token', async () => {
  let receivedClientInfo = null
  let receivedToken = null
  const { shared, restore } = loadSharedModule({
    uniIdCommon: {
      createInstance({ clientInfo }) {
        receivedClientInfo = clientInfo
        return {
          async checkToken(token) {
            receivedToken = token
            return {
              errCode: 0,
              uid: 'user-1',
              role: ['reader']
            }
          }
        }
      }
    }
  })
  try {
    const result = await shared.resolveAuthInfo({
      getClientInfo() {
        return { PLATFORM: 'mp-weixin', APPID: '__UNI__demo' }
      },
      getUniIdToken() {
        return 'token-1'
      }
    })

    assert.deepEqual(receivedClientInfo, { PLATFORM: 'mp-weixin', APPID: '__UNI__demo' })
    assert.equal(receivedToken, 'token-1')
    assert.deepEqual(result, {
      errCode: 0,
      uid: 'user-1',
      role: ['reader']
    })
  } finally {
    restore()
  }
})
