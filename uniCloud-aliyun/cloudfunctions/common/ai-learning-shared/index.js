function pad(value) {
	return String(value).padStart(2, '0')
}

function formatDayKey(input = new Date()) {
	const date = new Date(input)
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatDisplayTime(input) {
	if (!input) return ''
	const date = new Date(input)
	if (Number.isNaN(date.getTime())) return String(input)
	return `${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

function previousDayKey(dayKey) {
	const date = new Date(`${dayKey}T00:00:00+08:00`)
	date.setDate(date.getDate() - 1)
	return formatDayKey(date)
}

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
		cursor = previousDayKey(cursor)
	}

	return {
		streak,
		total: uniqueKeys.length,
		checkedToday: true
	}
}

function buildArticleCard(doc = {}, type = 'hot') {
	const badge = type === 'hot' ? (doc.is_top ? '置顶' : '热点') : (doc.category || '知识')
	const summary = (doc.summary || doc.intro || '').trim()
	const tags = Array.isArray(doc.tags) && doc.tags.length ? doc.tags : (doc.category ? [doc.category] : [])
	return {
		id: doc._id || '',
		type,
		badge,
		cover: String(doc.cover || '').trim(),
		time: formatDisplayTime(doc.publish_at || doc.updated_at || doc.created_at),
		title: doc.title || '',
		summary,
		tags
	}
}

function normalizeBlocks(blocks = [], fallbackContent = '') {
	const normalized = (Array.isArray(blocks) ? blocks : [])
		.map((item, index) => ({
			title: String(item && item.title ? item.title : `正文 ${index + 1}`).trim(),
			body: String(item && item.body ? item.body : '').trim(),
			quote: Boolean(item && item.quote)
		}))
		.filter(item => item.title || item.body)

	if (normalized.length) {
		return normalized
	}

	return [{
		title: '正文',
		body: String(fallbackContent || '').trim(),
		quote: false
	}]
}

function buildArticleDetail(doc = {}, type = 'hot', favorite = false) {
	return {
		id: doc._id || '',
		type,
		category: type === 'hot' ? '热点解读' : (doc.category || '知识'),
		time: formatDisplayTime(doc.publish_at || doc.updated_at || doc.created_at),
		title: doc.title || '',
		summary: String(doc.summary || doc.intro || '').trim(),
		cover: String(doc.cover || '').trim(),
		tags: Array.isArray(doc.tags) && doc.tags.length ? doc.tags : (doc.category ? [doc.category] : []),
		blocks: normalizeBlocks(doc.blocks, doc.content),
		source_name: String(doc.source_name || '').trim(),
		source_url: String(doc.source_url || '').trim(),
		level: String(doc.level || '').trim(),
		read_minutes: Number.isFinite(Number(doc.read_minutes)) ? Number(doc.read_minutes) : 0,
		audience: String(doc.audience || '').trim(),
		favorite: Boolean(favorite)
	}
}

async function resolveAuthInfo(context = {}) {
	if (context.authInfo && context.authInfo.uid) {
		return context.authInfo
	}

	if (
		typeof context.getUniIdToken !== 'function' ||
		typeof context.getClientInfo !== 'function'
	) {
		return null
	}

	const token = context.getUniIdToken()
	if (!token) {
		return null
	}

	const uniID = require('uni-id-common').createInstance({
		clientInfo: context.getClientInfo()
	})
	const authInfo = await uniID.checkToken(token)

	if (!authInfo || authInfo.errCode || !authInfo.uid) {
		return null
	}

	return authInfo
}

module.exports = {
	formatDayKey,
	formatDisplayTime,
	calcCheckinStats,
	buildArticleCard,
	buildArticleDetail,
	resolveAuthInfo
}
