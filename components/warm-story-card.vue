<template>
	<view class="we-card we-list-card" @click="$emit('select', item)">
		<image v-if="item.cover" class="we-list-card__cover" :src="item.cover" mode="aspectFill" />
		<view class="we-list-card__top">
			<text class="we-chip" :class="item.accent ? 'we-chip--accent' : 'we-chip--soft'">{{ item.badge }}</text>
			<view class="we-list-card__meta">
				<text>{{ item.time }}</text>
				<text v-if="item.favorite" class="we-list-card__favorite">★</text>
			</view>
		</view>
		<view class="we-list-card__title">{{ item.title }}</view>
		<view class="we-list-card__summary">{{ item.summary }}</view>
		<view v-if="item.tags && item.tags.length" class="we-tag-row">
			<text v-for="tag in item.tags" :key="tag" class="we-chip we-chip--soft">{{ tag }}</text>
		</view>
	</view>
</template>

<script setup>
defineProps({
	item: {
		type: Object,
		required: true
	}
})

defineEmits(['select'])
</script>

<style lang="scss" scoped>
.we-list-card {
	transition: opacity 0.2s ease;
}

.we-list-card__meta {
	margin-left: auto;
	display: inline-flex;
	align-items: center;
	gap: 10rpx;
}

.we-list-card__favorite {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 34rpx;
	height: 34rpx;
	padding: 0 8rpx;
	border-radius: 999rpx;
	background: #fff5cc;
	color: #e0a106;
	font-size: 22rpx;
	font-weight: 700;
	line-height: 1;
}

.we-list-card__cover {
	width: 100%;
	height: 248rpx;
	margin-bottom: 20rpx;
	border-radius: 28rpx;
	background: #f2f4f7;
}

.we-list-card:active {
	opacity: 0.9;
}
</style>
