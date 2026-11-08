<template>
	<view class="page home-page statusbar-pad">
		<!-- 顶部品牌区 -->
		<view class="home-header">
			<view class="brand-row">
				<view class="brand-left">
					<image class="brand-logo" src="/static/logo.png" mode="aspectFill" />
					<text class="brand-name">星栈始动</text>
				</view>
				<view class="brand-actions">
					<view class="h-icon" @click="goEdit">✏️</view>
					<view class="h-icon" @click="goNotification">
						<text>🔔</text>
						<view class="h-badge" v-if="unreadTotal > 0">{{ unreadTotal > 99 ? '99+' : unreadTotal }}</view>
					</view>
				</view>
			</view>
			<view class="search-pill" @click="goSearch">
				<text class="search-ph">🔍 搜索你感兴趣的技术文章</text>
			</view>
			<category-bar v-model="category" @change="onCategoryChange" />
		</view>

		<!-- 热榜 -->
		<view class="hot-card card" v-if="hotList.length">
			<view class="hot-head">🔥 IT 热榜</view>
			<view class="hot-item" v-for="(b, i) in hotList" :key="b.id" @click="goDetail(b.id)">
				<text class="hot-rank" :class="'hot-r' + i">{{ i + 1 }}</text>
				<text class="hot-title line1">{{ b.title }}</text>
				<text class="hot-heat">👍 {{ b.likesCount || 0 }}</text>
			</view>
		</view>

		<!-- 排序 + 博客列表 -->
		<view class="list-area">
			<sort-bar v-model="sort" @change="resetLoad" />
			<blog-card v-for="(b, i) in list" :key="b.id" :blog="b" :index="i" @click="goDetail(b.id)"
				@author="goSpace(b.userId)" />
			<empty-state v-if="!loading && !list.length" emoji="🛸" text="这个分类还没有文章,去发布第一篇吧~" />
			<view class="load-more" v-if="list.length">{{ finished ? '— 到底啦 🌈 —' : (loading ? '加载中…' : '上拉加载更多') }}</view>
		</view>

		<!-- 发布悬浮按钮 -->
		<view class="fab" @click="goEdit">✏️</view>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onLoad, onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
	import { selectPage, selectTop } from '../../api/blog.js'
	import { store } from '../../utils/store.js'

	const category = ref('')
	const sort = ref('composite')
	const list = ref([])
	const pageNum = ref(0)
	const PAGE_SIZE = 10
	const loading = ref(false)
	const finished = ref(false)
	const hotList = ref([])

	// 首页铃铛只提示「系统通知未读」(点击进入通知页,语义一致);私信未读在消息 Tab 角标上提示
	const unreadTotal = computed(() => store.unread.notification)

	async function loadMore() {
		if (loading.value || finished.value) return
		loading.value = true
		try {
			const params = { pageNum: pageNum.value + 1, pageSize: PAGE_SIZE, sort: sort.value }
			if (category.value) params.categoryName = category.value
			const page = await selectPage(params)
			const rows = (page && page.list) || []
			list.value = list.value.concat(rows)
			pageNum.value += 1
			if (rows.length < PAGE_SIZE) finished.value = true
		} catch (e) { /* 错误提示已在 request 层处理 */ } finally {
			loading.value = false
		}
	}

	async function resetLoad() {
		pageNum.value = 0
		list.value = []
		finished.value = false
		await loadMore()
	}

	function onCategoryChange() {
		resetLoad()
	}

	function loadHot() {
		selectTop().then(rows => {
			hotList.value = (rows || []).slice(0, 3)
		}).catch(() => { /* 热榜失败不阻塞 */ })
	}

	onLoad(() => {
		loadMore()
		loadHot()
	})

	onShow(() => { /* 角标由全局轮询维护 */ })

	onReachBottom(() => {
		loadMore()
	})

	onPullDownRefresh(async () => {
		loadHot()
		await resetLoad()
		uni.stopPullDownRefresh()
	})

	function goSearch() {
		uni.navigateTo({ url: '/pages/blog/search' })
	}

	function goDetail(id) {
		uni.navigateTo({ url: '/pages/blog/detail?blogId=' + id })
	}

	function goSpace(userId) {
		if (!userId) return
		uni.navigateTo({ url: '/pages/space/space?userId=' + userId })
	}

	function goEdit() {
		uni.navigateTo({ url: '/pages/blog/edit' })
	}

	function goNotification() {
		uni.navigateTo({ url: '/pages/notification/notification' })
	}
</script>

<style>
	.home-page {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.home-header {
		padding: 20rpx 24rpx 10rpx;
		display: flex;
		flex-direction: column;
		gap: 18rpx;
	}

	.brand-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand-left {
		display: flex;
		align-items: center;
		gap: 14rpx;
	}

	.brand-logo {
		width: 64rpx;
		height: 64rpx;
		border-radius: 18rpx;
		background: rgba(255, 255, 255, 0.75);
		box-shadow: 0 6rpx 16rpx rgba(160, 120, 220, 0.25);
	}

	.brand-name {
		font-size: 36rpx;
		font-weight: bold;
		color: var(--title-c);
		letter-spacing: 2rpx;
	}

	.brand-actions {
		display: flex;
		gap: 18rpx;
	}

	.h-icon {
		position: relative;
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
		background: rgba(255, 255, 255, 0.75);
		border: 1.5px solid rgba(255, 255, 255, 0.6);
		border-radius: 50%;
		box-shadow: 0 6rpx 16rpx rgba(160, 120, 220, 0.18);
	}

	.h-badge {
		position: absolute;
		top: -8rpx;
		right: -10rpx;
		min-width: 32rpx;
		height: 32rpx;
		padding: 0 8rpx;
		background: #f43f5e;
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 19rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.search-pill {
		background: rgba(255, 255, 255, 0.8);
		border: 1.5px solid rgba(255, 255, 255, 0.65);
		border-radius: 999rpx;
		padding: 18rpx 30rpx;
		box-shadow: 0 6rpx 18rpx rgba(160, 120, 220, 0.12);
	}

	.search-ph {
		font-size: 26rpx;
		color: #b9aecb;
	}

	.hot-card {
		margin: 6rpx 24rpx 8rpx;
		padding: 22rpx 24rpx;
	}

	.hot-head {
		font-size: 28rpx;
		font-weight: bold;
		color: var(--title-c);
		padding-bottom: 14rpx;
	}

	.hot-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 12rpx 0;
	}

	.hot-rank {
		width: 40rpx;
		height: 40rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 23rpx;
		font-weight: bold;
		color: #ffffff;
		background: #c4b5fd;
		flex-shrink: 0;
	}

	.hot-rank.hot-r0 {
		background: linear-gradient(135deg, #fb923c, #f97316);
	}

	.hot-rank.hot-r1 {
		background: linear-gradient(135deg, #fbbf24, #f59e0b);
	}

	.hot-rank.hot-r2 {
		background: linear-gradient(135deg, #60a5fa, #3b82f6);
	}

	.hot-title {
		flex: 1;
		font-size: 26rpx;
		color: var(--text-main);
	}

	.hot-heat {
		font-size: 21rpx;
		color: var(--text-sub);
		flex-shrink: 0;
	}

	.list-area {
		padding: 12rpx 24rpx 0;
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.fab {
		position: fixed;
		right: 34rpx;
		bottom: 180rpx;
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: var(--brand-grad);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 44rpx;
		box-shadow: 0 10rpx 26rpx rgba(183, 156, 255, 0.55);
		z-index: 50;
		transition: transform 0.15s;
	}

	.fab:active {
		transform: scale(0.92);
	}
</style>
