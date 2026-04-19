<template>
	<view class="we-page mine-page">
		<view class="we-status">
			<text>9:41</text>
			<text class="we-status__signal"></text>
		</view>

		<view class="panel-head">
			<view class="panel-head__eyebrow">个人学习面板</view>
			<view class="panel-head__title">签到与内容沉淀</view>
		</view>

		<view class="we-card profile-panel">
			<view class="profile-panel__top">
				<view class="profile-avatar">林</view>
				<view class="profile-panel__copy">
					<view class="profile-panel__name-row">
						<view class="profile-name">{{ mine.name }}</view>
						<text class="profile-chip">内容型成长</text>
					</view>
					<view class="profile-desc">{{ mine.description }}</view>
					<view class="profile-note">今天也适合先签到，再回看值得沉淀的 AI 内容。</view>
				</view>
			</view>

			<view class="profile-stats">
				<view v-for="(stat, index) in mine.stats" :key="index" class="profile-stat">
					<text class="profile-stat__label">{{ stat.label }}</text>
					<text class="profile-stat__value">{{ stat.value }}</text>
				</view>
			</view>
		</view>

		<view class="we-card checkin-card">
			<view class="checkin-card__head">
				<view>
					<view class="checkin-card__title">签到记录</view>
					<view class="checkin-card__meta">{{ mine.checkinSummary }}</view>
				</view>
				<text class="checkin-card__tag">已签显示对号</text>
			</view>

			<view class="checkin-grid">
				<view
					v-for="cell in mine.checkinGrid"
					:key="cell.index"
					class="checkin-grid__cell"
					:class="{ 'checkin-grid__cell--signed': cell.signed }"
				>
					<text v-if="cell.signed" class="checkin-grid__icon">✓</text>
				</view>
			</view>
		</view>

		<view
			v-for="(menu, index) in mine.menus"
			:key="menu.title"
			class="we-card shortcut-card"
			@click="handleMenu(index)"
		>
			<view class="shortcut-card__copy">
				<text class="shortcut-card__title">{{ menu.title }}</text>
				<text class="shortcut-card__desc">{{ menu.description }}</text>
			</view>
			<view class="shortcut-card__meta">
				<text class="shortcut-card__hint">{{ menu.hint }}</text>
				<text class="shortcut-card__arrow"></text>
			</view>
				</view>
	</view>
</template>

<script setup>
import { reactive } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { isCloudUnauthorizedError } from '@/utils/cloud-auth.js'
import { getMineContent } from '@/utils/mock-content.js'
import { buildCheckinGrid, buildRecentCheckinCalendar } from '@/utils/mine-panel.js'
import { getMineSummary } from '@/services/growth.js'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'

const mine = reactive({
	...getMineContent(),
	checkinGrid: [],
	checkinSummary: ''
})

function applyMinePanel(calendar = [], streak = 0, total = 0) {
	mine.stats = [
		{ label: '连续签到', value: String(streak || 0) },
		{ label: '累计签到', value: String(total || 0) }
	]
	mine.checkinGrid = buildCheckinGrid(calendar, 21)
	mine.checkinSummary = `最近 ${mine.checkinGrid.filter(item => item.signed).length} 天已完成签到`
	mine.menus = mine.menus.map((item, index) => ({
		...item,
		hint: index === 0 ? '管理内容' : index === 1 ? '继续回看' : '账户设置'
	}))
}

async function loadMineSummary() {
	if (!store.hasLogin) {
		return
	}
	try {
		const result = await getMineSummary()
		const calendar = buildRecentCheckinCalendar(result.calendar || [], 21)
		applyMinePanel(calendar, result.streak || 0, result.total || 0)
	} catch (error) {
		if (isCloudUnauthorizedError(error)) {
			uni.showToast({
				title: '登录状态已失效，请重新登录',
				icon: 'none'
			})
			goLogin()
			return
		}
		console.error('loadMineSummary failed', error)
	}
}

function goLogin() {
	uni.navigateTo({
		url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd?type=weixin'
	})
}

function handleMenu(index) {
	if (index === 0) {
		uni.navigateTo({ url: '/pages/mine/favorites' })
		return
	}

	if (index === 1) {
		uni.navigateTo({ url: '/pages/mine/history' })
		return
	}

	uni.navigateTo({
		url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo?showLoginManage=true'
	})
}

onLoad(() => {
	applyMinePanel(mine.calendar, Number(mine.stats[0]?.value || 0), Number(mine.stats[1]?.value || 0))
	loadMineSummary()
})

onShow(() => {
	loadMineSummary()
})
</script>

<style lang="scss" scoped>
.mine-page {
	padding-bottom: 64rpx;
}

.panel-head {
	margin-bottom: 18rpx;
}

.panel-head__eyebrow {
	color: $we-ink-soft;
	font-size: 22rpx;
	font-weight: 700;
	letter-spacing: 0.08em;
}

.panel-head__title {
	margin-top: 10rpx;
	font-size: 52rpx;
	line-height: 1.1;
	font-weight: 700;
	letter-spacing: -0.04em;
}

.profile-panel {
	padding: 30rpx;
	background: #ffffff;
}

.profile-panel__top {
	display: flex;
	align-items: flex-start;
	gap: 18rpx;
}

.profile-avatar {
	width: 116rpx;
	height: 116rpx;
	border-radius: 34rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f3e7dc;
	border: 1rpx solid #e7d8c8;
	color: #8d5531;
	font-size: 38rpx;
	font-weight: 700;
}

.profile-panel__copy {
	flex: 1;
	min-width: 0;
}

.profile-panel__name-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 10rpx;
}

.profile-name {
	font-size: 42rpx;
	font-weight: 700;
}

.profile-chip {
	display: inline-flex;
	align-items: center;
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	background: #eef3ff;
	color: #445a80;
	font-size: 20rpx;
	font-weight: 700;
}

.profile-desc {
	margin-top: 8rpx;
	color: $we-ink-body;
	font-size: 24rpx;
}

.profile-note {
	margin-top: 12rpx;
	padding: 18rpx 20rpx;
	border-radius: 20rpx;
	background: #f7f8fa;
	color: $we-ink-body;
	font-size: 22rpx;
	line-height: 1.7;
}

.profile-stats {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12rpx;
	margin-top: 26rpx;
}

.profile-stat {
	padding: 22rpx;
	border-radius: 24rpx;
	border: 1rpx solid $we-line;
	background: #fff;
}

.profile-stat__label,
.profile-stat__value {
	display: block;
}

.profile-stat__label {
	color: $we-ink-soft;
	font-size: 22rpx;
}

.profile-stat__value {
	margin-top: 10rpx;
	font-size: 44rpx;
	font-weight: 700;
}

.checkin-card {
	margin-top: 18rpx;
	padding: 30rpx;
	background: #ffffff;
}

.checkin-card__head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16rpx;
}

.checkin-card__title {
	font-size: 32rpx;
	font-weight: 700;
}

.checkin-card__meta {
	margin-top: 8rpx;
	color: $we-ink-body;
	font-size: 22rpx;
}

.checkin-card__tag {
	display: inline-flex;
	align-items: center;
	padding: 10rpx 16rpx;
	border-radius: 999rpx;
	background: #eef8f1;
	color: #2f9b57;
	font-size: 20rpx;
	font-weight: 700;
}

.checkin-grid {
	display: grid;
	grid-template-columns: repeat(7, minmax(0, 1fr));
	gap: 10rpx;
	margin-top: 24rpx;
}

.checkin-grid__cell {
	height: 72rpx;
	border-radius: 18rpx;
	border: 1rpx solid #eceff3;
	background: #f2f4f7;
	display: flex;
	align-items: center;
	justify-content: center;
}

.checkin-grid__cell--signed {
	background: #ffffff;
	border-color: #d9efdf;
	box-shadow: inset 0 0 0 2rpx rgba(52, 199, 89, 0.1);
}

.checkin-grid__icon {
	color: #34c759;
	font-size: 34rpx;
	font-weight: 700;
}

.shortcut-card {
	margin-top: 16rpx;
	padding: 28rpx 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 18rpx;
	background: #ffffff;
}

.shortcut-card__copy {
	flex: 1;
	min-width: 0;
}

.shortcut-card__title {
	font-size: 30rpx;
	font-weight: 700;
}

.shortcut-card__desc {
	margin-top: 8rpx;
	color: $we-ink-body;
	font-size: 22rpx;
}

.shortcut-card__meta {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex-shrink: 0;
}

.shortcut-card__hint {
	color: $we-ink-soft;
	font-size: 20rpx;
}

.shortcut-card__arrow {
	width: 14rpx;
	height: 14rpx;
	border-top: 3rpx solid #95a1ab;
	border-right: 3rpx solid #95a1ab;
	transform: rotate(45deg);
}
</style>
