const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function readSource(relativePath) {
	return fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8')
}

test('hot page supports backend-driven filters and forwards the active filter to the content service', () => {
	const page = readSource('pages/hot/index.vue')
	const service = readSource('services/content.js')
	const cloud = readSource('uniCloud-aliyun/cloudfunctions/ai-content-co/index.obj.js')

	assert.match(page, /getHotFilters/)
	assert.match(page, /hot\.activeFilter === filter/)
	assert.match(page, /@click="selectFilter\(filter\)"/)
	assert.match(page, /filter:\s*hot\.activeFilter/)
	assert.match(service, /export function getHotFilters\(\)/)
	assert.match(service, /contentCo\.listHotFilters\(\)/)
	assert.match(cloud, /async listHotFilters\(\)/)
})
