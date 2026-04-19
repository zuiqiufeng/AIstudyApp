const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function readSource(relativePath) {
	return fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8')
}

test('knowledge page supports dynamic category filters from the backend', () => {
	const source = readSource('pages/knowledge/index.vue')

	assert.match(source, /getKnowledgeCategories/)
	assert.match(source, /knowledge\.activeFilter === filter/)
	assert.match(source, /@click="selectFilter\(filter\)"/)
	assert.match(source, /category:\s*knowledge\.activeFilter/)
})

test('content service and cloud object expose knowledge category options', () => {
	const service = readSource('services/content.js')
	const cloud = readSource('uniCloud-aliyun/cloudfunctions/ai-content-co/index.obj.js')

	assert.match(service, /export function getKnowledgeCategories\(\)/)
	assert.match(service, /contentCo\.listKnowledgeCategories\(\)/)
	assert.match(cloud, /const categoryCollection = db\.collection\('ai_content_category'\)/)
	assert.match(cloud, /async listKnowledgeCategories\(\)/)
	assert.match(cloud, /where\(\{ status: 'enabled' \}\)/)
	assert.match(cloud, /return \['全部', \.\.\./)
})
