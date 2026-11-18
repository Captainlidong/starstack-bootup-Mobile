<template>
	<!-- 自绘底部导航栏:悬浮圆角卡片 + 胶囊选中态 + 线性图标 + 大号文字 -->
	<view class="ctb-wrap safe-bottom">
		<view class="ctb-bar">
			<view v-for="(t, i) in tabs" :key="t.key" class="ctb-item" :class="{ active: current === i }"
				@click="go(i)">
				<view class="ctb-icon-box">
					<image class="ctb-icon" :src="icon(t.key, current === i ? '#2e6b4f' : '#8b9689')" mode="aspectFit" />
					<view class="ctb-badge" v-if="t.key === 'message' && unread > 0">
						{{ unread > 99 ? '99+' : unread }}
					</view>
				</view>
				<text class="ctb-label">{{ t.label }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { computed } from 'vue'
	import { icon } from '../../utils/icons.js'
	import { store } from '../../utils/store.js'

	const props = defineProps({
		// 当前 Tab 下标:0 首页 / 1 推荐 / 2 活动 / 3 消息 / 4 我的
		current: { type: Number, default: 0 }
	})

	const tabs = [
		{ key: 'home', label: '首页', url: '/pages/home/home' },
		{ key: 'recommend', label: '推荐', url: '/pages/recommend/recommend' },
		{ key: 'activity', label: '活动', url: '/pages/activity/activity' },
		{ key: 'message', label: '消息', url: '/pages/message/message' },
		{ key: 'mine', label: '我的', url: '/pages/mine/mine' }
	]

	// 私信未读数(ws 推送 + 30s 轮询实时更新,见 utils/badge.js)
	const unread = computed(() => store.unread.message)

	function go(i) {
		if (i === props.current) return
		uni.switchTab({ url: tabs[i].url })
	}
</script>

<style>
	.ctb-wrap {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 200;
		padding: 0 20rpx 18rpx;
	}

	.ctb-bar {
		display: flex;
		align-items: center;
		justify-content: space-around;
		background: #fffdf8;
		border: 1.5px solid #efe8da;
		border-radius: 26rpx;
		box-shadow: 0 6rpx 22rpx rgba(93, 84, 60, 0.13);
		padding: 10rpx 6rpx;
	}

	.ctb-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rpx;
		padding: 8rpx 26rpx;
		border-radius: 999rpx;
		transition: background 0.2s;
	}

	.ctb-item.active {
		background: #e7efe6;
	}

	.ctb-icon-box {
		position: relative;
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ctb-icon {
		width: 44rpx;
		height: 44rpx;
	}

	.ctb-badge {
		position: absolute;
		top: -10rpx;
		right: -20rpx;
		min-width: 30rpx;
		height: 30rpx;
		padding: 0 8rpx;
		box-sizing: border-box;
		background: #f43f5e;
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ctb-label {
		font-size: 26rpx;
		color: #8b9689;
		font-weight: 500;
		line-height: 1.35;
	}

	.ctb-item.active .ctb-label {
		color: #2e6b4f;
		font-weight: bold;
	}
</style>
