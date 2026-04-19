import mockContent from '@/static/mock-ui-content.json'

function cloneSection(value) {
  return JSON.parse(JSON.stringify(value))
}

export function getMockContent() {
  return cloneSection(mockContent)
}

export function getHomeContent() {
  return cloneSection(mockContent.home)
}

export function getHotContent() {
  return cloneSection(mockContent.hot)
}

export function getKnowledgeContent() {
  return cloneSection(mockContent.knowledge)
}

export function getDetailContent() {
  return cloneSection(mockContent.detail)
}

export function getMineContent() {
  return cloneSection(mockContent.mine)
}

export function getFavoritesContent() {
  return cloneSection(mockContent.favorites)
}

export function getHistoryContent() {
  return cloneSection(mockContent.history)
}
