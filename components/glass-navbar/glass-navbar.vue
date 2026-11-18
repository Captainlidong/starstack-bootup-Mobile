<template>
	<view class="navbar statusbar-pad">
		<view class="navbar-inner">
			<view class="nav-side left">
				<text v-if="back" class="back-arrow" @click="goBack">‹</text>
			</view>
			<text class="nav-title line1">{{ title }}</text>
			<view class="nav-side right">
				<slot name="right"></slot>
			</view>
		</view>
	</view>
	<view v-if="holder" :style="{ height: holderHeight + 'px' }"></view>
</template>

<script setup>
	import { computed } from 'vue'

	const props = defineProps({
		title: { type: String, default: '' },
		back: { type: Boolean, default: true },
		holder: { type: Boolean, default: true }
	})

	const statusBarHeight = uni.getWindowInfo ? uni.getWindowInfo().statusBarHeight || 0 : 0
	const NAV_H = 44
	const holderHeight = computed(() => statusBarHeight + NAV_H)

	function goBack() {
		const pages = getCurrentPages()
		if (pages.length > 1) {
			uni.navigateBack()
		} else {
			uni.switchTab({ url: '/pages/home/home' })
		}
	}
</script>

<style>
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: #fffdf8;
		border-bottom: 1.5px solid #efe8da;
		box-shadow: 0 4rpx 16rpx rgba(93, 84, 60, 0.06);
	}

	.navbar-inner {
		height: 44px;
		display: flex;
		align-items: center;
		padding: 0 20rpx;
	}

	.nav-side {
		width: 170rpx;
		display: flex;
		align-items: center;
	}

	.nav-side.left {
		justify-content: flex-start;
	}

	.nav-side.right {
		justify-content: flex-end;
	}

	.back-arrow {
		font-size: 56rpx;
		font-weight: bold;
		color: #2e6b4f;
		padding: 0 20rpx;
		line-height: 1;
	}

	.nav-title {
		flex: 1;
		text-align: center;
		font-size: 32rpx;
		font-weight: bold;
		color: #1f3d2e;
	}
</style>
