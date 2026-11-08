<template>
	<view class="guide card">
		<text class="guide-emoji">{{ emoji }}</text>
		<text class="guide-text">{{ text }}</text>
		<view class="pill-btn guide-btn" v-if="buttonText" @click="emit('action')">{{ buttonText }}</view>
	</view>
</template>

<script setup>
	defineProps({
		text: { type: String, required: true },
		buttonText: { type: String, default: '' },
		emoji: { type: String, default: '🪐' }
	})
	const emit = defineEmits(['action'])
</script>

<style>
	.guide {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
		padding: 80rpx 40rpx;
		margin: 30rpx;
	}

	.guide-emoji {
		font-size: 100rpx;
	}

	.guide-text {
		font-size: 27rpx;
		color: var(--text-sub);
		text-align: center;
		line-height: 1.7;
	}

	.guide-btn {
		width: 320rpx;
		margin-top: 10rpx;
	}
</style>
