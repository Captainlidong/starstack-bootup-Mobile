<template>
	<view class="page detail-page">
		<glass-navbar title="博客详情">
			<template #right>
				<text class="nav-act" @click="loadAll">⟳ 刷新</text>
			</template>
		</glass-navbar>

		<view class="detail-body" v-if="blog">
			<!-- 正文卡片 -->
			<view class="card detail-card">
				<view class="d-title-row">
					<text v-if="blog.top === 1" class="mini-tag top-tag">置顶</text>
					<text class="d-title">{{ blog.title }}</text>
				</view>

				<!-- 作者行 -->
				<view class="d-author" @click="goSpace(blog.userId)">
					<image class="d-avatar" :src="absUrl(blog.userAvatar)" mode="aspectFill" v-if="blog.userAvatar" />
					<view class="d-avatar avatar-ph" v-else><text>👤</text></view>
					<view class="d-author-info">
						<text class="d-author-name">{{ blog.userName || '佚名' }}</text>
						<text class="d-sub line1">{{ fmtTime(blog.date) }} · 👁 {{ blog.readCount || 0 }}<template v-if="blog.categoryName"> · {{ blog.categoryName }}</template></text>
					</view>
					<view class="d-follow" :class="{ followed: followed }" v-if="showFollowBtn" @click.stop="toggleFollow">
						{{ followed ? '已关注' : '+ 关注' }}
					</view>
				</view>

				<view class="tag-row" v-if="tags.length">
					<text class="tag" v-for="(t, i) in tags" :key="i">{{ t }}</text>
				</view>

				<!-- 正文(rich-text 渲染 wangEditor HTML) -->
				<view class="d-content">
					<rich-text :nodes="contentHtml" space="nbsp"></rich-text>
				</view>
			</view>

			<!-- 相关推荐 -->
			<view class="card rel-card" v-if="relList.length">
				<view class="sec-title">📖 相关推荐</view>
				<view class="rel-item" v-for="b in relList" :key="b.id" @click="goDetail(b.id)">
					<text class="rel-title line1">{{ b.title }}</text>
					<text class="rel-meta">👍 {{ b.likesCount || 0 }}</text>
				</view>
			</view>

			<!-- 评论区 -->
			<comment-section :fid="blogId" module="博客" />

			<view class="bar-holder safe-bottom"></view>
		</view>

		<!-- 底部操作栏 -->
		<view class="detail-bar safe-bottom" v-if="blog">
			<view class="bar-item" :class="{ on: blog.userLike }" @click="doLike">
				<text class="bar-icon">👍</text>
				<text class="bar-num">{{ blog.likesCount || 0 }}</text>
			</view>
			<view class="bar-item" @click="scrollToComments">
				<text class="bar-icon">💬</text>
				<text class="bar-num">{{ commentCount }}</text>
			</view>
			<view class="bar-item" :class="{ on: blog.userCollect }" @click="doCollect">
				<text class="bar-icon">⭐</text>
				<text class="bar-num">{{ blog.collectCount || 0 }}</text>
			</view>
			<view class="bar-item" @click="doShare">
				<text class="bar-icon">🔗</text>
				<text class="bar-num">分享</text>
			</view>
			<view class="bar-item" @click="doReport">
				<text class="bar-icon">🚩</text>
				<text class="bar-num">举报</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
	import { selectById, selectRecommend, updateReadCount } from '../../api/blog.js'
	import { setLikes, setCollect, follow, unfollow, isFollowed, getCommentCount, addReport } from '../../api/interact.js'
	import { spaceInfo } from '../../api/space.js'
import { absUrl, parseTags, fmtTime, formatRichText } from '../../utils/format.js'
import { isLogin, isSelf } from '../../utils/store.js'
import { requireLogin } from '../../utils/auth.js'
import { WEB_URL } from '../../config.js'

	const blogId = ref('')
	const blog = ref(null)
	const relList = ref([])
	const followed = ref(false)
	const commentCount = ref(0)

	const tags = computed(() => parseTags(blog.value && blog.value.tags))
	const contentHtml = computed(() => formatRichText(blog.value && blog.value.content))
	// 作者本人/未登录时不显示关注按钮;管理员登录网页端管理
	const showFollowBtn = computed(() => {
		if (!blog.value) return false
		return isLogin() && !isSelf(blog.value.userId)
	})

	onLoad((q) => {
		blogId.value = q.blogId
		loadAll()
	})

	function loadAll() {
		if (!blogId.value) return
		selectById(blogId.value).then(data => {
			blog.value = data
			if (isLogin() && data && data.userId && !isSelf(data.userId)) checkFollow()
		})
		updateReadCount(blogId.value).catch(() => { /* 阅读量失败可忽略 */ })
		selectRecommend(blogId.value).then(rows => {
			relList.value = (rows || []).filter(b => String(b.id) !== String(blogId.value)).slice(0, 5)
		}).catch(() => { /* 忽略 */ })
		getCommentCount(blogId.value, '博客').then(c => {
			commentCount.value = Number(c) || 0
		}).catch(() => { /* 忽略 */ })
	}

	function checkFollow() {
		const authorId = blog.value && blog.value.userId
		if (!authorId) return
		isFollowed(authorId).then(f => {
			followed.value = !!f
		}).catch(() => { /* 忽略 */ })
	}

	function toggleFollow() {
		if (!requireLogin()) return
		const authorId = blog.value.userId
		const action = followed.value ? unfollow : follow
		action(authorId).then(() => {
			followed.value = !followed.value
			uni.showToast({ title: followed.value ? '关注成功 🎉' : '已取消关注', icon: 'none' })
		})
	}

	function doLike() {
		if (!requireLogin()) return
		setLikes({ fid: blogId.value, module: '博客' }).then(() => {
			// 重新拉取获取最新计数与状态
			selectById(blogId.value).then(d => { blog.value = d })
		})
	}

	function doCollect() {
		if (!requireLogin()) return
		setCollect({ fid: blogId.value, module: '博客' }).then(() => {
			selectById(blogId.value).then(d => { blog.value = d })
		})
	}

	function doShare() {
		const url = WEB_URL + '/front/blogDetail?blogId=' + blogId.value
		uni.setClipboardData({
			data: url,
			success: () => {
				uni.showToast({ title: '链接已复制,快去分享吧~', icon: 'none' })
			}
		})
	}

	function doReport() {
		if (!requireLogin()) return
		uni.showModal({
			title: '举报该文章',
			editable: true,
			placeholderText: '请填写举报原因(必填)',
			confirmColor: '#e8619c',
			success: (res) => {
				if (res.confirm) {
					const reason = (res.content || '').trim()
					if (!reason) {
						uni.showToast({ title: '请填写举报原因', icon: 'none' })
						return
					}
					addReport({ targetType: 'BLOG', targetId: blogId.value, reason }).then(() => {
						uni.showToast({ title: '举报成功,感谢你的反馈', icon: 'success' })
					})
				}
			}
		})
	}

	function scrollToComments() {
		uni.pageScrollTo({
			selector: '#comment-anchor',
			duration: 300,
			offsetTop: -20
		})
	}

	function goSpace(userId) {
		if (!userId) return
		uni.navigateTo({ url: '/pages/space/space?userId=' + userId })
	}

	function goDetail(id) {
		uni.redirectTo({ url: '/pages/blog/detail?blogId=' + id })
	}
</script>

<style>
	.detail-page {
		min-height: 100vh;
	}

	.nav-act {
		color: #ffffff;
		font-size: 26rpx;
	}

	.detail-body {
		padding: 20rpx 0 0;
	}

	.detail-card {
		margin: 0 24rpx 24rpx;
		padding: 30rpx 28rpx;
	}

	.d-title-row {
		margin-bottom: 20rpx;
	}

	.mini-tag {
		display: inline-block;
		vertical-align: middle;
		padding: 0 12rpx;
		border-radius: 8rpx;
		font-size: 20rpx;
		margin-right: 8rpx;
		line-height: 1.7;
	}

	.top-tag {
		background: linear-gradient(135deg, #ff9ecf, #e8619c);
		color: #ffffff;
	}

	.d-title {
		font-size: 40rpx;
		font-weight: bold;
		color: var(--title-c);
		line-height: 1.45;
	}

	.d-author {
		display: flex;
		align-items: center;
		gap: 18rpx;
		padding: 20rpx;
		background: rgba(243, 232, 255, 0.45);
		border-radius: 16rpx;
		margin-bottom: 20rpx;
	}

	.d-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		flex-shrink: 0;
		font-size: 40rpx;
	}

	.d-author-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.d-author-name {
		font-size: 29rpx;
		font-weight: bold;
		color: var(--purple);
	}

	.d-sub {
		font-size: 22rpx;
		color: var(--text-sub);
	}

	.d-follow {
		padding: 12rpx 26rpx;
		background: var(--brand-grad);
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 24rpx;
		font-weight: bold;
		flex-shrink: 0;
		box-shadow: 0 6rpx 16rpx rgba(183, 156, 255, 0.45);
	}

	.d-follow.followed {
		background: rgba(255, 255, 255, 0.85);
		color: var(--text-sub);
		border: 1.5px solid rgba(155, 139, 171, 0.4);
		box-shadow: none;
	}

	.tag-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 24rpx;
	}

	/* 正文排版 */
	.d-content {
		font-size: 29rpx;
		line-height: 1.85;
		color: #3f3a4d;
		word-break: break-word;
	}

	/* 代码高亮(monokai-sublime 核心配色,内容已带 hljs-* 类) */
	.d-content :deep(.hljs-comment),
	.d-content :deep(.hljs-quote) {
		color: #9995b7;
		font-style: italic;
	}

	.d-content :deep(.hljs-keyword),
	.d-content :deep(.hljs-selector-tag),
	.d-content :deep(.hljs-literal),
	.d-content :deep(.hljs-type) {
		color: #ff79c6;
	}

	.d-content :deep(.hljs-string),
	.d-content :deep(.hljs-regexp),
	.d-content :deep(.hljs-addition) {
		color: #a6e22e;
	}

	.d-content :deep(.hljs-number),
	.d-content :deep(.hljs-built_in),
	.d-content :deep(.hljs-symbol) {
		color: #ae81ff;
	}

	.d-content :deep(.hljs-title),
	.d-content :deep(.hljs-title.function_),
	.d-content :deep(.hljs-class .hljs-title),
	.d-content :deep(.hljs-section) {
		color: #66d9ef;
	}

	.d-content :deep(.hljs-attr),
	.d-content :deep(.hljs-attribute),
	.d-content :deep(.hljs-variable),
	.d-content :deep(.hljs-template-variable) {
		color: #fd971f;
	}

	.d-content :deep(.hljs-name) {
		color: #f92672;
	}

	.d-content :deep(.hljs-meta) {
		color: #75715e;
	}

	.rel-card {
		margin: 0 24rpx 24rpx;
		padding: 24rpx 28rpx;
	}

	.rel-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 16rpx 0;
		border-bottom: 1.5px dashed rgba(183, 156, 255, 0.2);
	}

	.rel-item:last-child {
		border-bottom: none;
	}

	.rel-title {
		flex: 1;
		font-size: 26rpx;
		color: var(--text-main);
	}

	.rel-meta {
		font-size: 21rpx;
		color: var(--text-sub);
		flex-shrink: 0;
	}

	.bar-holder {
		height: 130rpx;
	}

	.detail-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border-top: 1.5px solid rgba(255, 255, 255, 0.7);
		box-shadow: 0 -6rpx 24rpx rgba(160, 120, 220, 0.15);
		padding: 14rpx 10rpx;
		z-index: 90;
	}

	.bar-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rpx;
		padding: 6rpx 0;
		border-radius: 14rpx;
		transition: background 0.15s;
	}

	.bar-item:active {
		background: rgba(243, 232, 255, 0.8);
	}

	.bar-icon {
		font-size: 40rpx;
		filter: grayscale(60%);
		opacity: 0.75;
	}

	.bar-item.on .bar-icon {
		filter: none;
		opacity: 1;
	}

	.bar-item.on .bar-num {
		color: var(--pink);
		font-weight: bold;
	}

	.bar-num {
		font-size: 21rpx;
		color: var(--text-sub);
	}
</style>
