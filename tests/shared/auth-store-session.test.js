const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function readSource(relativePath) {
	return fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8')
}

test('auth store keeps login state from token and only clears it on unauthorized errors', () => {
	const source = readSource('uni_modules/uni-id-pages/common/store.js')

	assert.match(source, /import\s+\{\s*isCloudUnauthorizedError\s*\}\s+from\s+'@\/utils\/cloud-auth\.js'/)
	assert.match(source, /function hasValidLoginState\(userInfo = \{\}\)/)
	assert.match(source, /tokenExpired > Date\.now\(\)/)
	assert.match(source, /hasLogin:\s*hasValidLoginState\(hostUserInfo\)/)
	assert.match(source, /store\.hasLogin = hasValidLoginState\(store\.userInfo\)/)
	assert.match(source, /if \(isCloudUnauthorizedError\(e\)\) \{\s*this\.setUserInfo\(\{\},\s*\{cover:true\}\)/)
	assert.match(source, /loginSuccess\(e = \{\}\)\{[\s\S]*store\.hasLogin = true/)
})
