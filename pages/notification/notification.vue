<template>
	<view class="page ntf-page">
		<glass-navbar title="🔔 通知">
			<template #right>
				<text class="nav-act" v-if="isLogin()" @click="markAllRead">全部已读</text>
			</template>
		</glass-navbar>

		<guide-card v-if="!isLogin()" emoji="🔔" text="登录后,点赞、评论、关注、审核结果等通知都会推送到这里~"
			buttonText="去登录" @action="goLogin" />

		<template v-else>
			<view class="ntf-list">
				<view class="ntf-row card" :class="{ unread: !n.isRead }" v-for="n in list" :key="n.id"
					@click="onTap(n)">
					<view class="ntf-icon" :class="'t-' + n.type">{{ typeMeta(n.type).emoji }}</view>
					<view class="ntf-body">
						<view class="ntf-top">
							<text class="ntf-title line1">{{ typeMeta(n.type).label }} · {{ n.title }}</text>
							<view class="ntf-dot" v-if="!n.isRead"></view>
						</view>
						<view class="ntf-content line2" v-if="n.content">{{ n.content }}</view>
						<view class="ntf-time">{{ fmtTime(n.time) }}</view>
					</view>
				</view>

				<empty-state v-if="!loading && !list.length" emoji="🔔" text="暂无通知,去社区里活跃一下吧~" />
				<view class="load-more" v-if="list.length">{{ finished ? '— 到底啦 🌈 —' : (loading ? '加载中…' : '上拉加载更多') }}</view>
			</view>
		</template>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad, onShow, onReachBottom } from '@dcloudio/uni-app'
	import { selectPage, readOne, readAll } from '../../api/notification.js'
	import { fmtTime } from '../../utils/format.js'
	import { isLogin } from '../../utils/store.js'
	import { refreshBadges } from '../../utils/badge.js'

	const TYPE_META = {
		LIKE: { emoji: '❤️', label: '点赞' },
		COLLECT: { emoji: '⭐', label: '收藏' },
		COMMENT: { emoji: '💬', label: '评论' },
		FOLLOW: { emoji: '➕', label: '关注' },
		AUDIT: { emoji: '📋', label: '审核' },
		REPORT: { emoji: '🚩', label: '举报' },
		SYSTEM: { emoji: '📢', label: '系统' },
		ASK: { emoji: '❓', label: '提问' },
		ANSWER: { emoji: '💡', label: '回答' }
	}

	const list = ref([])
	const pageNum = ref(0)
	const PAGE_SIZE = 15
	const loading = ref(false)
	const finished = ref(false)

	function typeMeta(t) {
		return TYPE_META[t] || { emoji: '📢', label: '通知' }
	}

	async function loadMore() {
		if (!isLogin() || loading.value || finished.value) return
		loading.value = true
		try {
			const page = await selectPage({ pageNum: pageNum.value + 1, pageSize: PAGE_SIZE })
			const rows = (page && page.list) || []
			list.value = list.value.concat(rows)
			pageNum.value += 1
			if (rows.length < PAGE_SIZE) finished.value = true
		} catch (e) { /* 忽略 */ } finally {
			loading.value = false
		}
	}

	async function resetLoad() {
		pageNum.value = 0
		list.value = []
		finished.value = false
		await loadMore()
	}

	onLoad(() => { /* 由 onShow 负责加载 */ })

	onShow(() => {
		if (isLogin()) {
			resetLoad()
			refreshBadges()
		}
	})

	onReachBottom(loadMore)

	function onTap(n) {
		const done = () => {
			const t = n.type
			if (t === 'LIKE' || t === 'COLLECT' || t === 'COMMENT') {
				if (n.targetId) uni.navigateTo({ url: '/pages/blog/detail?blogId=' + n.targetId })
			} else if (t === 'FOLLOW') {
				if (n.targetId) uni.navigateTo({ url: '/pages/space/space?userId=' + n.targetId })
			} else if (t === 'AUDIT' || t === 'REPORT') {
				uni.navigateTo({ url: '/pages/person/blogs?status=PUBLISHED' })
			} else if (t === 'ASK') {
				uni.navigateTo({ url: '/pages/person/questions?tab=received' })
			} else if (t === 'ANSWER') {
				uni.navigateTo({ url: '/pages/person/questions?tab=ask' })
			} else if (t === 'SYSTEM') {
				if (n.targetId) uni.navigateTo({ url: '/pages/activity/detail?activityId=' + n.targetId })
				else uni.switchTab({ url: '/pages/activity/activity' })
			}
		}
		if (n.isRead) {
			done()
			return
		}
		readOne(n.id).then(() => {
			n.isRead = true
			refreshBadges()
			done()
		}).catch(() => { /* 忽略 */ })
	}

	function markAllRead() {
		readAll().then(() => {
			list.value.forEach(n => { n.isRead = true })
			uni.showToast({ title: '已全部标记为已读', icon: 'none' })
			refreshBadges()
		})
	}

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}
</script>

<style>
	.ntf-page {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.nav-act {
		color: #ffffff;
		font-size: 25rpx;
	}

	.ntf-list {
		padding: 20rpx 24rpx 0;
	}

	.ntf-row {
		display: flex;
		gap: 18rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		transition: transform 0.15s;
	}

	.ntf-row:active {
		transform: scale(0.985);
	}

	.ntf-row.unread {
		border-color: rgba(232, 97, 156, 0.45);
		background: rgba(255, 240, 248, 0.9);
	}

	.ntf-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
		background: rgba(243, 232, 255, 0.8);
		flex-shrink: 0;
	}

	.ntf-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.ntf-top {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.ntf-title {
		flex: 1;
		font-size: 28rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	.ntf-dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		background: #f43f5e;
		flex-shrink: 0;
	}

	.ntf-content {
		font-size: 25rpx;
		color: var(--text-main);
		line-height: 1.55;
	}

	.ntf-time {
		font-size: 21rpx;
		color: var(--text-sub);
	}
</style>
