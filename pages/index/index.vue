<template>
	<view class="we-page">
		<view class="we-status">
			<text>9:41</text>
			<text class="we-status__signal"></text>
		</view>

		<view class="we-topbar">
			<view class="we-topbar__copy">
				<view class="we-topbar__intro">{{ home.greeting }}</view>
				<view v-if="home.title" class="we-topbar__title">{{ home.title }}</view>
			</view>
			<view class="we-avatar">L</view>
		</view>

		<warm-checkin-card :content="home.checkin" @submit="handleCheckin" @record="goMine" />

		<view class="we-section">
			<view class="we-section__head">
				<text class="we-section__title">今日热点</text>
				<text class="we-section__meta">编辑精选 3 条</text>
			</view>
			<warm-story-card
				v-for="(item, index) in home.hotList"
				:key="'hot-' + index"
				:item="{ ...item, accent: index === 0 }"
				@select="goDetail"
			/>
			<view class="section-link" @click="goHot">进入热点页</view>
		</view>

		<view class="we-section">
			<view class="we-section__head">
				<text class="we-section__title">知识精选</text>
				<text class="we-section__meta">今天适合读 5 分钟</text>
			</view>
			<warm-story-card
				v-for="(item, index) in home.knowledgeList"
				:key="'knowledge-' + index"
				:item="{ ...item, accent: true }"
				@select="goDetail"
			/>
			<view class="section-link" @click="goKnowledge">进入知识页</view>
		</view>
	</view>
</template>

<script setup>
import { reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import WarmCheckinCard from '@/components/warm-checkin-card.vue'
import WarmStoryCard from '@/components/warm-story-card.vue'
import { isCloudUnauthorizedError } from '@/utils/cloud-auth.js'
import { getHomeContent } from '@/utils/mock-content.js'
import { getHomeSummary, submitCheckin } from '@/services/growth.js'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'

const home = reactive(getHomeContent())

function applyCheckinState(summary = {}) {
	home.checkin.checkedToday = Boolean(summary.checkedToday)
	home.checkin.streak = summary.streak || 0
	home.checkin.stats = [
		{ label: '累计签到', value: String(summary.total || 0) },
		{ label: '本周完成', value: `${Math.min(summary.streak || 0, 7)}/7` },
		{ label: '今日状态', value: summary.checkedToday ? '已签' : '待签' }
	]
}

async function loadHome() {
	try {
		const summary = await getHomeSummary()
		applyCheckinState(summary.checkin || {})
		if (summary.hotList && summary.hotList.length) {
			home.hotList = summary.hotList
		}
		if (summary.knowledgeList && summary.knowledgeList.length) {
			home.knowledgeList = summary.knowledgeList
		}
	} catch (error) {
		console.error('loadHome failed', error)
	}
}

function goHot() {
	uni.switchTab({
		url: '/pages/hot/index'
	})
}

function goKnowledge() {
	uni.switchTab({
		url: '/pages/knowledge/index'
	})
}

function goMine() {
	uni.switchTab({
		url: '/pages/mine/index'
	})
}

function goDetail(item) {
	uni.navigateTo({
		url: item && item.id ? `/pages/content/detail?id=${item.id}&type=${item.type || 'hot'}` : '/pages/content/detail'
	})
}

function goLogin() {
	uni.navigateTo({
		url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd?type=weixin'
	})
}

async function handleCheckin() {
	if (!store.hasLogin) {
		goLogin()
		return
	}
	try {
		const result = await submitCheckin()
		applyCheckinState(result)
		uni.showToast({
			title: result.duplicate ? '今天已经签到过了' : '签到成功',
			icon: 'none'
		})
	} catch (error) {
		if (isCloudUnauthorizedError(error)) {
			uni.showToast({
				title: '登录状态已失效，请重新登录',
				icon: 'none'
			})
			goLogin()
			return
		}
		console.error('checkin failed', error)
		uni.showToast({
			title: '签到失败，请稍后重试',
			icon: 'none'
		})
	}
}

onShow(() => {
	loadHome()
})
</script>

<style lang="scss" scoped>
.section-link {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 84rpx;
	margin-top: 8rpx;
	border: none;
	border-radius: 24rpx;
	background: #f7efe6;
	color: $we-ink-body;
	font-size: 26rpx;
	line-height: 1;
	font-weight: 700;
}
</style>
