const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function readSource(relativePath) {
	return fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8')
}

test('auth-required pages redirect to login when cloud auth becomes invalid', () => {
	const detail = readSource('pages/content/detail.vue')
	const home = readSource('pages/index/index.vue')
	const mine = readSource('pages/mine/index.vue')
	const favorites = readSource('pages/mine/favorites.vue')
	const history = readSource('pages/mine/history.vue')

	assert.match(detail, /isCloudUnauthorizedError/)
	assert.match(detail, /if \(isCloudUnauthorizedError\(error\)\)/)
	assert.match(detail, /goLogin\(\)/)

	assert.match(home, /isCloudUnauthorizedError/)
	assert.match(home, /if \(isCloudUnauthorizedError\(error\)\)/)
	assert.match(home, /goLogin\(\)/)

	assert.match(mine, /isCloudUnauthorizedError/)
	assert.match(mine, /if \(isCloudUnauthorizedError\(error\)\)/)
	assert.match(mine, /goLogin\(\)/)
	assert.match(mine, /onShow\(\(\) =>/)

	assert.match(favorites, /isCloudUnauthorizedError/)
	assert.match(favorites, /if \(isCloudUnauthorizedError\(error\)\)/)
	assert.match(favorites, /goLogin\(\)/)
	assert.match(favorites, /onShow\(\(\) =>/)

	assert.match(history, /isCloudUnauthorizedError/)
	assert.match(history, /if \(isCloudUnauthorizedError\(error\)\)/)
	assert.match(history, /goLogin\(\)/)
	assert.match(history, /onShow\(\(\) =>/)
})
