<template>
	<view class="empty-wrap">
		<text class="empty-emoji">{{ emoji }}</text>
		<text class="empty-text">{{ text }}</text>
		<slot></slot>
	</view>
</template>

<script setup>
	defineProps({
		text: { type: String, default: '暂无内容' },
		emoji: { type: String, default: '🌱' }
	})
</script>

<style>
	.empty-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		padding: 100rpx 40rpx;
	}

	.empty-emoji {
		font-size: 90rpx;
	}

	.empty-text {
		font-size: 26rpx;
		color: var(--text-sub);
		text-align: center;
	}
</style>
