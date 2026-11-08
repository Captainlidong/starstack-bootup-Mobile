<template>
	<view class="page act-page statusbar-pad">
		<view class="tab-head">
			<text class="tab-title">🎪 活动中心</text>
			<text class="tab-sub">线下技术沙龙 · 线上共享活动</text>
		</view>

		<view class="act-list">
			<view class="act-card card" v-for="a in list" :key="a.id" @click="goDetail(a.id)">
				<image class="act-cover" :src="absUrl(a.cover)" mode="aspectFill" v-if="a.cover" lazy-load />
				<view class="act-cover act-cover-ph" v-else><text>🎪</text></view>
				<view class="act-body">
					<view class="act-name line1">{{ a.name }}</view>
					<view class="act-descr line2" v-if="a.descr">{{ a.descr }}</view>
					<view class="act-meta">
						<text class="act-meta-item line1">🕒 {{ fmtTime(a.start) }} ~ {{ fmtTime(a.end) }}</text>
					</view>
					<view class="act-meta">
						<text class="act-meta-item line1" v-if="a.address">📍 {{ a.address }}</text>
						<text class="act-meta-item" style="margin-left:auto;">👁 {{ a.readCount || 0 }}</text>
					</view>
				</view>
			</view>

			<empty-state v-if="!loading && !list.length" emoji="🗓️" text="暂时没有活动,敬请期待~" />
			<view class="load-more" v-if="list.length">{{ finished ? '— 到底啦 🌈 —' : (loading ? '加载中…' : '上拉加载更多') }}</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
	import { selectPage } from '../../api/activity.js'
	import { absUrl, fmtTime } from '../../utils/format.js'

	const list = ref([])
	const pageNum = ref(0)
	const PAGE_SIZE = 10
	const loading = ref(false)
	const finished = ref(false)

	async function loadMore() {
		if (loading.value || finished.value) return
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

	onLoad(() => {
		loadMore()
	})

	onReachBottom(loadMore)

	onPullDownRefresh(async () => {
		await resetLoad()
		uni.stopPullDownRefresh()
	})

	function goDetail(id) {
		uni.navigateTo({ url: '/pages/activity/detail?activityId=' + id })
	}
</script>

<style>
	.act-page {
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

	.act-list {
		padding: 16rpx 24rpx 0;
	}

	.act-card {
		margin-bottom: 24rpx;
		overflow: hidden;
		transition: transform 0.15s;
	}

	.act-card:active {
		transform: scale(0.985);
	}

	.act-cover {
		width: 100%;
		height: 300rpx;
		display: block;
		background: #f1e9fb;
	}

	.act-cover-ph {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 90rpx;
		background: linear-gradient(135deg, rgba(183, 156, 255, 0.35), rgba(255, 158, 207, 0.35));
	}

	.act-body {
		padding: 22rpx 24rpx;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.act-name {
		font-size: 31rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	.act-descr {
		font-size: 25rpx;
		color: #8d82a3;
		line-height: 1.5;
	}

	.act-meta {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.act-meta-item {
		font-size: 23rpx;
		color: var(--text-sub);
	}
</style>
