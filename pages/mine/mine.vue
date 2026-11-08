<template>
	<view class="page mine-page statusbar-pad">
		<view class="tab-head">
			<text class="tab-title">🌸 我的</text>
		</view>

		<!-- 未登录引导 -->
		<view class="card guest-card" v-if="!isLogin()">
			<text class="guest-emoji">🪐</text>
			<text class="guest-text">登录星栈,开启你的 IT 之旅~</text>
			<view class="guest-btns">
				<view class="pill-btn guest-btn" @click="goLogin">登录</view>
				<view class="pill-btn plain guest-btn" @click="goRegister">注册</view>
			</view>
		</view>

		<template v-else>
			<!-- 用户信息头部 -->
			<view class="card me-card" @click="goSpace(store.user.id)">
				<image class="me-avatar" :src="absUrl(store.user.avatar)" mode="aspectFill" v-if="store.user.avatar" />
				<view class="me-avatar avatar-ph" v-else><text>👤</text></view>
				<view class="me-info">
					<text class="me-name">{{ store.user.name || store.user.username }}</text>
					<text class="me-username">@{{ store.user.username }}</text>
				</view>
				<text class="me-arrow">›</text>
			</view>

			<!-- 统计(博客/粉丝/关注可点击进入对应列表,获赞仅展示) -->
			<view class="card stats-card">
				<view class="stat-item" v-for="s in stats" :key="s.label" @click="s.action && s.action()">
					<text class="stat-num">{{ s.num }}</text>
					<text class="stat-label">{{ s.label }}</text>
				</view>
			</view>

			<!-- 功能菜单 -->
			<view class="card menu-card">
				<view class="menu-row" v-for="m in menus" :key="m.label" @click="m.action()">
					<text class="menu-icon">{{ m.icon }}</text>
					<text class="menu-label">{{ m.label }}</text>
					<text class="menu-arrow">›</text>
				</view>
			</view>

			<view class="logout-btn" @click="doLogout">退出登录</view>
		</template>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onShow } from '@dcloudio/uni-app'
	import { store, isLogin, logout } from '../../utils/store.js'
	import { spaceInfo } from '../../api/space.js'
	import { absUrl } from '../../utils/format.js'
	import { closeWS } from '../../utils/ws.js'
	import { clearBadge } from '../../utils/badge.js'

	const info = ref({})

	const unreadTotal = computed(() => store.unread.message + store.unread.notification)

	const stats = computed(() => [
		{ num: info.value.blogCount || 0, label: '博客', action: () => go('/pages/person/blogs?status=PUBLISHED') },
		{ num: info.value.fansCount || 0, label: '粉丝', action: () => go('/pages/person/fans?tab=fans') },
		{ num: info.value.followCount || 0, label: '关注', action: () => go('/pages/person/fans?tab=following') },
		{ num: info.value.likesCount || 0, label: '获赞', action: null }
	])

	const menus = computed(() => [
		{ icon: '📝', label: '我的博客', action: () => go('/pages/person/blogs?status=PUBLISHED') },
		{ icon: '📋', label: '草稿箱', action: () => go('/pages/person/blogs?status=DRAFT') },
		{ icon: '❤️', label: '我的点赞', action: () => go('/pages/person/interacts?tab=likes') },
		{ icon: '⭐', label: '我的收藏', action: () => go('/pages/person/interacts?tab=collects') },
		{ icon: '💬', label: '我的评论', action: () => go('/pages/person/interacts?tab=comments') },
		{ icon: '🎪', label: '报名的活动', action: () => go('/pages/person/activities') },
		{ icon: '❓', label: '我的提问', action: () => go('/pages/person/questions?tab=ask') },
		{ icon: '📥', label: '收到的提问', action: () => go('/pages/person/questions?tab=received') },
		{ icon: '🔔', label: unreadTotal.value > 0 ? `通知 (${unreadTotal.value}条未读)` : '通知', action: () => go('/pages/notification/notification') },
		{ icon: '✏️', label: '编辑资料', action: () => go('/pages/person/profile') },
		{ icon: '🔑', label: '修改密码', action: () => go('/pages/person/password') }
	])

	function loadInfo() {
		if (!isLogin()) return
		spaceInfo(store.user.id).then(d => {
			info.value = d || {}
		}).catch(() => { /* 忽略 */ })
	}

	onShow(() => {
		loadInfo()
	})

	function go(url) {
		uni.navigateTo({ url })
	}

	function goSpace(userId) {
		uni.navigateTo({ url: '/pages/space/space?userId=' + userId })
	}

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}

	function goRegister() {
		uni.navigateTo({ url: '/pages/register/register' })
	}

	function doLogout() {
		uni.showModal({
			title: '退出登录',
			content: '确定要退出当前账号吗?',
			confirmColor: '#e8619c',
			success: (res) => {
				if (res.confirm) {
					logout()
					closeWS()
					clearBadge()
					uni.showToast({ title: '已退出', icon: 'none' })
				}
			}
		})
	}
</script>

<style>
	.mine-page {
		min-height: 100vh;
		padding-bottom: 60rpx;
	}

	.tab-head {
		padding: 24rpx 30rpx 10rpx;
	}

	.tab-title {
		font-size: 40rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	.guest-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24rpx;
		padding: 90rpx 40rpx;
		margin: 30rpx 24rpx;
	}

	.guest-emoji {
		font-size: 100rpx;
	}

	.guest-text {
		font-size: 28rpx;
		color: var(--text-sub);
	}

	.guest-btns {
		display: flex;
		gap: 24rpx;
		width: 100%;
		justify-content: center;
	}

	.guest-btn {
		width: 240rpx;
	}

	.me-card {
		display: flex;
		align-items: center;
		gap: 24rpx;
		padding: 30rpx;
		margin: 20rpx 24rpx;
	}

	.me-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		font-size: 60rpx;
		flex-shrink: 0;
		border: 3px solid rgba(255, 255, 255, 0.8);
	}

	.me-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.me-name {
		font-size: 36rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	.me-username {
		font-size: 24rpx;
		color: var(--text-sub);
	}

	.me-arrow {
		font-size: 48rpx;
		color: var(--text-sub);
	}

	.stats-card {
		display: flex;
		padding: 26rpx 0;
		margin: 0 24rpx 20rpx;
	}

	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
	}

	.stat-num {
		font-size: 34rpx;
		font-weight: bold;
		color: var(--purple);
	}

	.stat-label {
		font-size: 23rpx;
		color: var(--text-sub);
	}

	.menu-card {
		margin: 0 24rpx;
		padding: 8rpx 26rpx;
	}

	.menu-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 28rpx 0;
		border-bottom: 1.5px dashed rgba(183, 156, 255, 0.2);
	}

	.menu-row:last-child {
		border-bottom: none;
	}

	.menu-icon {
		font-size: 34rpx;
		width: 50rpx;
		text-align: center;
	}

	.menu-label {
		flex: 1;
		font-size: 29rpx;
		color: var(--text-main);
	}

	.menu-arrow {
		font-size: 40rpx;
		color: #c9bfd8;
	}

	.logout-btn {
		margin: 40rpx 24rpx 0;
		text-align: center;
		padding: 24rpx;
		background: rgba(255, 255, 255, 0.8);
		border: 1.5px solid rgba(224, 92, 92, 0.4);
		border-radius: 999rpx;
		color: #e05c5c;
		font-size: 29rpx;
		font-weight: bold;
	}
</style>
