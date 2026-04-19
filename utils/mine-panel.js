function normalizeDate(input) {
	if (!input) {
		return null
	}
	if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
		const [year, month, day] = input.split('-').map(Number)
		return new Date(year, month - 1, day)
	}
	const date = new Date(input)
	if (Number.isNaN(date.getTime())) {
		return null
	}
	return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDayKey(input) {
	const date = normalizeDate(input)
	if (!date) {
		return ''
	}
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export function buildCheckinGrid(calendar = [], total = 21) {
	return Array.from({ length: total }, (_, index) => {
		const signed = Boolean(calendar[index])

		return {
			index: index + 1,
			signed,
			icon: signed ? 'check' : ''
		}
	})
}

export function buildRecentCheckinCalendar(dayKeys = [], total = 21, endDate = new Date()) {
	const end = normalizeDate(endDate)
	if (!end) {
		return Array.from({ length: total }, () => 0)
	}

	const signedSet = new Set(
		dayKeys
			.map(item => formatDayKey(item))
			.filter(Boolean)
	)
	const start = new Date(end)
	start.setDate(start.getDate() - total + 1)

	return Array.from({ length: total }, (_, index) => {
		const current = new Date(start)
		current.setDate(start.getDate() + index)
		return signedSet.has(formatDayKey(current)) ? 1 : 0
	})
}
