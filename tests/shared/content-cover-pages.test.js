const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function readSource(relativePath) {
	return fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8')
}

test('story cards render backend cover images when available', () => {
	const source = readSource('components/warm-story-card.vue')

	assert.match(source, /<image v-if="item\.cover"/)
	assert.match(source, /:src="item\.cover"/)
})

test('story cards show a favorite star only for collected content', () => {
	const source = readSource('components/warm-story-card.vue')

	assert.match(source, /v-if="item\.favorite"/)
	assert.match(source, /we-list-card__favorite/)
	assert.match(source, /★/)
})

test('hot page promotes the first backend article into the featured cover card', () => {
	const source = readSource('pages/hot/index.vue')

	assert.match(source, /<image v-if="hot\.featured\.cover"/)
	assert.match(source, /function applyHotList\(list = \[\]\)/)
	assert.match(source, /const \[featured, \.\.\.rest\] = list/)
	assert.match(source, /hot\.featured = \{/)
	assert.match(source, /cover: featured\.cover \|\| hot\.featured\.cover/)
	assert.match(source, /hot\.list = rest/)
})
