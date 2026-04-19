const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function assertPasswordSecrets(configPath) {
	const config = readJson(configPath)
	assert.ok(Array.isArray(config.passwordSecret), `${configPath} should define passwordSecret as an array`)
	assert.ok(config.passwordSecret.length >= 2, `${configPath} should keep at least two passwordSecret versions`)

	config.passwordSecret.forEach((secret, index) => {
		assert.equal(typeof secret.value, 'string', `${configPath} passwordSecret[${index}] must define a string value`)
		assert.ok(secret.value.trim().length > 0, `${configPath} passwordSecret[${index}] must not be empty`)
	})
}

test('uni-id config password secrets are fully defined in mini program and admin projects', () => {
	const miniProgramConfig = path.resolve(__dirname, '../../uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json')
	const adminConfig = path.resolve(__dirname, '../../../AI知识管理系统/uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json')

	assertPasswordSecrets(miniProgramConfig)
	assertPasswordSecrets(adminConfig)
})
