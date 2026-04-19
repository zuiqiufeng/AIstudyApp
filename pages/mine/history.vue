<template>
	<view class="we-page">
		<view class="we-status">
			<text>9:41</text>
			<text class="we-status__signal"></text>
		</view>

		<view class="we-backbar">
			<text class="we-back" @click="goBack">返回</text>
			<text>{{ history.period }}</text>
		</view>

		<view class="we-topbar compact-topbar">
			<view class="we-topbar__copy">
				<view class="we-topbar__intro">{{ history.subtitle }}</view>
				<view class="we-topbar__title compact-title">{{ history.title }}</view>
			</view>
		</view>

		<warm-story-card v-for="(item, index) in history.list" :key="index" :item="item" @select="goDetail" />
		<view class="we-card empty-card">暂无更早记录</view>
	</view>
</template>

<script setup>
import { reactive } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import WarmStoryCard from '@/components/warm-story-card.vue'
import { isCloudUnauthorizedError } from '@/utils/cloud-auth.js'
import { getHistoryContent } from '@/utils/mock-content.js'
import { getHistoryList } from '@/services/content.js'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'

const history = reactive(getHistoryContent())

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

async function loadHistory() {
	if (!store.hasLogin) {
		return
	}
	try {
		const list = await getHistoryList()
		if (list && list.length) {
			history.list = list
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
		console.error('loadHistory failed', error)
	}
}

onLoad(() => {
	loadHistory()
})

onShow(() => {
	loadHistory()
})
</script>

<style lang="scss" scoped>
.compact-topbar {
	margin-bottom: 16rpx;
}

.compact-title {
	font-size: 48rpx;
}

.empty-card {
	padding: 40rpx 28rpx;
	text-align: center;
	color: $we-ink-body;
	font-size: 26rpx;
}
</style>
