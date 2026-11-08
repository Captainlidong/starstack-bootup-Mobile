<template>
	<view class="page pa-page">
		<glass-navbar title="🎪 报名的活动" />

		<guide-card v-if="!isLogin()" emoji="🎪" text="登录后可以报名活动,并在管理你的报名记录~" buttonText="去登录"
			@action="goLogin" />

		<template v-else>
			<view class="pa-list">
				<view class="pa-act card" v-for="a in list" :key="a.id" @click="goDetail(a.id)">
					<image class="pa-cover" :src="absUrl(a.cover)" mode="aspectFill" v-if="a.cover" />
					<view class="pa-cover avatar-ph" v-else><text>🎪</text></view>
					<view class="pa-body">
						<text class="pa-name line1">{{ a.name }}</text>
						<text class="pa-meta line1">🕒 {{ fmtTime(a.start) }} ~ {{ fmtTime(a.end) }}</text>
						<text class="pa-meta line1" v-if="a.address">📍 {{ a.address }}</text>
					</view>
					<text class="pa-arrow">›</text>
				</view>

				<empty-state v-if="!loading && !list.length" emoji="🗓️" text="还没有报名过活动~ 去活动中心看看吧" />
				<view class="load-more" v-if="list.length">{{ finished ? '— 到底啦 🌈 —' : (loading ? '加载中…' : '上拉加载更多') }}</view>
			</view>
		</template>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad, onShow, onReachBottom } from '@dcloudio/uni-app'
	import { selectUser } from '../../api/activity.js'
	import { absUrl, fmtTime } from '../../utils/format.js'
	import { isLogin } from '../../utils/store.js'

	const list = ref([])
	const pageNum = ref(0)
	const PAGE_SIZE = 10
	const loading = ref(false)
	const finished = ref(false)

	async function loadMore() {
		if (!isLogin() || loading.value || finished.value) return
		loading.value = true
		try {
			const page = await selectUser({ pageNum: pageNum.value + 1, pageSize: PAGE_SIZE })
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

	onShow(() => {
		if (isLogin()) resetLoad()
	})

	onReachBottom(loadMore)

	function goDetail(id) {
		uni.navigateTo({ url: '/pages/activity/detail?activityId=' + id })
	}

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}
</script>

<style>
	.pa-page {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.pa-list {
		padding: 20rpx 24rpx 0;
	}

	.pa-act {
		display: flex;
		align-items: center;
		gap: 18rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
	}

	.pa-cover {
		width: 140rpx;
		height: 140rpx;
		border-radius: 16rpx;
		flex-shrink: 0;
		font-size: 60rpx;
	}

	.pa-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.pa-name {
		font-size: 29rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	.pa-meta {
		font-size: 22rpx;
		color: var(--text-sub);
	}

	.pa-arrow {
		font-size: 44rpx;
		color: #c9bfd8;
		flex-shrink: 0;
	}
</style>
