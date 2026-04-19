<template>
	<view class="we-page">
		<view class="we-status">
			<text>9:41</text>
			<text class="we-status__signal"></text>
		</view>

		<view class="we-backbar">
			<text class="we-back" @click="goBack">返回</text>
			<text>{{ favorites.count }}</text>
		</view>

		<view class="we-topbar compact-topbar">
			<view class="we-topbar__copy">
				<view class="we-topbar__intro">{{ favorites.subtitle }}</view>
				<view class="we-topbar__title compact-title">{{ favorites.title }}</view>
			</view>
		</view>

		<view class="we-filters">
			<text v-for="(filter, index) in favorites.filters" :key="filter" class="we-filter" :class="{ 'we-filter--active': index === 0 }">{{ filter }}</text>
		</view>

		<warm-story-card v-for="(item, index) in favorites.list" :key="index" :item="item" @select="goDetail" />
	</view>
</template>

<script setup>
import { reactive } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import WarmStoryCard from '@/components/warm-story-card.vue'
import { isCloudUnauthorizedError } from '@/utils/cloud-auth.js'
import { getFavoritesContent } from '@/utils/mock-content.js'
import { getFavoritesList } from '@/services/content.js'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'

const favorites = reactive(getFavoritesContent())

function goBack() {
	uni.navigateBack()
}

function goLogin() {
	uni.navigateTo({
		url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd?type=weixin'
	})
}

function goDetail(item) {
	uni.navigateTo({
		url: item && item.id ? `/pages/content/detail?id=${item.id}&type=${item.type || 'hot'}` : '/pages/content/detail'
	})
}

async function loadFavorites() {
	if (!store.hasLogin) {
		return
	}
	try {
		const list = await getFavoritesList()
		if (list && list.length) {
			const starredList = list.map(item => ({
				...item,
				favorite: true
			}))
			favorites.list = starredList
			favorites.count = `已收藏 ${starredList.length} 条`
		}
	} catch (error) {
		if (isCloudUnauthorizedError(error)) {
			uni.showToast({
				title: '登录状态已失效，请重新登录',
				icon: 'none'
			})
			goLogin()
			return
		}
		console.error('loadFavorites failed', error)
	}
}

onLoad(() => {
	loadFavorites()
})

onShow(() => {
	loadFavorites()
})
</script>

<style lang="scss" scoped>
.compact-topbar {
	margin-bottom: 16rpx;
}

.compact-title {
	font-size: 48rpx;
}
</style>
