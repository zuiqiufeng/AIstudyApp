const growthCo = uniCloud.importObject('ai-growth-co', {
	customUI: true
})

export function getHomeSummary() {
	return growthCo.getHomeSummary()
}

export function submitCheckin() {
	return growthCo.checkin()
}

export function getMineSummary() {
	return growthCo.getMineSummary()
}
