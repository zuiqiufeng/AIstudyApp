const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function readSource(relativePath) {
	return fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8')
}

test('tab pages refresh remote content when shown again', () => {
	const targets = [
		'pages/index/index.vue',
		'pages/hot/index.vue',
		'pages/knowledge/index.vue'
	]

	for (const file of targets) {
		const source = readSource(file)
		assert.match(source, /onShow\s*\(/, `${file} should refresh onShow`)
	}
})
