<template>
	<view class="page pi-page">
		<glass-navbar :title="pageTitle" />

		<guide-card v-if="!isLogin()" emoji="💕" text="登录后可以在这里查看你的点赞、收藏与评论记录~"
			buttonText="去登录" @action="goLogin" />

		<template v-else>
			<!-- 一级 Tab -->
			<view class="pi-tabs card">
				<view class="pi-tab" :class="{ active: tab === 'likes' }" @click="switchTab('likes')">❤️ 点赞</view>
				<view class="pi-tab" :class="{ active: tab === 'collects' }" @click="switchTab('collects')">⭐ 收藏</view>
				<view class="pi-tab" :class="{ active: tab === 'comments' }" @click="switchTab('comments')">💬 评论</view>
			</view>

			<!-- 二级:博客 / 活动 -->
			<view class="pi-sub">
				<view class="pi-sub-pill" :class="{ active: moduleType === 'blog' }" @click="switchModule('blog')">博客</view>
				<view class="pi-sub-pill" :class="{ active: moduleType === 'activity' }" @click="switchModule('activity')">活动</view>
			</view>

			<view class="pi-list">
				<!-- 博客维度:点赞/收藏/评论 返回的都是博客对象,统一渲染卡片 -->
				<template v-if="moduleType === 'blog'">
					<blog-card v-for="(b, i) in list" :key="b.id" :blog="b" :index="i" @click="goDetail(b.id)"
						@author="goSpace(b.userId)" />
				</template>

				<!-- 活动维度:统一渲染活动卡片 -->
				<template v-if="moduleType === 'activity'">
					<view class="pi-act card" v-for="a in list" :key="a.id" @click="goActivity(a.id)">
						<image class="pi-act-cover" :src="absUrl(a.cover)" mode="aspectFill" v-if="a.cover" />
						<view class="pi-act-cover avatar-ph" v-else><text>🎪</text></view>
						<view class="pi-act-body">
							<text class="pi-act-name line1">{{ a.name }}</text>
							<text class="pi-act-meta">🕒 {{ fmtTime(a.start) }}</text>
						</view>
					</view>
				</template>

				<empty-state v-if="!loading && !list.length" :emoji="emptyMeta.emoji" :text="emptyMeta.text" />
				<view class="load-more" v-if="list.length">{{ finished ? '— 到底啦 🌈 —' : (loading ? '加载中…' : '上拉加载更多') }}</view>
			</view>
		</template>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onLoad, onShow, onReachBottom } from '@dcloudio/uni-app'
	import { selectUserLike, selectUserCollect, selectUserComment } from '../../api/blog.js'
	import { selectUserLike as actLike, selectUserCollect as actCollect, selectUserComment as actComment } from '../../api/activity.js'
	import { absUrl, fmtTime } from '../../utils/format.js'
	import { isLogin } from '../../utils/store.js'

	const tab = ref('likes') // likes | collects | comments
	const moduleType = ref('blog') // blog | activity
	const list = ref([])
	const pageNum = ref(0)
	const PAGE_SIZE = 10
	const loading = ref(false)
	const finished = ref(false)

	const pageTitle = computed(() => ({ likes: '❤️ 我的点赞', collects: '⭐ 我的收藏', comments: '💬 我的评论' })[tab.value])

	const emptyMeta = computed(() => {
		if (tab.value === 'comments') {
			return moduleType.value === 'blog'
				? { emoji: '💬', text: '你还没有评论过文章~' }
				: { emoji: '💬', text: '你还没有评论过活动~' }
		}
		const verb = tab.value === 'likes' ? '点赞' : '收藏'
		return moduleType.value === 'blog'
			? { emoji: tab.value === 'likes' ? '👍' : '⭐', text: `还没有${verb}过文章~` }
			: { emoji: tab.value === 'likes' ? '👍' : '⭐', text: `还没有${verb}过活动~` }
	})

	onLoad((q) => {
		if (q.tab) tab.value = q.tab
	})

	onShow(() => {
		if (isLogin()) resetLoad()
	})

	async function loadMore() {
		if (!isLogin() || loading.value || finished.value) return
		loading.value = true
		try {
			const params = { pageNum: pageNum.value + 1, pageSize: PAGE_SIZE }
			let page
			if (tab.value === 'comments') {
				page = moduleType.value === 'blog'
					? await selectUserComment(params)
					: await actComment(params)
			} else if (tab.value === 'collects') {
				page = moduleType.value === 'blog'
					? await selectUserCollect(params)
					: await actCollect(params)
			} else {
				page = moduleType.value === 'blog'
					? await selectUserLike(params)
					: await actLike(params)
			}
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

	function switchTab(t) {
		if (tab.value === t) return
		tab.value = t
		resetLoad()
	}

	function switchModule(m) {
		if (moduleType.value === m) return
		moduleType.value = m
		resetLoad()
	}

	function goDetail(id) {
		uni.navigateTo({ url: '/pages/blog/detail?blogId=' + id })
	}

	function goActivity(id) {
		uni.navigateTo({ url: '/pages/activity/detail?activityId=' + id })
	}

	function goSpace(userId) {
		uni.navigateTo({ url: '/pages/space/space?userId=' + userId })
	}

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}
</script>

<style>
	.pi-page {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.pi-tabs {
		display: flex;
		margin: 20rpx 24rpx 16rpx;
		padding: 10rpx;
		gap: 10rpx;
	}

	.pi-tab {
		flex: 1;
		text-align: center;
		padding: 16rpx 0;
		border-radius: 999rpx;
		font-size: 26rpx;
		color: var(--text-sub);
		transition: all 0.2s;
	}

	.pi-tab.active {
		background: var(--brand-grad);
		color: #ffffff;
		font-weight: bold;
		box-shadow: 0 6rpx 16rpx rgba(183, 156, 255, 0.45);
	}

	.pi-sub {
		display: flex;
		justify-content: center;
		gap: 16rpx;
		margin-bottom: 10rpx;
	}

	.pi-sub-pill {
		padding: 8rpx 36rpx;
		background: rgba(255, 255, 255, 0.7);
		border: 1.5px solid rgba(255, 255, 255, 0.6);
		border-radius: 999rpx;
		font-size: 24rpx;
		color: var(--title-c);
	}

	.pi-sub-pill.active {
		background: #f3e8ff;
		color: var(--purple);
		font-weight: bold;
		border-color: rgba(139, 92, 246, 0.35);
	}

	.pi-list {
		padding: 10rpx 24rpx 0;
	}

	.pi-act {
		display: flex;
		align-items: center;
		gap: 18rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
	}

	.pi-act-cover {
		width: 110rpx;
		height: 110rpx;
		border-radius: 16rpx;
		flex-shrink: 0;
		font-size: 50rpx;
	}

	.pi-act-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.pi-act-name {
		font-size: 29rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	.pi-act-meta {
		font-size: 22rpx;
		color: var(--text-sub);
	}
</style>
