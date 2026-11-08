<template>
	<view class="cmt-wrap card">
		<view id="comment-anchor" class="cmt-head">
			<text class="sec-title">💬 评论</text>
			<text class="cmt-count" v-if="count > 0">{{ count }} 条</text>
		</view>

		<empty-state v-if="!loading && !list.length" emoji="🕊️" text="还没有评论,来抢沙发吧~" />

		<view class="cmt-list">
			<view class="cmt-item" v-for="c in list" :key="c.id">
				<view class="cmt-row">
					<image class="c-avatar" :src="absUrl(c.userAvatar)" mode="aspectFill" v-if="c.userAvatar" />
					<view class="c-avatar avatar-ph" v-else><text>👤</text></view>
					<view class="c-body">
						<view class="c-top">
							<text class="c-name">{{ c.userName || '路人' }}</text>
							<text class="c-time">{{ fmtTime(c.time) }}</text>
						</view>
						<view class="c-content">{{ c.content }}</view>
						<view class="c-actions">
							<text class="c-act" @click="startReply(c)">回复</text>
							<text class="c-act danger" v-if="isMine(c)" @click="remove(c)">删除</text>
						</view>
					</view>
				</view>
				<!-- 楼中楼 -->
				<view class="c-children" v-if="c.children && c.children.length">
					<view class="cmt-row child" v-for="r in c.children" :key="r.id">
						<image class="c-avatar sm" :src="absUrl(r.userAvatar)" mode="aspectFill" v-if="r.userAvatar" />
						<view class="c-avatar sm avatar-ph" v-else><text>👤</text></view>
						<view class="c-body">
							<view class="c-top">
								<text class="c-name">{{ r.userName || '路人' }}</text>
								<text class="c-reply-to" v-if="replyName(r)">回复 @{{ replyName(r) }}</text>
								<text class="c-time">{{ fmtTime(r.time) }}</text>
							</view>
							<view class="c-content">{{ r.content }}</view>
							<view class="c-actions">
								<text class="c-act" @click="startReply(r, c)">回复</text>
								<text class="c-act danger" v-if="isMine(r)" @click="remove(r)">删除</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 回复提示 -->
		<view class="reply-tip" v-if="replyTo">
			<text class="line1">回复 @{{ replyTo.userName || '路人' }}</text>
			<text class="reply-cancel" @click="cancelReply">✕</text>
		</view>

		<!-- 输入区 -->
		<view class="cmt-input-row" v-if="isLogin()">
			<view class="cmt-input-box">
				<input class="cmt-input" v-model="input" :placeholder="replyTo ? '回复 @' + (replyTo.userName || '路人') + '…' : '友善评论,理性发言~'"
					placeholder-class="ph" :maxlength="500" confirm-type="send" @confirm="submit" />
			</view>
			<view class="cmt-send" :class="{ disabled: !input.trim() || sending }" @click="submit">{{ sending ? '…' : '发送' }}</view>
		</view>
		<view class="cmt-login-tip" v-else @click="goLogin">
			<text>👋 登录后参与评论</text>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { absUrl, fmtTime } from '../../utils/format.js'
	import { isLogin, store } from '../../utils/store.js'
	import { requireLogin } from '../../utils/auth.js'
	import { getComments, getCommentCount, addComment, deleteComment } from '../../api/interact.js'

	const props = defineProps({
		fid: { type: [String, Number], required: true },
		module: { type: String, required: true } // '博客' | '活动'
	})

	const list = ref([])
	const count = ref(0)
	const loading = ref(false)
	const input = ref('')
	const replyTo = ref(null) // 被回复的评论
	const replyRoot = ref(null) // 楼中楼回复时所在的根评论
	const sending = ref(false)

	load()

	function load() {
		loading.value = true
		Promise.all([
			getComments(props.fid, props.module),
			getCommentCount(props.fid, props.module)
		]).then(([rows, cnt]) => {
			list.value = rows || []
			count.value = Number(cnt) || 0
		}).catch(() => { /* 接口异常时静默 */ }).finally(() => {
			loading.value = false
		})
	}

	function isMine(c) {
		return isLogin() && String(c.userId) === String(store.user.id)
	}

	function replyName(r) {
		if (!r) return ''
		if (typeof r.replyUser === 'string') return r.replyUser
		return (r.replyUser && r.replyUser.name) || ''
	}

	function startReply(comment, root) {
		if (!requireLogin()) return
		replyTo.value = comment
		replyRoot.value = root || null
	}

	function cancelReply() {
		replyTo.value = null
		replyRoot.value = null
	}

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}

	function submit() {
		if (!requireLogin()) return
		const content = input.value.trim()
		if (!content) {
			uni.showToast({ title: '说点什么吧~', icon: 'none' })
			return
		}
		if (sending.value) return
		sending.value = true
		const target = replyTo.value
		const data = {
			content,
			fid: props.fid,
			module: props.module
		}
		if (target) {
			data.pid = target.id
			data.rootId = (target.rootId != null && target.rootId !== 0) ? target.rootId : target.id
		}
		addComment(data).then(() => {
			input.value = ''
			cancelReply()
			uni.showToast({ title: '评论成功', icon: 'success' })
			load()
		}).catch(() => { /* 错误提示已在 request 层弹出 */ }).finally(() => {
			sending.value = false
		})
	}

	function remove(c) {
		uni.showModal({
			title: '删除评论',
			content: '确定删除这条评论吗?',
			confirmColor: '#e8619c',
			success: (res) => {
				if (res.confirm) {
					deleteComment(c.id).then(() => {
						uni.showToast({ title: '已删除', icon: 'success' })
						load()
					})
				}
			}
		})
	}
</script>

<style>
	.cmt-wrap {
		padding: 26rpx;
		margin: 0 24rpx 24rpx;
	}

	.cmt-head {
		display: flex;
		align-items: center;
		gap: 14rpx;
		padding-bottom: 20rpx;
		border-bottom: 1.5px dashed rgba(183, 156, 255, 0.35);
	}

	.cmt-count {
		font-size: 23rpx;
		color: var(--text-sub);
	}

	.cmt-list {
		margin-top: 8rpx;
	}

	.cmt-item {
		padding: 20rpx 0;
		border-bottom: 1.5px dashed rgba(183, 156, 255, 0.18);
	}

	.cmt-item:last-child {
		border-bottom: none;
	}

	.cmt-row {
		display: flex;
		gap: 16rpx;
	}

	.c-avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		flex-shrink: 0;
		font-size: 32rpx;
	}

	.c-avatar.sm {
		width: 48rpx;
		height: 48rpx;
		font-size: 24rpx;
	}

	.c-body {
		flex: 1;
		min-width: 0;
	}

	.c-top {
		display: flex;
		align-items: center;
		gap: 12rpx;
		flex-wrap: wrap;
	}

	.c-name {
		font-size: 25rpx;
		font-weight: bold;
		color: var(--purple);
	}

	.c-reply-to {
		font-size: 22rpx;
		color: var(--pink);
	}

	.c-time {
		font-size: 21rpx;
		color: var(--text-sub);
		margin-left: auto;
	}

	.c-content {
		font-size: 27rpx;
		color: var(--text-main);
		line-height: 1.6;
		margin-top: 6rpx;
		word-break: break-all;
	}

	.c-actions {
		display: flex;
		gap: 28rpx;
		margin-top: 8rpx;
	}

	.c-act {
		font-size: 22rpx;
		color: var(--text-sub);
	}

	.c-act.danger {
		color: #e05c5c;
	}

	.c-children {
		margin-top: 16rpx;
		margin-left: 80rpx;
		padding: 14rpx 16rpx;
		background: rgba(243, 232, 255, 0.45);
		border-radius: 14rpx;
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.reply-tip {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 10rpx 0;
		padding: 10rpx 20rpx;
		background: #f3e8ff;
		border-radius: 12rpx;
		font-size: 23rpx;
		color: var(--purple);
		max-width: 100%;
	}

	.reply-cancel {
		padding: 0 10rpx;
		color: var(--text-sub);
	}

	.cmt-input-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-top: 16rpx;
	}

	.cmt-input-box {
		flex: 1;
		background: rgba(255, 255, 255, 0.9);
		border: 1.5px solid rgba(183, 156, 255, 0.35);
		border-radius: 999rpx;
		padding: 12rpx 26rpx;
	}

	.cmt-input {
		font-size: 26rpx;
		width: 100%;
	}

	.cmt-send {
		padding: 14rpx 34rpx;
		background: var(--brand-grad);
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 26rpx;
		font-weight: bold;
		flex-shrink: 0;
	}

	.cmt-send.disabled {
		opacity: 0.5;
	}

	.cmt-login-tip {
		margin-top: 16rpx;
		text-align: center;
		padding: 18rpx;
		background: rgba(243, 232, 255, 0.6);
		border-radius: 14rpx;
		color: var(--purple);
		font-size: 25rpx;
	}
</style>
