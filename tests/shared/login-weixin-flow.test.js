const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function readSource(relativePath) {
	return fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8')
}

test('weixin login flow guards against missing code and only enables onlyAuthorize for app builds', () => {
	const source = readSource('uni_modules/uni-id-pages/components/uni-id-pages-fab-login/uni-id-pages-fab-login.vue')

	assert.match(source, /const loginOptions = \{/)
	assert.match(source, /if \(type === 'weixin' && !e\.code\)/)
	assert.match(source, /if \(type === 'weixin' && \(!params \|\| !params\.code\)\)/)
	assert.match(source, /JSON\.stringify\(\{\s*hasCode: !!params\.code,/)
	assert.match(source, /result\.newToken\?\.token && result\.newToken\?\.tokenExpired/)
	assert.match(source, /uni\.setStorageSync\('uni_id_token', result\.newToken\.token\)/)
	assert.match(source, /uni\.setStorageSync\('uni_id_token_expired', result\.newToken\.tokenExpired\)/)
	assert.match(source, /微信登录失败/)
	assert.match(source, /loginOptions\.onlyAuthorize = true/)
})
