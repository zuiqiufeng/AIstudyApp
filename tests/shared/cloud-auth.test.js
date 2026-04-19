import test from 'node:test'
import assert from 'node:assert/strict'

import { isCloudUnauthorizedError } from '../../utils/cloud-auth.js'

test('isCloudUnauthorizedError matches cloud unauthorized and token-invalid responses', () => {
	assert.equal(isCloudUnauthorizedError(new Error('UNAUTHORIZED')), true)
	assert.equal(isCloudUnauthorizedError({ errMsg: '[ai-content-co]: UNAUTHORIZED' }), true)
	assert.equal(isCloudUnauthorizedError({ message: 'uni-id-check-token-failed' }), true)
	assert.equal(isCloudUnauthorizedError({ errCode: 'uni-id-token-expired' }), true)
})

test('isCloudUnauthorizedError ignores unrelated cloud errors', () => {
	assert.equal(isCloudUnauthorizedError(new Error('ARTICLE_NOT_FOUND')), false)
	assert.equal(isCloudUnauthorizedError({ errMsg: '获取第三方账号失败' }), false)
	assert.equal(isCloudUnauthorizedError(null), false)
})
