<template>
	<view class="we-page">
		<view class="we-status">
			<text>9:41</text>
			<text class="we-status__signal"></text>
		</view>

		<view class="we-topbar">
			<view class="we-topbar__copy">
				<view class="we-topbar__intro">{{ knowledge.subtitle }}</view>
				<view class="we-topbar__title secondary-title">{{ knowledge.title }}</view>
			</view>
			<view class="we-avatar">K</view>
		</view>

		<view class="we-filters">
			<text
				v-for="filter in knowledge.filters"
				:key="filter"
				class="we-filter"
				:class="{ 'we-filter--active': knowledge.activeFilter === filter }"
				@click="selectFilter(filter)"
			>
				{{ filter }}
			</text>
		</view>

		<warm-story-card v-for="(item, index) in knowledge.list" :key="index" :item="item" @select="goDetail" />
	</view>
</template>

<script setup>
import { reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import WarmStoryCard from '@/components/warm-story-card.vue'
import { getKnowledgeContent } from '@/utils/mock-content.js'
import { getKnowledgeCategories, getKnowledgeList } from '@/services/content.js'

const knowledge = reactive({
	...getKnowledgeContent(),
	activeFilter: '全部'
})

async function loadKnowledgeCategories() {
	try {
		const filters = await getKnowledgeCategories()
		if (filters && filters.length) {
			knowledge.filters = filters
			if (!filters.includes(knowledge.activeFilter)) {
				knowledge.activeFilter = filters[0]
			}
		}
	} catch (error) {
		console.error('loadKnowledgeCategories failed', error)
	}
}

async function loadKnowledge() {
	try {
		const list = await getKnowledgeList({
			page: 1,
			pageSize: 10,
			category: knowledge.activeFilter
		})
		if (list && list.length) {
			knowledge.list = list
		}
	} catch (error) {
		console.error('loadKnowledge failed', error)
	}
}

function goDetail(item) {
	uni.navigateTo({
		url: item && item.id ? `/pages/content/detail?id=${item.id}&type=${item.type || 'knowledge'}` : '/pages/content/detail'
	})
}

function selectFilter(filter) {
	if (!filter || knowledge.activeFilter === filter) {
		return
	}
	knowledge.activeFilter = filter
	loadKnowledge()
}

onShow(async () => {
	await loadKnowledgeCategories()
	loadKnowledge()
})
</script>

<style lang="scss" scoped>
.secondary-title {
	font-size: 46rpx;
	line-height: 1.16;
}
</style>
