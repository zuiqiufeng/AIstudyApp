const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function readSource(relativePath) {
	return fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8')
}

test('favorites and history pages navigate to detail with article identity', () => {
	const favorites = readSource('pages/mine/favorites.vue')
	const history = readSource('pages/mine/history.vue')

	assert.match(favorites, /function goDetail\(item\)/)
	assert.match(favorites, /url:\s*item && item\.id \? `\/pages\/content\/detail\?id=\$\{item\.id\}&type=\$\{item\.type \|\| 'hot'\}` : '\/pages\/content\/detail'/)
	assert.match(history, /function goDetail\(item\)/)
	assert.match(history, /url:\s*item && item\.id \? `\/pages\/content\/detail\?id=\$\{item\.id\}&type=\$\{item\.type \|\| 'hot'\}` : '\/pages\/content\/detail'/)
})

test('favorites page marks collected content for star rendering', () => {
	const favorites = readSource('pages/mine/favorites.vue')

	assert.match(favorites, /list\.map\(item => \(\{/)
	assert.match(favorites, /favorite:\s*true/)
})

test('detail page and cloud object expose favorite state for the current article', () => {
	const detail = readSource('pages/content/detail.vue')
	const cloud = readSource('uniCloud-aliyun/cloudfunctions/ai-content-co/index.obj.js')

	assert.match(detail, /const favoriteState = reactive\(/)
	assert.match(detail, /favoriteState\.active = Boolean\(result\.favorite\)/)
	assert.match(detail, /\{\{\s*favoriteState\.active \? '已收藏' : '收藏文章'\s*\}\}/)
	assert.match(detail, /floating-btn__star/)
	assert.match(detail, /favoriteState\.active = Boolean\(result\.favorite\)/)
	assert.match(detail, /if \(isCloudUnauthorizedError\(error\)\)/)
	assert.match(detail, /title:\s*'登录状态已失效，请重新登录'/)
	assert.match(cloud, /async getArticleDetail[\s\S]*favoriteCollection\.where\(\{[\s\S]*user_id: uid[\s\S]*target_id: id[\s\S]*target_type: type[\s\S]*\}\)\.get\(\)/)
	assert.match(cloud, /async getArticleDetail[\s\S]*return buildArticleDetail\(article, type, favorite\)/)
})

test('detail page renders rich backend fields and cloud object uses shared detail mapping', () => {
	const detail = readSource('pages/content/detail.vue')
	const cloud = readSource('uniCloud-aliyun/cloudfunctions/ai-content-co/index.obj.js')

	assert.match(detail, /<image v-if="detail\.cover"/)
	assert.match(detail, /detail\.level/)
	assert.match(detail, /detail\.read_minutes/)
	assert.match(detail, /detail\.audience/)
	assert.match(detail, /detail\.source_name/)
	assert.match(detail, /detail\.source_url/)
	assert.match(cloud, /buildArticleDetail/)
})
