const db = uniCloud.database()
const dbCmd = db.command
const { buildArticleCard, buildArticleDetail, resolveAuthInfo } = require('ai-learning-shared')

const hotCollection = db.collection('article_hot')
const knowledgeCollection = db.collection('article_knowledge')
const categoryCollection = db.collection('ai_content_category')
const favoriteCollection = db.collection('user_favorite')
const historyCollection = db.collection('user_view_history')

function getCollection(type) {
	return type === 'knowledge' ? knowledgeCollection : hotCollection
}

async function appendHistory(uid, id, type) {
	if (!uid) return
	await historyCollection.add({
		user_id: uid,
		target_id: id,
		target_type: type,
		view_time: Date.now()
	})
}

function buildCategoryOptions(rows = []) {
	const categories = Array.from(
		new Set(
			(rows || [])
				.map(item => String(item || '').trim())
				.filter(Boolean)
		)
	)

	return ['全部', ...categories]
}

async function updateFavoriteCount(type, id, delta) {
	if (!id || !delta) return
	await getCollection(type).doc(id).update({
		favorite_count: dbCmd.inc(delta)
	})
}

async function getCurrentUid(context) {
	const authInfo = await resolveAuthInfo(context)
	return authInfo && authInfo.uid
}

module.exports = {
	async listHotArticles({ page = 1, pageSize = 10, filter = '' } = {}) {
		const where = { status: 'published' }
		if (filter && filter !== '全部') {
			where.tags = filter
		}
		const { data } = await hotCollection
			.where(where)
			.orderBy('is_top', 'desc')
			.orderBy('sort', 'desc')
			.orderBy('publish_at', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()

		return (data || []).map(item => buildArticleCard(item, 'hot'))
	},

	async listKnowledgeArticles({ page = 1, pageSize = 10, category = '' } = {}) {
		const where = { status: 'published' }
		if (category && category !== '全部') {
			where.category = category
		}
		const { data } = await knowledgeCollection
			.where(where)
			.orderBy('is_top', 'desc')
			.orderBy('sort', 'desc')
			.orderBy('publish_at', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()

		return (data || []).map(item => buildArticleCard(item, 'knowledge'))
	},

	async listHotFilters() {
		const { data } = await hotCollection
			.where({ status: 'published' })
			.orderBy('is_top', 'desc')
			.orderBy('sort', 'desc')
			.orderBy('publish_at', 'desc')
			.limit(100)
			.get()

		const tagOptions = buildCategoryOptions(
			(data || []).flatMap(item => (Array.isArray(item.tags) ? item.tags : []))
		)

		return tagOptions.length > 1 ? tagOptions : ['全部']
	},

	async listKnowledgeCategories() {
		try {
			const { data } = await categoryCollection
				.where({ status: 'enabled' })
				.orderBy('sort', 'desc')
				.orderBy('updated_at', 'desc')
				.limit(100)
				.get()

			const categoryOptions = buildCategoryOptions((data || []).map(item => item.name))
			if (categoryOptions.length > 1) {
				return categoryOptions
			}
		} catch (error) {
			console.error('listKnowledgeCategories taxonomy fallback', error)
		}

		const { data } = await knowledgeCollection
			.where({ status: 'published' })
			.orderBy('updated_at', 'desc')
			.limit(100)
			.get()

		return buildCategoryOptions((data || []).map(item => item.category))
	},

	async getArticleDetail({ id, type = 'hot' } = {}) {
		if (!id) {
			throw new Error('ARTICLE_ID_REQUIRED')
		}
		const uid = await getCurrentUid(this)
		const collection = getCollection(type)
		const res = await collection.doc(id).get()
		const article = res.data && res.data[0]
		if (!article) {
			throw new Error('ARTICLE_NOT_FOUND')
		}
		let favorite = false
		if (uid) {
			const favoriteRes = await favoriteCollection.where({
				user_id: uid,
				target_id: id,
				target_type: type
			}).get()
			favorite = Boolean(favoriteRes.data && favoriteRes.data.length)
		}
		await collection.doc(id).update({
			view_count: dbCmd.inc(1)
		})
		await appendHistory(uid, id, type)

		return buildArticleDetail(article, type, favorite)
	},

	async toggleFavorite({ id, type = 'hot' } = {}) {
		const uid = await getCurrentUid(this)
		if (!uid) {
			throw new Error('UNAUTHORIZED')
		}
		const existing = await favoriteCollection.where({
			user_id: uid,
			target_id: id,
			target_type: type
		}).get()

		if (existing.data && existing.data.length) {
			await favoriteCollection.doc(existing.data[0]._id).remove()
			await updateFavoriteCount(type, id, -1)
			return { favorite: false }
		}

		await favoriteCollection.add({
			user_id: uid,
			target_id: id,
			target_type: type,
			created_at: Date.now()
		})
		await updateFavoriteCount(type, id, 1)
		return { favorite: true }
	},

	async listFavorites() {
		const uid = await getCurrentUid(this)
		if (!uid) {
			throw new Error('UNAUTHORIZED')
		}

		const { data } = await favoriteCollection.where({ user_id: uid }).orderBy('created_at', 'desc').limit(20).get()
		const result = []
		for (const item of data || []) {
			const articleRes = await getCollection(item.target_type).doc(item.target_id).get()
			const article = articleRes.data && articleRes.data[0]
			if (article) {
				result.push(buildArticleCard(article, item.target_type))
			}
		}
		return result
	},

	async listHistory() {
		const uid = await getCurrentUid(this)
		if (!uid) {
			throw new Error('UNAUTHORIZED')
		}

		const { data } = await historyCollection.where({ user_id: uid }).orderBy('view_time', 'desc').limit(20).get()
		const result = []
		for (const item of data || []) {
			const articleRes = await getCollection(item.target_type).doc(item.target_id).get()
			const article = articleRes.data && articleRes.data[0]
			if (article) {
				const card = buildArticleCard(article, item.target_type)
				card.badge = card.time || '最近'
				card.time = item.target_type === 'hot' ? '热点' : '知识'
				result.push(card)
			}
		}
		return result
	}
}
