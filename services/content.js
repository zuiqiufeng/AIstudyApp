const contentCo = uniCloud.importObject('ai-content-co', {
	customUI: true
})

export function getHotList(params) {
	return contentCo.listHotArticles(params)
}

export function getHotFilters() {
	return contentCo.listHotFilters()
}

export function getKnowledgeList(params) {
	return contentCo.listKnowledgeArticles(params)
}

export function getKnowledgeCategories() {
	return contentCo.listKnowledgeCategories()
}

export function getContentDetail(params) {
	return contentCo.getArticleDetail(params)
}

export function toggleFavorite(params) {
	return contentCo.toggleFavorite(params)
}

export function getFavoritesList() {
	return contentCo.listFavorites()
}

export function getHistoryList() {
	return contentCo.listHistory()
}
