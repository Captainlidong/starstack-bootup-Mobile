<template>
	<view class="page rec-page statusbar-pad">
		<view class="tab-head">
			<text class="tab-title">🌟 为你推荐</text>
			<text class="tab-sub">根据你的浏览 · 点赞 · 收藏智能生成</text>
		</view>

		<guide-card v-if="!isLogin()" emoji="🛰️"
			text="登录后,这里会根据你的阅读喜好智能推荐你可能感兴趣的 IT 文章~" buttonText="去登录" @action="goLogin" />

		<template v-else>
			<view class="rec-list">
				<blog-card v-for="(b, i) in list" :key="b.id" :blog="b" :index="i" @click="goDetail(b.id)"
					@author="goSpace(b.userId)" />
				<empty-state v-if="!loading && !list.length" emoji="🎈"
					text="暂无推荐~ 多浏览和点赞文章,推荐会越来越懂你" />
				<view class="load-more" v-if="list.length">{{ finished ? '— 到底啦 🌈 —' : (loading ? '加载中…' : '上拉加载更多') }}</view>
			</view>
		</template>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
	import { recommendForUser } from '../../api/blog.js'
	import { store, isLogin } from '../../utils/store.js'

	const list = ref([])
	const pageNum = ref(0)
	const PAGE_SIZE = 10
	const loading = ref(false)
	const finished = ref(false)

	async function loadMore() {
		if (!isLogin() || loading.value || finished.value) return
		loading.value = true
		try {
			const page = await recommendForUser(store.user.id, { pageNum: pageNum.value + 1, pageSize: PAGE_SIZE })
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

	onLoad(() => {
		loadMore()
	})

	onReachBottom(loadMore)

	onPullDownRefresh(async () => {
		await resetLoad()
		uni.stopPullDownRefresh()
	})

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}

	function goDetail(id) {
		uni.navigateTo({ url: '/pages/blog/detail?blogId=' + id })
	}

	function goSpace(userId) {
		uni.navigateTo({ url: '/pages/space/space?userId=' + userId })
	}
</script>

<style>
	.rec-page {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.tab-head {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		padding: 24rpx 30rpx 10rpx;
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

	.rec-list {
		padding: 16rpx 24rpx 0;
	}
</style>
