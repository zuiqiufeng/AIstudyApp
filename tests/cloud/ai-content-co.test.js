const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const modulePath = path.join(__dirname, '../../uniCloud-aliyun/cloudfunctions/ai-content-co/index.obj.js')

function clone(value) {
	return JSON.parse(JSON.stringify(value))
}

function matchesWhere(doc = {}, where = {}) {
	return Object.entries(where).every(([key, expected]) => {
		const actual = doc[key]
		if (Array.isArray(actual)) {
			return actual.includes(expected)
		}
		return actual === expected
	})
}

function createQuery(collectionState, where = {}) {
	const queryState = {
		where,
		orderByCalls: [],
		skip: 0,
		limit: null
	}

	const query = {
		orderBy(field, direction) {
			queryState.orderByCalls.push([field, direction])
			return query
		},
		skip(value) {
			queryState.skip = value
			return query
		},
		limit(value) {
			queryState.limit = value
			return query
		},
		async get() {
			let rows = collectionState.docs.filter(doc => matchesWhere(doc, where))
			if (queryState.skip) {
				rows = rows.slice(queryState.skip)
			}
			if (Number.isFinite(queryState.limit)) {
				rows = rows.slice(0, queryState.limit)
			}
			return { data: clone(rows) }
		}
	}

	collectionState.queries.push(queryState)
	return query
}

function createCollectionState(initialDocs = []) {
	const state = {
		docs: clone(initialDocs),
		queries: [],
		addedDocs: []
	}

	function findIndexById(id) {
		return state.docs.findIndex(doc => doc && doc._id === id)
	}

	return {
		state,
		api: {
			where(where) {
				return createQuery(state, where)
			},
			doc(id) {
				return {
					async get() {
						const index = findIndexById(id)
						return { data: index >= 0 ? [clone(state.docs[index])] : [] }
					},
					async update(patch = {}) {
						const index = findIndexById(id)
						if (index < 0) {
							return { updated: 0 }
						}
						Object.entries(patch).forEach(([key, value]) => {
							if (value && value.__op === 'inc') {
								const current = Number(state.docs[index][key]) || 0
								state.docs[index][key] = current + value.value
								return
							}
							state.docs[index][key] = value
						})
						return { updated: 1 }
					},
					async remove() {
						const index = findIndexById(id)
						if (index >= 0) {
							state.docs.splice(index, 1)
						}
						return { deleted: index >= 0 ? 1 : 0 }
					}
				}
			},
			async add(doc) {
				const record = {
					_id: doc._id || `mock-${state.docs.length + 1}`,
					...clone(doc)
				}
				state.docs.push(record)
				state.addedDocs.push(record)
				return { id: record._id }
			}
		}
	}
}

function loadCloudObject(seed = {}) {
	const originalUniCloud = global.uniCloud
	const hot = createCollectionState(seed.hot || [])
	const knowledge = createCollectionState(seed.knowledge || [])
	const categories = createCollectionState(seed.categories || [])
	const favorites = createCollectionState(seed.favorites || [])
	const history = createCollectionState(seed.history || [])

	global.uniCloud = {
		database() {
			return {
				command: {
					inc(value) {
						return { __op: 'inc', value }
					}
				},
				collection(name) {
					if (name === 'article_hot') return hot.api
					if (name === 'article_knowledge') return knowledge.api
					if (name === 'ai_content_category') return categories.api
					if (name === 'user_favorite') return favorites.api
					if (name === 'user_view_history') return history.api
					throw new Error(`UNKNOWN_COLLECTION:${name}`)
				}
			}
		}
	}

	delete require.cache[modulePath]
	const cloud = require(modulePath)

	return {
		cloud,
		state: {
			hot: hot.state,
			knowledge: knowledge.state,
			categories: categories.state,
			favorites: favorites.state,
			history: history.state
		},
		restore() {
			delete require.cache[modulePath]
			if (typeof originalUniCloud === 'undefined') {
				delete global.uniCloud
				return
			}
			global.uniCloud = originalUniCloud
		}
	}
}

test('listHotArticles applies tag filters and keeps sort-based ordering ahead of publish time', async () => {
	const { cloud, state, restore } = loadCloudObject({
		hot: [
			{ _id: 'hot-1', title: '模型观察', summary: 'A', status: 'published', tags: ['模型'], sort: 20, publish_at: 10 },
			{ _id: 'hot-2', title: '办公提效', summary: 'B', status: 'published', tags: ['办公提效'], sort: 10, publish_at: 20 }
		]
	})

	try {
		const result = await cloud.listHotArticles({ page: 1, pageSize: 10, filter: '模型' })

		assert.equal(result.length, 1)
		assert.equal(result[0].id, 'hot-1')
		assert.deepEqual(state.hot.queries[0].where, { status: 'published', tags: '模型' })
		assert.deepEqual(state.hot.queries[0].orderByCalls, [
			['is_top', 'desc'],
			['sort', 'desc'],
			['publish_at', 'desc']
		])
	} finally {
		restore()
	}
})

test('listKnowledgeArticles keeps knowledge ordering aligned with admin sort weight', async () => {
	const { cloud, state, restore } = loadCloudObject({
		knowledge: [
			{ _id: 'knowledge-1', title: '基础认知', intro: 'A', category: 'AI入门', status: 'published', sort: 20, publish_at: 10 },
			{ _id: 'knowledge-2', title: '提示词模板', intro: 'B', category: 'AI入门', status: 'published', sort: 10, publish_at: 20 }
		]
	})

	try {
		await cloud.listKnowledgeArticles({ page: 1, pageSize: 10, category: 'AI入门' })

		assert.deepEqual(state.knowledge.queries[0].where, { status: 'published', category: 'AI入门' })
		assert.deepEqual(state.knowledge.queries[0].orderByCalls, [
			['is_top', 'desc'],
			['sort', 'desc'],
			['publish_at', 'desc']
		])
	} finally {
		restore()
	}
})

test('listHotFilters exposes backend tag options for the hot page', async () => {
	const { cloud, restore } = loadCloudObject({
		hot: [
			{ _id: 'hot-1', title: '模型观察', summary: 'A', status: 'published', tags: ['模型', '办公提效'], sort: 20, publish_at: 20 },
			{ _id: 'hot-2', title: 'Agent 观察', summary: 'B', status: 'published', tags: ['模型', 'AI热点'], sort: 10, publish_at: 10 }
		]
	})

	try {
		const filters = await cloud.listHotFilters()

		assert.deepEqual(filters, ['全部', '模型', '办公提效', 'AI热点'])
	} finally {
		restore()
	}
})

test('toggleFavorite writes a favorite record and increments article favorite_count', async () => {
	const { cloud, state, restore } = loadCloudObject({
		hot: [
			{ _id: 'hot-1', title: '模型观察', summary: 'A', status: 'published', favorite_count: 2 }
		]
	})

	try {
		const result = await cloud.toggleFavorite.call({ authInfo: { uid: 'user-1' } }, { id: 'hot-1', type: 'hot' })

		assert.deepEqual(result, { favorite: true })
		assert.equal(state.favorites.docs.length, 1)
		assert.equal(state.hot.docs[0].favorite_count, 3)
	} finally {
		restore()
	}
})

test('toggleFavorite removes an existing favorite record and decrements article favorite_count', async () => {
	const { cloud, state, restore } = loadCloudObject({
		knowledge: [
			{ _id: 'knowledge-1', title: '提示词模板', intro: 'A', category: 'AI入门', status: 'published', favorite_count: 2 }
		],
		favorites: [
			{ _id: 'favorite-1', user_id: 'user-1', target_id: 'knowledge-1', target_type: 'knowledge' }
		]
	})

	try {
		const result = await cloud.toggleFavorite.call({ authInfo: { uid: 'user-1' } }, { id: 'knowledge-1', type: 'knowledge' })

		assert.deepEqual(result, { favorite: false })
		assert.equal(state.favorites.docs.length, 0)
		assert.equal(state.knowledge.docs[0].favorite_count, 1)
	} finally {
		restore()
	}
})
