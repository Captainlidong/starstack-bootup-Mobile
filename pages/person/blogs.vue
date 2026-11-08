<template>
	<view class="page pb-page">
		<glass-navbar :title="pageTitle">
			<template #right>
				<view class="pub-capsule" @click="goEdit()">＋ 创作</view>
			</template>
		</glass-navbar>

		<guide-card v-if="!isLogin()" emoji="🔐" text="登录后即可管理你发布的博客与草稿~" buttonText="去登录"
			@action="goLogin" />

		<template v-else>
			<view class="pb-list">
				<view class="pb-item-wrap" v-for="(b, i) in list" :key="b.id">
					<blog-card :blog="b" :index="i" :showStatus="true" @click="onCardTap(b)" />
					<view class="pb-actions">
						<view class="pb-act" @click="goEdit(b.id)">✏️ 编辑</view>
						<view class="pb-act danger" @click="remove(b.id)">🗑️ 删除</view>
					</view>
				</view>

				<empty-state v-if="!loading && !list.length"
					:emoji="isDraft ? '📋' : '📝'"
					:text="isDraft ? '草稿箱是空的~ 快去写点东西吧' : '你还没有发表过博客'" />
				<view class="load-more" v-if="list.length">{{ finished ? '— 到底啦 🌈 —' : (loading ? '加载中…' : '上拉加载更多') }}</view>
			</view>
		</template>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onLoad, onShow, onReachBottom } from '@dcloudio/uni-app'
	import { selectUserBlog, deleteBlog } from '../../api/blog.js'
	import { isLogin } from '../../utils/store.js'

	const status = ref('PUBLISHED')
	const list = ref([])
	const pageNum = ref(0)
	const PAGE_SIZE = 10
	const loading = ref(false)
	const finished = ref(false)

	const isDraft = computed(() => status.value === 'DRAFT')
	const pageTitle = computed(() => isDraft.value ? '📋 草稿箱' : '📝 我的博客')

	onLoad((q) => {
		if (q.status) status.value = q.status
	})

	onShow(() => {
		// 从编辑页返回时刷新列表
		if (isLogin()) resetLoad()
	})

	async function loadMore() {
		if (!isLogin() || loading.value || finished.value) return
		loading.value = true
		try {
			const page = await selectUserBlog({ pageNum: pageNum.value + 1, pageSize: PAGE_SIZE, status: status.value })
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

	onReachBottom(loadMore)

	function onCardTap(b) {
		// 草稿/待审核/驳回 直接进编辑页,已发布进详情
		if (isDraft.value || b.status === 'PENDING' || b.status === 'REJECTED') {
			goEdit(b.id)
		} else {
			goDetail(b.id)
		}
	}

	function goDetail(id) {
		uni.navigateTo({ url: '/pages/blog/detail?blogId=' + id })
	}

	function goEdit(id) {
		uni.navigateTo({ url: id ? '/pages/blog/edit?blogId=' + id : '/pages/blog/edit' })
	}

	function remove(id) {
		uni.showModal({
			title: '删除博客',
			content: isDraft.value ? '确定删除这篇草稿吗?' : '删除后不可恢复,确定删除吗?',
			confirmColor: '#e8619c',
			success: (res) => {
				if (res.confirm) {
					deleteBlog(id).then(() => {
						uni.showToast({ title: '已删除', icon: 'success' })
						resetLoad()
					})
				}
			}
		})
	}

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}
</script>

<style>
	.pb-page {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.pub-capsule {
		padding: 10rpx 26rpx;
		background: var(--brand-grad);
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 25rpx;
		font-weight: bold;
		box-shadow: 0 6rpx 16rpx rgba(183, 156, 255, 0.45);
		transition: transform 0.15s;
	}

	.pub-capsule:active {
		transform: scale(0.94);
	}

	.pb-list {
		padding: 20rpx 24rpx 0;
	}

	.pb-item-wrap {
		position: relative;
	}

	.pb-actions {
		display: flex;
		justify-content: flex-end;
		gap: 16rpx;
		margin: -8rpx 0 24rpx;
	}

	.pb-act {
		padding: 10rpx 28rpx;
		background: rgba(255, 255, 255, 0.85);
		border: 1.5px solid rgba(139, 92, 246, 0.35);
		color: var(--purple);
		border-radius: 999rpx;
		font-size: 23rpx;
	}

	.pb-act.danger {
		border-color: rgba(224, 92, 92, 0.45);
		color: #e05c5c;
	}
</style>
