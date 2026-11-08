<template>
	<view class="page search-page">
		<glass-navbar title="搜索" :holder="false" :back="false" />
		<view :style="{ height: navHolder + 'px' }"></view>

		<!-- 搜索框 -->
		<view class="search-row">
			<view class="search-box">
				<text class="search-icon">🔍</text>
				<input class="search-input" v-model="keyword" placeholder="输入标题关键词,回车搜索" placeholder-class="ph"
					confirm-type="search" :focus="true" @confirm="doSearch" />
				<text class="search-clear" v-if="keyword" @click="clearKeyword">✕</text>
			</view>
			<view class="search-btn" @click="doSearch">搜索</view>
		</view>

		<!-- 未搜索:热榜推荐 -->
		<view class="hot-sug card" v-if="!searched && hotList.length">
			<view class="sec-title">🔥 大家都在看</view>
			<view class="hot-item" v-for="(b, i) in hotList" :key="b.id" @click="goDetail(b.id)">
				<text class="hot-rank" :class="'hot-r' + (i < 3 ? i : 3)">{{ i + 1 }}</text>
				<text class="hot-title line1">{{ b.title }}</text>
			</view>
		</view>

		<!-- 搜索结果 -->
		<view class="result-area" v-if="searched">
			<sort-bar v-model="sort" @change="resetLoad" />
			<blog-card v-for="(b, i) in list" :key="b.id" :blog="b" :index="i" @click="goDetail(b.id)"
				@author="goSpace(b.userId)" />
			<empty-state v-if="!loading && !list.length" emoji="🔭" :text="'没有找到「' + lastKeyword + '」相关的文章~'" />
			<view class="load-more" v-if="list.length">{{ finished ? '— 到底啦 🌈 —' : (loading ? '加载中…' : '上拉加载更多') }}</view>
		</view>

		<view class="nav-pad" v-if="!searched && !hotList.length"></view>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onReachBottom } from '@dcloudio/uni-app'
	import { selectPage, selectTop } from '../../api/blog.js'

	// 自定义导航占位高度
	const statusBarHeight = uni.getWindowInfo ? uni.getWindowInfo().statusBarHeight || 0 : 0
	const navHolder = statusBarHeight + 44
	const keyword = ref('')
	const lastKeyword = ref('')
	const searched = ref(false)
	const sort = ref('composite')
	const list = ref([])
	const pageNum = ref(0)
	const PAGE_SIZE = 10
	const loading = ref(false)
	const finished = ref(false)
	const hotList = ref([])

	selectTop().then(rows => {
		hotList.value = (rows || []).slice(0, 6)
	}).catch(() => { /* 忽略 */ })

	async function loadMore() {
		if (loading.value || finished.value) return
		loading.value = true
		try {
			const params = { pageNum: pageNum.value + 1, pageSize: PAGE_SIZE, sort: sort.value, title: lastKeyword.value }
			const page = await selectPage(params)
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

	function doSearch() {
		const kw = keyword.value.trim()
		if (!kw) {
			uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
			return
		}
		lastKeyword.value = kw
		searched.value = true
		resetLoad()
	}

	function clearKeyword() {
		keyword.value = ''
		searched.value = false
		list.value = []
	}

	function goDetail(id) {
		uni.navigateTo({ url: '/pages/blog/detail?blogId=' + id })
	}

	function goSpace(userId) {
		uni.navigateTo({ url: '/pages/space/space?userId=' + userId })
	}

	onReachBottom(() => {
		if (searched.value) loadMore()
	})
</script>

<style>
	.search-page {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.search-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 20rpx 24rpx;
	}

	.search-box {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 12rpx;
		background: rgba(255, 255, 255, 0.85);
		border: 1.5px solid rgba(183, 156, 255, 0.4);
		border-radius: 999rpx;
		padding: 14rpx 26rpx;
	}

	.search-icon {
		font-size: 28rpx;
	}

	.search-input {
		flex: 1;
		font-size: 27rpx;
	}

	.search-clear {
		padding: 4rpx 10rpx;
		color: var(--text-sub);
		font-size: 24rpx;
	}

	.search-btn {
		padding: 16rpx 34rpx;
		background: var(--brand-grad);
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 27rpx;
		font-weight: bold;
		flex-shrink: 0;
		box-shadow: 0 6rpx 16rpx rgba(183, 156, 255, 0.45);
	}

	.hot-sug {
		margin: 10rpx 24rpx;
		padding: 24rpx 28rpx;
	}

	.hot-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 14rpx 0;
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

	.hot-r0 {
		background: linear-gradient(135deg, #fb923c, #f97316);
	}

	.hot-r1 {
		background: linear-gradient(135deg, #fbbf24, #f59e0b);
	}

	.hot-r2 {
		background: linear-gradient(135deg, #60a5fa, #3b82f6);
	}

	.hot-title {
		flex: 1;
		font-size: 26rpx;
		color: var(--text-main);
	}

	.result-area {
		padding: 10rpx 24rpx 0;
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.nav-pad {
		height: 400rpx;
	}
</style>
