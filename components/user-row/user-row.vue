<template>
	<view class="user-row card" @click="emit('click')">
		<image class="u-avatar" :src="absUrl(user.avatar)" mode="aspectFill" v-if="user.avatar" />
		<view class="u-avatar avatar-ph" v-else><text>👤</text></view>
		<view class="u-info">
			<text class="u-name line1">{{ user.name || user.username }}</text>
			<text class="u-sub line1" v-if="user.username">@{{ user.username }}</text>
			<text class="u-sub line1" v-else-if="user.info">{{ user.info }}</text>
		</view>
		<view class="u-right">
			<slot name="right"></slot>
		</view>
	</view>
</template>

<script setup>
	import { absUrl } from '../../utils/format.js'

	defineProps({
		user: { type: Object, required: true }
	})
	const emit = defineEmits(['click'])
</script>

<style>
	.user-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 22rpx 24rpx;
		margin-bottom: 20rpx;
	}

	.u-avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		flex-shrink: 0;
		font-size: 44rpx;
	}

	.u-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.u-name {
		font-size: 29rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	.u-sub {
		font-size: 23rpx;
		color: var(--text-sub);
	}

	.u-right {
		flex-shrink: 0;
	}
</style>
