const db = uniCloud.database()
const { formatDayKey, calcCheckinStats, buildArticleCard, resolveAuthInfo } = require('ai-learning-shared')

const checkinCollection = db.collection('user_checkin')
const hotCollection = db.collection('article_hot')
const knowledgeCollection = db.collection('article_knowledge')

async function getCheckinDocs(uid) {
	const res = await checkinCollection.where({ user_id: uid }).get()
	return res.data || []
}

async function getCurrentUid(context) {
	const authInfo = await resolveAuthInfo(context)
	return authInfo && authInfo.uid
}

module.exports = {
	async getCheckinStatus() {
		const uid = await getCurrentUid(this)
		if (!uid) {
			throw new Error('UNAUTHORIZED')
		}
		const todayKey = formatDayKey()
		const docs = await getCheckinDocs(uid)
		return calcCheckinStats(docs.map(item => item.checkin_date), todayKey)
	},

	async checkin() {
		const uid = await getCurrentUid(this)
		if (!uid) {
			throw new Error('UNAUTHORIZED')
		}
		const todayKey = formatDayKey()
		const existing = await checkinCollection.where({ user_id: uid, checkin_date: todayKey }).get()
		if (existing.data && existing.data.length) {
			const docs = await getCheckinDocs(uid)
			return {
				duplicate: true,
				...calcCheckinStats(docs.map(item => item.checkin_date), todayKey)
			}
		}

		const now = Date.now()
		await checkinCollection.add({
			user_id: uid,
			checkin_date: todayKey,
			checkin_time: now,
			created_at: now
		})
		const docs = await getCheckinDocs(uid)
		return {
			duplicate: false,
			...calcCheckinStats(docs.map(item => item.checkin_date), todayKey)
		}
	},

	async getHomeSummary() {
		const uid = await getCurrentUid(this)
		const todayKey = formatDayKey()
		let checkin = {
			streak: 0,
			total: 0,
			checkedToday: false
		}

		if (uid) {
			const docs = await getCheckinDocs(uid)
			checkin = calcCheckinStats(docs.map(item => item.checkin_date), todayKey)
		}

		const [hotRes, knowledgeRes] = await Promise.all([
			hotCollection.where({ status: 'published', is_recommend: true }).orderBy('publish_at', 'desc').limit(3).get(),
			knowledgeCollection.where({ status: 'published', is_recommend: true }).orderBy('updated_at', 'desc').limit(3).get()
		])

		return {
			checkin,
			hotList: (hotRes.data || []).map(item => buildArticleCard(item, 'hot')),
			knowledgeList: (knowledgeRes.data || []).map(item => buildArticleCard(item, 'knowledge'))
		}
	},

	async getMineSummary() {
		const uid = await getCurrentUid(this)
		if (!uid) {
			throw new Error('UNAUTHORIZED')
		}

		const todayKey = formatDayKey()
		const docs = await getCheckinDocs(uid)
		const stats = calcCheckinStats(docs.map(item => item.checkin_date), todayKey)
		return {
			streak: stats.streak,
			total: stats.total,
			calendar: docs.map(item => item.checkin_date)
		}
	}
}
