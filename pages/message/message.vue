<template>
	<view class="page msg-page statusbar-pad">
		<view class="tab-head">
			<view class="tab-head-row">
				<text class="tab-title">💬 消息</text>
				<view class="readall-btn" v-if="isLogin() && conversations.length" @click="markAllRead">🧹 一键已读</view>
			</view>
			<text class="tab-sub" v-if="isLogin()">私信实时送达 · 点击会话开始聊天</text>
		</view>

		<guide-card v-if="!isLogin()" emoji="💌" text="登录后可以和小伙伴实时私信交流~" buttonText="去登录"
			@action="goLogin" />

		<template v-else>
			<view class="conv-list">
				<view class="conv-row card" v-for="c in conversations" :key="c.otherId" @click="goChat(c)">
					<view class="conv-avatar-wrap">
						<image class="conv-avatar" :src="absUrl(c.otherAvatar)" mode="aspectFill"
							v-if="c.otherAvatar" />
						<view class="conv-avatar avatar-ph" v-else><text>👤</text></view>
						<view class="conv-badge" v-if="c.unreadCount > 0">{{ c.unreadCount > 99 ? '99+' : c.unreadCount }}</view>
					</view>
					<view class="conv-body">
						<view class="conv-top">
							<text class="conv-name line1">{{ c.otherName }}</text>
							<text class="conv-time">{{ fmtTime(c.lastTime) }}</text>
						</view>
						<view class="conv-last line1">{{ c.lastContent }}</view>
					</view>
				</view>

				<empty-state v-if="!loading && !conversations.length" emoji="🕊️"
					text="还没有私信~ 去别人的主页打个招呼吧" />
			</view>
		</template>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onShow, onUnload } from '@dcloudio/uni-app'
	import { getConversations, markRead } from '../../api/message.js'
	import { isLogin } from '../../utils/store.js'
	import { absUrl, fmtTime } from '../../utils/format.js'
	import { on, off } from '../../utils/ws.js'
	import { refreshBadges } from '../../utils/badge.js'

	const conversations = ref([])
	const loading = ref(false)

	function load() {
		if (!isLogin()) return
		loading.value = true
		getConversations().then(rows => {
			conversations.value = rows || []
		}).catch(() => { /* 忽略 */ }).finally(() => {
			loading.value = false
		})
	}

	function onNewMessage() {
		load()
	}

	// 一键已读:把所有有未读的会话逐个标记已读(后端无全局已读接口,会话数通常很少)
	async function markAllRead() {
		const unreadList = conversations.value.filter(c => c.unreadCount > 0)
		if (!unreadList.length) {
			return uni.showToast({ title: '没有未读消息~', icon: 'none' })
		}
		try {
			await Promise.all(unreadList.map(c => markRead(c.otherId)))
			conversations.value.forEach(c => { c.unreadCount = 0 })
			uni.showToast({ title: '已全部标为已读', icon: 'none' })
		} catch (e) { /* 错误已在 request 层提示 */ } finally {
			refreshBadges()
		}
	}

	onShow(() => {
		load()
		refreshBadges()
	})

	// 监听 WebSocket 推送,实时刷新会话列表
	on('new-message', onNewMessage)
	onUnload(() => {
		off('new-message', onNewMessage)
	})

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}

	function goChat(c) {
		uni.navigateTo({
			url: '/pages/chat/chat?userId=' + c.otherId + '&name=' + encodeURIComponent(c.otherName || '私信') +
				'&avatar=' + encodeURIComponent(c.otherAvatar || '')
		})
	}
</script>

<style>
	.msg-page {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.tab-head {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		padding: 24rpx 30rpx 10rpx;
	}

	.tab-head-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.readall-btn {
		padding: 8rpx 24rpx;
		background: rgba(255, 255, 255, 0.85);
		border: 1.5px solid rgba(139, 92, 246, 0.35);
		color: var(--purple);
		border-radius: 999rpx;
		font-size: 23rpx;
		font-weight: bold;
	}

	.readall-btn:active {
		background: var(--brand-grad);
		color: #ffffff;
	}

	.tab-title {
		font-size: 40rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	.tab-sub {
		font-size: 23rpx;
		color: var(--text-sub);
	}

	.conv-list {
		padding: 16rpx 24rpx 0;
	}

	.conv-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		transition: transform 0.15s;
	}

	.conv-row:active {
		transform: scale(0.985);
	}

	.conv-avatar-wrap {
		position: relative;
		flex-shrink: 0;
	}

	.conv-avatar {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		font-size: 48rpx;
	}

	.conv-badge {
		position: absolute;
		top: -6rpx;
		right: -6rpx;
		min-width: 34rpx;
		height: 34rpx;
		padding: 0 8rpx;
		background: #f43f5e;
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.conv-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.conv-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
	}

	.conv-name {
		font-size: 30rpx;
		font-weight: bold;
		color: var(--title-c);
		flex: 1;
	}

	.conv-time {
		font-size: 21rpx;
		color: var(--text-sub);
		flex-shrink: 0;
	}

	.conv-last {
		font-size: 25rpx;
		color: var(--text-sub);
	}
</style>
