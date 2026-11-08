<template>
	<view class="page space-page">
		<glass-navbar title="个人空间" />

		<!-- 空间头部 -->
		<view class="card sp-head" v-if="info.user">
			<image class="sp-avatar" :src="absUrl(info.user.avatar)" mode="aspectFill" v-if="info.user.avatar" />
			<view class="sp-avatar avatar-ph" v-else><text>👤</text></view>
			<view class="sp-info">
				<text class="sp-name">{{ info.user.name || info.user.username }}</text>
				<text class="sp-username">@{{ info.user.username }}</text>
				<text class="sp-bio line2" v-if="info.user.info">{{ info.user.info }}</text>
			</view>
			<view class="sp-actions" v-if="!isSelfPage">
				<view class="sp-btn" :class="{ followed: followed }" v-if="isLogin()" @click="toggleFollow">
					{{ followed ? '已关注' : '+ 关注' }}
				</view>
				<view class="sp-btn plain" v-if="isLogin()" @click="goChat">💬 私信</view>
				<view class="sp-btn plain" v-if="isLogin()" @click="goAsk">❓ 提问</view>
			</view>
			<view class="sp-actions" v-else>
				<view class="sp-btn plain" @click="goProfile">✏️ 编辑资料</view>
			</view>
		</view>

		<!-- 统计 -->
		<view class="card sp-stats" v-if="info.user">
			<view class="stat-item">
				<text class="stat-num">{{ info.blogCount || 0 }}</text>
				<text class="stat-label">文章</text>
			</view>
			<view class="stat-item">
				<text class="stat-num">{{ info.totalReads || 0 }}</text>
				<text class="stat-label">总阅读</text>
			</view>
			<view class="stat-item">
				<text class="stat-num">{{ info.fansCount || 0 }}</text>
				<text class="stat-label">粉丝</text>
			</view>
			<view class="stat-item">
				<text class="stat-num">{{ info.followCount || 0 }}</text>
				<text class="stat-label">关注</text>
			</view>
			<view class="stat-item">
				<text class="stat-num">{{ info.likesCount || 0 }}</text>
				<text class="stat-label">获赞</text>
			</view>
		</view>

		<!-- Tab 切换 -->
		<view class="sp-tabs card" v-if="info.user">
			<view class="sp-tab" :class="{ active: tab === 'blogs' }" @click="switchTab('blogs')">文章</view>
			<view class="sp-tab" :class="{ active: tab === 'fans' }" @click="switchTab('fans')">粉丝</view>
			<view class="sp-tab" :class="{ active: tab === 'following' }" @click="switchTab('following')">关注</view>
		</view>

		<!-- 内容区 -->
		<view class="sp-content">
			<template v-if="tab === 'blogs'">
				<blog-card v-for="(b, i) in blogList" :key="b.id" :blog="b" :index="i" @click="goDetail(b.id)" />
				<empty-state v-if="!loading && !blogList.length" emoji="🌱" text="TA还没有发表文章~" />
			</template>
			<template v-else>
				<user-row v-for="u in userList" :key="u.id" :user="u" @click="goUserSpace(u.id)" />
				<empty-state v-if="!loading && !userList.length"
					:emoji="tab === 'fans' ? '🛸' : '🔭'" :text="tab === 'fans' ? '还没有粉丝~' : '还没有关注别人~'" />
			</template>
			<view class="load-more" v-if="list.length">{{ finished ? '— 到底啦 🌈 —' : (loading ? '加载中…' : '上拉加载更多') }}</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { spaceInfo, spaceBlogs, spaceFans, spaceFollowing } from '../../api/space.js'
	import { follow, unfollow, isFollowed } from '../../api/interact.js'
	import { absUrl } from '../../utils/format.js'
	import { isLogin, isSelf } from '../../utils/store.js'
	import { requireLogin } from '../../utils/auth.js'

	const userId = ref('')
	const info = ref({})
	const followed = ref(false)
	const tab = ref('blogs')
	const blogList = ref([])
	const userList = ref([])
	const pageNum = ref(0)
	const PAGE_SIZE = 10
	const loading = ref(false)
	const finished = ref(false)
	// tab 内容共享一个分页流
	const list = computed(() => tab.value === 'blogs' ? blogList.value : userList.value)

	const isSelfPage = computed(() => isSelf(userId.value))

	onLoad((q) => {
		userId.value = q.userId
		loadInfo()
		// 支持从"我的"页统计栏直达 粉丝/关注 列表
		switchTab(q.tab === 'fans' || q.tab === 'following' ? q.tab : 'blogs')
	})

	function loadInfo() {
		spaceInfo(userId.value).then(d => {
			info.value = d || {}
		})
		if (isLogin() && !isSelf(userId.value)) {
			isFollowed(userId.value).then(f => {
				followed.value = !!f
			}).catch(() => { /* 忽略 */ })
		}
	}

	function switchTab(t) {
		tab.value = t
		pageNum.value = 0
		finished.value = false
		blogList.value = []
		userList.value = []
		loadMore()
	}

	async function loadMore() {
		if (loading.value || finished.value) return
		loading.value = true
		try {
			const next = pageNum.value + 1
			if (tab.value === 'blogs') {
				const page = await spaceBlogs(userId.value, { pageNum: next, pageSize: PAGE_SIZE })
				const rows = (page && page.list) || []
				blogList.value = blogList.value.concat(rows)
				if (rows.length < PAGE_SIZE) finished.value = true
			} else {
				const page = tab.value === 'fans'
					? await spaceFans(userId.value, { pageNum: next, pageSize: PAGE_SIZE })
					: await spaceFollowing(userId.value, { pageNum: next, pageSize: PAGE_SIZE })
				const rows = (page && page.list) || page || []
				userList.value = userList.value.concat(rows)
				if (!Array.isArray(rows) || rows.length < PAGE_SIZE) finished.value = true
			}
			pageNum.value = next
		} catch (e) { /* 忽略 */ } finally {
			loading.value = false
		}
	}

	onReachBottom(loadMore)

	function toggleFollow() {
		if (!requireLogin()) return
		const action = followed.value ? unfollow : follow
		action(userId.value).then(() => {
			followed.value = !followed.value
			uni.showToast({ title: followed.value ? '关注成功 🎉' : '已取消关注', icon: 'none' })
			loadInfo()
		})
	}

	function goDetail(id) {
		uni.navigateTo({ url: '/pages/blog/detail?blogId=' + id })
	}

	function goUserSpace(id) {
		if (isSelf(id)) {
			uni.switchTab({ url: '/pages/mine/mine' })
		} else {
			uni.navigateTo({ url: '/pages/space/space?userId=' + id })
		}
	}

	function goChat() {
		uni.navigateTo({
			url: '/pages/chat/chat?userId=' + userId.value + '&name=' + encodeURIComponent(info.value.user.name || info.value.user.username) +
				'&avatar=' + encodeURIComponent(info.value.user.avatar || '')
		})
	}

	function goAsk() {
		uni.navigateTo({
			url: '/pages/ask/ask?authorId=' + userId.value + '&name=' + encodeURIComponent(info.value.user.name || info.value.user.username)
		})
	}

	function goProfile() {
		uni.navigateTo({ url: '/pages/person/profile' })
	}
</script>

<style>
	.space-page {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.sp-head {
		margin: 20rpx 24rpx;
		padding: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		text-align: center;
	}

	.sp-avatar {
		width: 150rpx;
		height: 150rpx;
		border-radius: 50%;
		font-size: 75rpx;
		border: 4rpx solid rgba(255, 255, 255, 0.9);
		box-shadow: 0 10rpx 26rpx rgba(160, 120, 220, 0.3);
	}

	.sp-info {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		align-items: center;
		width: 100%;
	}

	.sp-name {
		font-size: 38rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	.sp-username {
		font-size: 24rpx;
		color: var(--text-sub);
	}

	.sp-bio {
		font-size: 25rpx;
		color: var(--text-main);
		margin-top: 6rpx;
	}

	.sp-actions {
		display: flex;
		gap: 16rpx;
		flex-wrap: wrap;
		justify-content: center;
	}

	.sp-btn {
		padding: 14rpx 32rpx;
		background: var(--brand-grad);
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 25rpx;
		font-weight: bold;
		box-shadow: 0 6rpx 16rpx rgba(183, 156, 255, 0.45);
	}

	.sp-btn.plain {
		background: rgba(255, 255, 255, 0.85);
		color: var(--purple);
		border: 1.5px solid rgba(139, 92, 246, 0.35);
		box-shadow: none;
	}

	.sp-btn.followed {
		background: rgba(255, 255, 255, 0.85);
		color: var(--text-sub);
		border: 1.5px solid rgba(155, 139, 171, 0.4);
		box-shadow: none;
	}

	.sp-stats {
		display: flex;
		padding: 24rpx 0;
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
		font-size: 32rpx;
		font-weight: bold;
		color: var(--purple);
	}

	.stat-label {
		font-size: 22rpx;
		color: var(--text-sub);
	}

	.sp-tabs {
		display: flex;
		margin: 0 24rpx 20rpx;
		padding: 10rpx;
		gap: 10rpx;
	}

	.sp-tab {
		flex: 1;
		text-align: center;
		padding: 16rpx 0;
		border-radius: 999rpx;
		font-size: 27rpx;
		color: var(--text-sub);
		transition: all 0.2s;
	}

	.sp-tab.active {
		background: var(--brand-grad);
		color: #ffffff;
		font-weight: bold;
		box-shadow: 0 6rpx 16rpx rgba(183, 156, 255, 0.45);
	}

	.sp-content {
		padding: 0 24rpx;
	}
</style>
