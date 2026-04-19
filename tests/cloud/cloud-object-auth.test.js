const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const Module = require('node:module')

const growthModulePath = path.join(__dirname, '../../uniCloud-aliyun/cloudfunctions/ai-growth-co/index.obj.js')
const contentModulePath = path.join(__dirname, '../../uniCloud-aliyun/cloudfunctions/ai-content-co/index.obj.js')

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function matchesWhere(doc = {}, where = {}) {
  return Object.entries(where).every(([key, expected]) => doc[key] === expected)
}

function createQuery(state, where = {}) {
  return {
    where(nextWhere) {
      return createQuery(state, nextWhere)
    },
    orderBy() {
      return this
    },
    skip() {
      return this
    },
    limit() {
      return this
    },
    async get() {
      return {
        data: clone(state.docs.filter(doc => matchesWhere(doc, where)))
      }
    }
  }
}

function createCollectionState(initialDocs = []) {
  const state = {
    docs: clone(initialDocs)
  }

  return {
    state,
    api: {
      where(where = {}) {
        return createQuery(state, where)
      },
      doc(id) {
        return {
          async update(patch = {}) {
            const target = state.docs.find(item => item._id === id)
            if (!target) {
              return { updated: 0 }
            }
            Object.entries(patch).forEach(([key, value]) => {
              if (value && value.__op === 'inc') {
                target[key] = (Number(target[key]) || 0) + value.value
                return
              }
              target[key] = value
            })
            return { updated: 1 }
          },
          async get() {
            const target = state.docs.find(item => item._id === id)
            return { data: target ? [clone(target)] : [] }
          },
          async remove() {
            const index = state.docs.findIndex(item => item._id === id)
            if (index >= 0) {
              state.docs.splice(index, 1)
              return { deleted: 1 }
            }
            return { deleted: 0 }
          }
        }
      },
      async add(doc) {
        state.docs.push(clone(doc))
        return { id: doc._id || `mock-${state.docs.length}` }
      }
    }
  }
}

function loadCloudModule(modulePath, { collections, sharedModule }) {
  const originalLoad = Module._load
  const originalUniCloud = global.uniCloud

  delete require.cache[modulePath]
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'ai-learning-shared') {
      return sharedModule
    }
    return originalLoad.call(this, request, parent, isMain)
  }

  global.uniCloud = {
    database() {
      return {
        command: {
          inc(value) {
            return { __op: 'inc', value }
          }
        },
        collection(name) {
          if (!collections[name]) {
            throw new Error(`UNKNOWN_COLLECTION:${name}`)
          }
          return collections[name].api
        }
      }
    }
  }

  try {
    return require(modulePath)
  } finally {
    Module._load = originalLoad
    if (typeof originalUniCloud === 'undefined') {
      delete global.uniCloud
    } else {
      global.uniCloud = originalUniCloud
    }
  }
}

test('ai-growth-co checkin accepts a token-only cloud object context', async () => {
  const checkinCollection = createCollectionState([])
  const hotCollection = createCollectionState([])
  const knowledgeCollection = createCollectionState([])
  const cloud = loadCloudModule(growthModulePath, {
    collections: {
      user_checkin: checkinCollection,
      article_hot: hotCollection,
      article_knowledge: knowledgeCollection
    },
    sharedModule: {
      formatDayKey() {
        return '2026-04-19'
      },
      calcCheckinStats(dayKeys = [], todayKey) {
        return {
          streak: dayKeys.includes(todayKey) ? 1 : 0,
          total: dayKeys.length,
          checkedToday: dayKeys.includes(todayKey)
        }
      },
      buildArticleCard(doc = {}) {
        return doc
      },
      async resolveAuthInfo(context) {
        return context.getUniIdToken() ? { uid: 'user-1' } : null
      }
    }
  })

  const result = await cloud.checkin.call({
    getUniIdToken() {
      return 'token-1'
    },
    getClientInfo() {
      return { PLATFORM: 'mp-weixin' }
    }
  })

  assert.equal(result.duplicate, false)
  assert.equal(checkinCollection.state.docs.length, 1)
  assert.equal(checkinCollection.state.docs[0].user_id, 'user-1')
})

test('ai-content-co toggleFavorite accepts a token-only cloud object context', async () => {
  const hotCollection = createCollectionState([
    { _id: 'hot-1', title: '热点', favorite_count: 0 }
  ])
  const knowledgeCollection = createCollectionState([])
  const categoryCollection = createCollectionState([])
  const favoriteCollection = createCollectionState([])
  const historyCollection = createCollectionState([])

  const cloud = loadCloudModule(contentModulePath, {
    collections: {
      article_hot: hotCollection,
      article_knowledge: knowledgeCollection,
      ai_content_category: categoryCollection,
      user_favorite: favoriteCollection,
      user_view_history: historyCollection
    },
    sharedModule: {
      buildArticleCard(doc = {}) {
        return doc
      },
      buildArticleDetail(doc = {}) {
        return doc
      },
      async resolveAuthInfo(context) {
        return context.getUniIdToken() ? { uid: 'user-1' } : null
      }
    }
  })

  const result = await cloud.toggleFavorite.call({
    getUniIdToken() {
      return 'token-1'
    },
    getClientInfo() {
      return { PLATFORM: 'mp-weixin' }
    }
  }, {
    id: 'hot-1',
    type: 'hot'
  })

  assert.deepEqual(result, { favorite: true })
  assert.equal(favoriteCollection.state.docs.length, 1)
  assert.equal(favoriteCollection.state.docs[0].user_id, 'user-1')
  assert.equal(hotCollection.state.docs[0].favorite_count, 1)
})
