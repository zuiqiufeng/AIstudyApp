function normalizeErrorText(error) {
	if (!error) {
		return ''
	}

	const parts = [
		error.message,
		error.errMsg,
		error.errCode,
		error.code,
		typeof error === 'string' ? error : ''
	]

	return parts
		.filter(Boolean)
		.map(item => String(item).toUpperCase())
		.join(' ')
}

export function isCloudUnauthorizedError(error) {
	const text = normalizeErrorText(error)

	return [
		'UNAUTHORIZED',
		'UNI-ID-CHECK-TOKEN-FAILED',
		'UNI-ID-TOKEN-EXPIRED',
		'TOKEN_INVALID',
		'TOKEN_EXPIRED'
	].some(keyword => text.includes(keyword))
}
