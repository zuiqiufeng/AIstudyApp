const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function readSource(relativePath) {
	return fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8')
}

test('cloud objects import the shared ai-learning module using deploy-safe module resolution', () => {
	const growth = readSource('uniCloud-aliyun/cloudfunctions/ai-growth-co/index.obj.js')
	const content = readSource('uniCloud-aliyun/cloudfunctions/ai-content-co/index.obj.js')

	assert.match(growth, /require\('ai-learning-shared'\)/)
	assert.match(content, /require\('ai-learning-shared'\)/)
})

test('shared ai-learning common module exposes a package descriptor for cloud deployment', () => {
	const packagePath = path.join(
		__dirname,
		'../..',
		'uniCloud-aliyun/cloudfunctions/common/ai-learning-shared/package.json'
	)

	assert.equal(fs.existsSync(packagePath), true)

	const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

	assert.equal(pkg.name, 'ai-learning-shared')
	assert.equal(pkg.main, 'index.js')
})

test('cloud objects declare ai-learning-shared as a packaged dependency for deployment', () => {
	const cloudFunctions = ['ai-growth-co', 'ai-content-co']

	cloudFunctions.forEach((name) => {
		const packagePath = path.join(
			__dirname,
			'../..',
			`uniCloud-aliyun/cloudfunctions/${name}/package.json`
		)

		assert.equal(fs.existsSync(packagePath), true)

		const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

		assert.equal(pkg.dependencies['ai-learning-shared'], 'file:../common/ai-learning-shared')
	})
})
