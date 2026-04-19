<template>
	<view class="we-card we-editorial-card">
		<view class="checkin-head">
			<view class="checkin-copy">
				<view class="we-label-row">
					<text>{{ content.label }}</text>
					<text class="we-chip we-chip--accent">{{ content.badge }}</text>
				</view>
				<view class="checkin-title">{{ content.headline }}</view>
				<view class="checkin-desc">{{ content.description }}</view>
			</view>
			<view class="checkin-ring">
				<view class="checkin-ring__inner">
					<text class="checkin-ring__value">{{ content.streak }}</text>
					<text class="checkin-ring__label">连续天数</text>
				</view>
			</view>
		</view>

		<view class="checkin-stats">
			<view v-for="(stat, index) in content.stats" :key="index" class="checkin-stat">
				<text class="checkin-stat__label">{{ stat.label }}</text>
				<text class="checkin-stat__value">{{ stat.value }}</text>
			</view>
		</view>

		<view class="checkin-actions">
			<view class="checkin-btn checkin-btn--primary" @click="$emit('submit')">{{ content.checkedToday ? '今日已签到' : '立即签到' }}</view>
			<view class="checkin-btn checkin-btn--secondary" @click="$emit('record')">签到记录</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	content: {
		type: Object,
		required: true
	}
})

defineEmits(['submit', 'record'])
</script>

<style lang="scss" scoped>
.checkin-head {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 24rpx;
}

.checkin-copy {
	flex: 1;
	min-width: 0;
}

.checkin-title {
	font-size: 56rpx;
	line-height: 1.08;
	letter-spacing: -0.04em;
	font-weight: 700;
}

.checkin-desc {
	margin-top: 12rpx;
	color: $we-ink-body;
	font-size: 26rpx;
	line-height: 1.75;
}

.checkin-ring {
	position: relative;
	flex: 0 0 auto;
	width: 184rpx;
	height: 184rpx;
	border-radius: 50%;
	border: 10rpx solid #e4d5c6;
	background: #f6ede3;
	display: flex;
	align-items: center;
	justify-content: center;
}

.checkin-ring__inner {
	width: 144rpx;
	height: 144rpx;
	border-radius: 50%;
	background: #fffdf9;
	border: 1rpx solid #efe4d7;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.checkin-ring__value {
	font-size: 56rpx;
	line-height: 1;
	font-weight: 700;
}

.checkin-ring__label {
	margin-top: 8rpx;
	color: $we-ink-soft;
	font-size: 20rpx;
}

.checkin-stats {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 12rpx;
	margin-top: 24rpx;
}

.checkin-stat {
	padding: 20rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.64);
	border: 1rpx solid rgba(233, 227, 219, 0.9);
}

.checkin-stat__label,
.checkin-stat__value {
	display: block;
}

.checkin-stat__label {
	color: $we-ink-soft;
	font-size: 20rpx;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.checkin-stat__value {
	margin-top: 10rpx;
	font-size: 40rpx;
	font-weight: 700;
	letter-spacing: -0.03em;
}

.checkin-actions {
	display: flex;
	gap: 12rpx;
	margin-top: 24rpx;
}

.checkin-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 88rpx;
	padding: 0 28rpx;
	border: none;
	border-radius: 24rpx;
	font-size: 26rpx;
	line-height: 1;
	font-weight: 700;
}

.checkin-btn--primary {
	flex: 1;
	background: $we-accent;
	color: #fff;
	box-shadow: 0 10rpx 20rpx rgba(169, 106, 67, 0.16);
}

.checkin-btn--secondary {
	color: $we-ink-body;
	background: #fff;
	border: 1rpx solid $we-line;
}
</style>
