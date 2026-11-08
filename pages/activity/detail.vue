<template>
	<view class="page actd-page" v-if="activity">
		<glass-navbar title="活动详情" />

		<view class="actd-body">
			<!-- 头图 -->
			<image class="actd-cover" :src="absUrl(activity.cover)" mode="aspectFill" v-if="activity.cover" />
			<view class="actd-cover actd-cover-ph" v-else><text>🎪</text></view>

			<view class="card actd-card">
				<view class="actd-name">{{ activity.name }}</view>
				<view class="actd-descr" v-if="activity.descr">{{ activity.descr }}</view>

				<view class="actd-meta">
					<view class="meta-line" v-if="activity.start || activity.end">
						<text class="meta-icon">🕒</text>
						<text class="meta-text">{{ fmtTime(activity.start) }} ~ {{ fmtTime(activity.end) }}</text>
					</view>
					<view class="meta-line" v-if="activity.address">
						<text class="meta-icon">📍</text>
						<text class="meta-text">{{ activity.address }}</text>
					</view>
					<view class="meta-line" v-if="activity.form">
						<text class="meta-icon">🎯</text>
						<text class="meta-text">形式:{{ activity.form }}</text>
					</view>
					<view class="meta-line" v-if="activity.host">
						<text class="meta-icon">🏠</text>
						<text class="meta-text">主办方:{{ activity.host }}</text>
					</view>
					<view class="meta-line">
						<text class="meta-icon">👁</text>
						<text class="meta-text">{{ activity.readCount || 0 }} 次浏览</text>
					</view>
				</view>

				<!-- 报名按钮 -->
				<view class="pill-btn mint sign-btn" v-if="!activity.isEnd && !activity.isSign" @click="doSign">📝 立即报名</view>
				<view class="pill-btn plain sign-btn" v-else-if="!activity.isEnd && activity.isSign" @click="doCancelSign">✅ 已报名,点击取消</view>
				<view class="pill-btn disabled sign-btn" v-else>本活动已结束</view>

				<!-- 活动介绍 -->
				<view class="actd-content">
					<view class="sec-title">📄 活动介绍</view>
					<view class="actd-content-body">
						<rich-text :nodes="contentHtml"></rich-text>
					</view>
				</view>
			</view>

			<!-- 评论区 -->
			<comment-section :fid="activityId" module="活动" />

			<view class="bar-holder safe-bottom"></view>
		</view>

		<!-- 底部操作栏 -->
		<view class="actd-bar safe-bottom">
			<view class="bar-item" :class="{ on: activity.isLike }" @click="doLike">
				<text class="bar-icon">👍</text>
				<text class="bar-num">{{ activity.likesCount || 0 }}</text>
			</view>
			<view class="bar-item" :class="{ on: activity.isCollect }" @click="doCollect">
				<text class="bar-icon">⭐</text>
				<text class="bar-num">{{ activity.collectCount || 0 }}</text>
			</view>
			<view class="bar-item" @click="doShare">
				<text class="bar-icon">🔗</text>
				<text class="bar-num">分享</text>
			</view>
			<view class="bar-item" @click="doReport">
				<text class="bar-icon">🚩</text>
				<text class="bar-num">举报</text>
			</view>
			<view class="bar-sign" v-if="!activity.isEnd && !activity.isSign" @click="doSign">立即报名</view>
			<view class="bar-sign signed" v-else-if="!activity.isEnd" @click="doCancelSign">已报名</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { selectById, updateReadCount, sign, cancelSign } from '../../api/activity.js'
	import { setLikes, setCollect, addReport } from '../../api/interact.js'
	import { absUrl, fmtTime, formatRichText } from '../../utils/format.js'
	import { isLogin, store } from '../../utils/store.js'
	import { requireLogin } from '../../utils/auth.js'
	import { WEB_URL } from '../../config.js'

	const activityId = ref('')
	const activity = ref(null)

	const contentHtml = computed(() => formatRichText(activity.value && activity.value.content))

	onLoad((q) => {
		activityId.value = q.activityId
		loadAll()
	})

	function loadAll() {
		if (!activityId.value) return
		selectById(activityId.value).then(data => {
			activity.value = data
		})
		updateReadCount(activityId.value).catch(() => { /* 忽略 */ })
	}

	function reload() {
		selectById(activityId.value).then(data => {
			activity.value = data
		})
	}

	function doSign() {
		if (!requireLogin()) return
		sign(activityId.value).then(() => {
			uni.showToast({ title: '报名成功 🎉', icon: 'none' })
			reload()
		})
	}

	function doCancelSign() {
		uni.showModal({
			title: '取消报名',
			content: '确定要取消报名这个活动吗?',
			confirmColor: '#e8619c',
			success: (res) => {
				if (res.confirm) {
					cancelSign(activityId.value, store.user.id).then(() => {
						uni.showToast({ title: '已取消报名', icon: 'none' })
						reload()
					})
				}
			}
		})
	}

	function doLike() {
		if (!requireLogin()) return
		setLikes({ fid: activityId.value, module: '活动' }).then(reload)
	}

	function doCollect() {
		if (!requireLogin()) return
		setCollect({ fid: activityId.value, module: '活动' }).then(reload)
	}

	function doShare() {
		uni.setClipboardData({
			data: WEB_URL + '/front/activityDetail?activityId=' + activityId.value,
			success: () => uni.showToast({ title: '链接已复制~', icon: 'none' })
		})
	}

	function doReport() {
		if (!requireLogin()) return
		uni.showModal({
			title: '举报该活动',
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
					addReport({ targetType: 'ACTIVITY', targetId: activityId.value, reason }).then(() => {
						uni.showToast({ title: '举报成功,感谢反馈', icon: 'success' })
					})
				}
			}
		})
	}
</script>

<style>
	.actd-page {
		min-height: 100vh;
	}

	.actd-body {
		padding: 20rpx 0 0;
	}

	.actd-cover {
		width: calc(100% - 48rpx);
		margin: 0 24rpx 24rpx;
		height: 340rpx;
		border-radius: var(--card-radius);
		display: block;
		background: #f1e9fb;
		box-shadow: var(--card-shadow);
	}

	.actd-cover-ph {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 100rpx;
		background: linear-gradient(135deg, rgba(183, 156, 255, 0.4), rgba(255, 158, 207, 0.4));
	}

	.actd-card {
		margin: 0 24rpx 24rpx;
		padding: 30rpx 28rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.actd-name {
		font-size: 40rpx;
		font-weight: bold;
		color: var(--title-c);
		line-height: 1.4;
	}

	.actd-descr {
		font-size: 27rpx;
		color: #8d82a3;
		line-height: 1.6;
	}

	.actd-meta {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		padding: 20rpx;
		background: rgba(243, 232, 255, 0.45);
		border-radius: 16rpx;
	}

	.meta-line {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.meta-icon {
		font-size: 26rpx;
		width: 40rpx;
		text-align: center;
		flex-shrink: 0;
	}

	.meta-text {
		font-size: 25rpx;
		color: var(--text-main);
	}

	.sign-btn {
		margin: 6rpx 0;
	}

	.pill-btn.disabled {
		opacity: 0.55;
	}

	.actd-content {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		padding-top: 10rpx;
		border-top: 1.5px dashed rgba(183, 156, 255, 0.35);
	}

	.actd-content-body {
		font-size: 29rpx;
		line-height: 1.85;
		color: #3f3a4d;
		word-break: break-word;
	}

	.bar-holder {
		height: 130rpx;
	}

	.actd-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		gap: 6rpx;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border-top: 1.5px solid rgba(255, 255, 255, 0.7);
		padding: 14rpx 16rpx;
		z-index: 90;
	}

	.bar-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rpx;
	}

	.bar-icon {
		font-size: 38rpx;
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
		font-size: 20rpx;
		color: var(--text-sub);
	}

	.bar-sign {
		flex: 2.2;
		text-align: center;
		padding: 20rpx 0;
		background: var(--mint-grad);
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 28rpx;
		font-weight: bold;
		box-shadow: 0 8rpx 20rpx rgba(52, 211, 153, 0.4);
	}

	.bar-sign.signed {
		background: rgba(255, 255, 255, 0.9);
		color: var(--mint-1);
		border: 1.5px solid rgba(52, 211, 153, 0.5);
		box-shadow: none;
	}
</style>
