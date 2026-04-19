<template>
	<view class="we-page">
		<view class="we-status">
			<text>9:41</text>
			<text class="we-status__signal"></text>
		</view>

		<view class="we-topbar">
			<view class="we-topbar__copy">
				<view class="we-topbar__intro">{{ hot.subtitle }}</view>
				<view class="we-topbar__title secondary-title">{{ hot.title }}</view>
			</view>
			<view class="we-avatar">H</view>
		</view>

		<view class="we-filters">
			<text
				v-for="filter in hot.filters"
				:key="filter"
				class="we-filter"
				:class="{ 'we-filter--active': hot.activeFilter === filter }"
				@click="selectFilter(filter)"
			>
				{{ filter }}
			</text>
		</view>

		<view class="we-card lead-card" @click="goDetail(hot.featured)">
			<image v-if="hot.featured.cover" class="lead-card__cover" :src="hot.featured.cover" mode="aspectFill" />
			<view class="we-list-card__top">
				<text class="we-chip we-chip--accent">{{ hot.featured.badge }}</text>
				<text>{{ hot.featured.issue }}</text>
			</view>
			<view class="lead-card__title">{{ hot.featured.title }}</view>
			<view class="lead-card__summary">{{ hot.featured.summary }}</view>
			<view class="we-tag-row">
				<text v-for="tag in hot.featured.tags" :key="tag" class="we-chip we-chip--soft">{{ tag }}</text>
			</view>
		</view>

		<warm-story-card v-for="(item, index) in hot.list" :key="index" :item="item" @select="goDetail" />
	</view>
</template>

<script setup>
import { reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import WarmStoryCard from '@/components/warm-story-card.vue'
import { getHotContent } from '@/utils/mock-content.js'
import { getHotFilters, getHotList } from '@/services/content.js'

const hotTemplate = getHotContent()
const hot = reactive({
	...hotTemplate,
	filters: ['全部', ...(hotTemplate.filters || [])],
	activeFilter: '全部'
})

function applyHotList(list = []) {
	if (!list.length) {
		hot.featured = {
			...hotTemplate.featured
		}
		hot.list = []
		return
	}

	const [featured, ...rest] = list
	hot.featured = {
		...hot.featured,
		...featured,
		issue: featured.time || hot.featured.issue,
		cover: featured.cover || hot.featured.cover
	}
	hot.list = rest
}

async function loadHotFilters() {
	try {
		const filters = await getHotFilters()
		if (filters && filters.length) {
			hot.filters = filters
			if (!filters.includes(hot.activeFilter)) {
				hot.activeFilter = filters[0]
			}
		}
	} catch (error) {
		console.error('loadHotFilters failed', error)
	}
}

async function loadHot() {
	try {
		const list = await getHotList({
			page: 1,
			pageSize: 10,
			filter: hot.activeFilter
		})
		applyHotList(list || [])
	} catch (error) {
		console.error('loadHot failed', error)
	}
}

function goDetail(item) {
	uni.navigateTo({
		url: item && item.id ? `/pages/content/detail?id=${item.id}&type=${item.type || 'hot'}` : '/pages/content/detail'
	})
}

function selectFilter(filter) {
	if (!filter || hot.activeFilter === filter) {
		return
	}
	hot.activeFilter = filter
	loadHot()
}

onShow(async () => {
	await loadHotFilters()
	loadHot()
})
</script>

<style lang="scss" scoped>
.lead-card {
	padding: 28rpx;
	margin-bottom: 16rpx;
	background: #fffdfa;
}

.lead-card__cover {
	width: 100%;
	height: 320rpx;
	margin-bottom: 22rpx;
	border-radius: 30rpx;
	background: #f2f4f7;
}

.lead-card__title {
	font-size: 42rpx;
	line-height: 1.16;
	letter-spacing: -0.03em;
	font-weight: 700;
}

.lead-card__summary {
	margin-top: 12rpx;
	color: $we-ink-body;
	font-size: 26rpx;
	line-height: 1.76;
}

.secondary-title {
	font-size: 46rpx;
	line-height: 1.16;
}
</style>
