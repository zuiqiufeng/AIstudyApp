<template>
	<view class="we-page detail-page">
		<view class="we-status">
			<text>9:41</text>
			<text class="we-status__signal"></text>
		</view>

		<view class="we-backbar">
			<text class="we-back" @click="goBack">返回</text>
			<text>收藏 · 分享</text>
		</view>

		<image v-if="detail.cover" class="detail-cover" :src="detail.cover" mode="aspectFill" />

		<view class="we-list-card__top detail-meta">
			<text class="we-chip we-chip--accent">{{ detail.category }}</text>
			<text>{{ detail.time }}</text>
		</view>
		<view class="detail-title">{{ detail.title }}</view>
		<view class="detail-summary">{{ detail.summary }}</view>

		<view v-if="detail.level || detail.read_minutes || detail.audience" class="detail-facts">
			<text v-if="detail.level" class="detail-fact">{{ levelText(detail.level) }}</text>
			<text v-if="detail.read_minutes" class="detail-fact">{{ detail.read_minutes }} 分钟可读</text>
			<text v-if="detail.audience" class="detail-fact">{{ detail.audience }}</text>
		</view>

		<view class="we-tag-row detail-tags">
			<text v-for="tag in detail.tags" :key="tag" class="we-chip we-chip--soft">{{ tag }}</text>
		</view>

		<view v-if="detail.source_name || detail.source_url" class="detail-source" @click="copySourceUrl">
			<view class="detail-source__label">内容来源</view>
			<view class="detail-source__name">{{ detail.source_name || '外部资料' }}</view>
			<view v-if="detail.source_url" class="detail-source__url">{{ detail.source_url }}</view>
			<view v-if="detail.source_url" class="detail-source__action">点击复制链接</view>
		</view>

		<view v-for="block in detail.blocks" :key="block.title" class="detail-block">
			<view class="detail-block__title">{{ block.title }}</view>
			<view class="detail-block__body" :class="{ 'detail-block__body--quote': block.quote }">{{ block.body }}</view>
		</view>

		<view class="floating-actions">
			<view
				class="floating-btn floating-btn--secondary"
				:class="{ 'floating-btn--secondary-active': favoriteState.active }"
				@click="handleFavorite"
			>
				<text v-if="favoriteState.active" class="floating-btn__star">★</text>
				<text>{{ favoriteState.active ? '已收藏' : '收藏文章' }}</text>
			</view>
			<view class="floating-btn floating-btn--primary">继续阅读</view>
		</view>
	</view>
</template>

<script setup>
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { isCloudUnauthorizedError } from '@/utils/cloud-auth.js'
import { getDetailContent } from '@/utils/mock-content.js'
import { getContentDetail, toggleFavorite } from '@/services/content.js'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'

const detail = reactive(getDetailContent())
const favoriteState = reactive({
	active: false
})
let currentArticle = {
	id: '',
	type: 'hot'
}

function levelText(level) {
	if (level === 'beginner') return '入门'
	if (level === 'intermediate') return '进阶'
	if (level === 'advanced') return '高级'
	return level || ''
}

function goBack() {
	uni.navigateBack({
		fail() {
			uni.switchTab({
				url: '/pages/index/index'
			})
		}
	})
}

async function loadDetail(options) {
	if (!options.id) {
		favoriteState.active = false
		return
	}
	currentArticle = {
		id: options.id,
		type: options.type || 'hot'
	}
	try {
		const result = await getContentDetail(currentArticle)
		Object.assign(detail, result)
		favoriteState.active = Boolean(result.favorite)
	} catch (error) {
		favoriteState.active = false
		console.error('loadDetail failed', error)
	}
}

function goLogin() {
	uni.navigateTo({
		url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd?type=weixin'
	})
}

async function handleFavorite() {
	if (!currentArticle.id) {
		uni.showToast({
			title: '示例内容暂不支持收藏',
			icon: 'none'
		})
		return
	}
	if (!store.hasLogin) {
		goLogin()
		return
	}
	try {
		const result = await toggleFavorite(currentArticle)
		favoriteState.active = Boolean(result.favorite)
		uni.showToast({
			title: result.favorite ? '已收藏' : '已取消收藏',
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
		console.error('toggleFavorite failed', error)
		uni.showToast({
			title: '操作失败，请稍后重试',
			icon: 'none'
		})
	}
}

function copySourceUrl() {
	if (!detail.source_url) {
		return
	}
	uni.setClipboardData({
		data: detail.source_url
	})
}

onLoad((options) => {
	loadDetail(options || {})
})
</script>

<style lang="scss" scoped>
.detail-page {
	padding-bottom: 190rpx;
}

.detail-meta {
	margin-bottom: 14rpx;
}

.detail-cover {
	width: 100%;
	height: 360rpx;
	margin-bottom: 18rpx;
	border-radius: 34rpx;
	background: #f2f4f7;
}

.detail-title {
	font-size: 58rpx;
	line-height: 1.08;
	letter-spacing: -0.04em;
	font-weight: 700;
}

.detail-summary {
	margin-top: 14rpx;
	color: $we-ink-body;
	font-size: 28rpx;
	line-height: 1.85;
}

.detail-tags {
	margin-top: 18rpx;
}

.detail-facts {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 18rpx;
}

.detail-fact {
	display: inline-flex;
	align-items: center;
	padding: 12rpx 18rpx;
	border-radius: 999rpx;
	background: #f6f1ea;
	color: $we-ink-body;
	font-size: 22rpx;
	font-weight: 700;
}

.detail-source {
	margin-top: 20rpx;
	padding: 26rpx;
	border-radius: 28rpx;
	border: 1rpx solid $we-line;
	background: #fffdfa;
	box-shadow: $we-shadow;
}

.detail-source__label {
	color: $we-ink-soft;
	font-size: 20rpx;
	letter-spacing: 0.06em;
}

.detail-source__name {
	margin-top: 10rpx;
	font-size: 30rpx;
	font-weight: 700;
}

.detail-source__url {
	margin-top: 10rpx;
	color: $we-ink-body;
	font-size: 22rpx;
	line-height: 1.6;
	word-break: break-all;
}

.detail-source__action {
	margin-top: 12rpx;
	color: $we-accent;
	font-size: 22rpx;
	font-weight: 700;
}

.detail-block {
	margin-top: 22rpx;
	padding: 28rpx;
	border: 1rpx solid $we-line;
	border-radius: 32rpx;
	background: #fffdfa;
	box-shadow: $we-shadow;
}

.detail-block__title {
	font-size: 32rpx;
	font-weight: 700;
}

.detail-block__body {
	margin-top: 14rpx;
	color: $we-ink-body;
	font-size: 28rpx;
	line-height: 1.85;
}

.detail-block__body--quote {
	padding-left: 20rpx;
	border-left: 6rpx solid $we-accent;
}

.floating-actions {
	position: fixed;
	left: 28rpx;
	right: 28rpx;
	bottom: 24rpx;
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12rpx;
	padding: 20rpx;
	border-radius: 32rpx;
	border: 1rpx solid $we-line;
	background: rgba(255, 255, 255, 0.98);
	box-shadow: 0 14rpx 28rpx rgba(18, 26, 33, 0.08);
}

.floating-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	height: 84rpx;
	border: none;
	border-radius: 22rpx;
	font-size: 26rpx;
	line-height: 1;
	font-weight: 700;
}

.floating-btn--primary {
	color: #fff;
	background: $we-navy;
}

.floating-btn--secondary {
	color: $we-ink-body;
	background: #f7efe6;
	border: 1rpx solid $we-line;
}

.floating-btn--secondary-active {
	color: #8b5b00;
	background: #fff7db;
	border-color: #f2d78a;
}

.floating-btn__star {
	color: #e0a106;
	font-size: 28rpx;
	line-height: 1;
}
</style>
