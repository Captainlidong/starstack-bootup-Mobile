<template>
	<view class="page chat-page">
		<glass-navbar :title="chatName" :holder="false" />

		<view class="chat-main" :style="{ top: navTop + 'px' }">
			<scroll-view class="msg-scroll" scroll-y :scroll-into-view="anchorId" scroll-with-animation>
				<view class="msg-list">
					<view class="load-tip" v-if="!loading && !messages.length">还没有消息,打个招呼吧~ 👋</view>
					<view v-for="(m, i) in messages" :key="(m.id || i) + '-' + i">
						<!-- 时间分隔 -->
						<view class="msg-time" v-if="showTime(i)">{{ fmtChatTime(m.time) }}</view>
						<!-- 消息气泡 -->
						<view class="msg-row" :class="{ mine: isMine(m) }" :id="'msg-' + i">
							<image class="msg-avatar" :src="absUrl(isMine(m) ? store.user.avatar : otherAvatar)"
								mode="aspectFill" v-if="isMine(m) ? store.user.avatar : otherAvatar" />
							<view class="msg-avatar avatar-ph" v-else><text>👤</text></view>
							<view class="bubble">{{ m.content }}</view>
						</view>
					</view>
					<view id="chat-bottom" class="chat-bottom-pad"></view>
				</view>
			</scroll-view>
		</view>

		<!-- 输入栏 -->
		<view class="chat-input-bar safe-bottom">
			<textarea class="chat-input" v-model="input" :maxlength="500" auto-height :adjust-position="true"
				placeholder="输入消息…" placeholder-class="ph" :disable-default-padding="true"
				@confirm="send" confirm-type="send" />
			<view class="chat-send" :class="{ disabled: !input.trim() || sending }" @click="send">发送</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed, nextTick } from 'vue'
	import { onLoad, onShow, onUnload, onReady } from '@dcloudio/uni-app'
	import { getHistory, sendMessage, markRead } from '../../api/message.js'
	import { absUrl, fmtTime } from '../../utils/format.js'
	import { store, isLogin } from '../../utils/store.js'
	import { requireLogin } from '../../utils/auth.js'
	import { on as wsOn, off as wsOff } from '../../utils/ws.js'
	import { refreshBadges } from '../../utils/badge.js'

	const userId = ref('') // 对方用户 id
	const chatName = ref('私信')
	const otherAvatar = ref('')
	const messages = ref([])
	const input = ref('')
	const sending = ref(false)
	const loading = ref(false)
	const anchorId = ref('')

	// 自定义导航占位
	const statusBarHeight = uni.getWindowInfo ? uni.getWindowInfo().statusBarHeight || 0 : 0
	const navTop = statusBarHeight + 44

	function isMine(m) {
		return store.user && String(m.senderId) === String(store.user.id)
	}

	function showTime(i) {
		if (i === 0) return true
		const prev = new Date(String(messages.value[i - 1].time).replace(/-/g, '/')).getTime()
		const cur = new Date(String(messages.value[i].time).replace(/-/g, '/')).getTime()
		if (isNaN(prev) || isNaN(cur)) return false
		return cur - prev > 5 * 60 * 1000
	}

	// 聊天时间戳展示为短格式 "MM-DD HH:MM"
	function fmtChatTime(t) {
		return fmtTime(t).slice(5)
	}

	function loadHistory() {
		if (!userId.value) return
		loading.value = true
		getHistory(userId.value).then(rows => {
			messages.value = rows || []
			scrollBottom()
			// 取最后一条对方的头像补充展示
			const otherMsg = messages.value.find(m => !isMine(m))
			if (otherMsg && otherMsg.senderAvatar) otherAvatar.value = otherMsg.senderAvatar
		}).catch(() => { /* 忽略 */ }).finally(() => {
			loading.value = false
		})
	}

	function scrollBottom() {
		nextTick(() => {
			anchorId.value = ''
			setTimeout(() => { anchorId.value = 'chat-bottom' }, 80)
		})
	}

	onLoad((q) => {
		if (!requireLogin()) return
		userId.value = q.userId
		if (q.name) chatName.value = decodeURIComponent(q.name)
		if (q.avatar) otherAvatar.value = decodeURIComponent(q.avatar)
	})

	onReady(() => {
		loadHistory()
	})

	onShow(() => {
		if (!userId.value) return
		// 进入会话即标记已读
		markRead(userId.value).then(() => {
			refreshBadges()
		}).catch(() => { /* 忽略 */ })
	})

	function onNewMessage(data) {
		const msg = data && data.message
		if (!msg) return
		if (String(msg.senderId) === String(userId.value)) {
			if (data.senderName && !otherAvatar.value && msg.senderAvatar) otherAvatar.value = msg.senderAvatar
			messages.value.push(msg)
			scrollBottom()
			markRead(userId.value).then(refreshBadges).catch(() => { /* 忽略 */ })
		}
	}
	wsOn('new-message', onNewMessage)
	onUnload(() => {
		wsOff('new-message', onNewMessage)
	})

	function send() {
		const content = input.value.trim()
		if (!content) return
		if (content.length > 500) {
			uni.showToast({ title: '消息不能超过500字', icon: 'none' })
			return
		}
		if (sending.value) return
		sending.value = true
		// ⚠️ 后端 MessageController 对 receiverId 做 (Number) 强转,必须传数字
		sendMessage({ receiverId: Number(userId.value), content }).then(() => {
			input.value = ''
			loadHistory()
		}).catch(() => { /* 错误已提示 */ }).finally(() => {
			sending.value = false
		})
	}
</script>

<style>
	.chat-page {
		height: 100vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.chat-main {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 120rpx;
		overflow: hidden;
	}

	.msg-scroll {
		height: 100%;
	}

	.msg-list {
		padding: 20rpx 24rpx 0;
	}

	.load-tip {
		text-align: center;
		font-size: 24rpx;
		color: var(--text-sub);
		padding: 30rpx 0;
	}

	.msg-time {
		text-align: center;
		font-size: 21rpx;
		color: var(--text-sub);
		padding: 16rpx 0 8rpx;
	}

	.msg-row {
		display: flex;
		align-items: flex-start;
		gap: 14rpx;
		margin-bottom: 20rpx;
	}

	.msg-row.mine {
		flex-direction: row-reverse;
	}

	.msg-avatar {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		flex-shrink: 0;
		font-size: 36rpx;
	}

	.bubble {
		max-width: 65%;
		padding: 18rpx 26rpx;
		border-radius: 22rpx;
		background: rgba(255, 255, 255, 0.95);
		color: var(--text-main);
		font-size: 28rpx;
		line-height: 1.6;
		word-break: break-all;
		box-shadow: 0 4rpx 14rpx rgba(160, 120, 220, 0.12);
	}

	.msg-row.mine .bubble {
		background: linear-gradient(135deg, #b79cff, #a78bfa);
		color: #ffffff;
		border-top-right-radius: 6rpx;
	}

	.msg-row:not(.mine) .bubble {
		border-top-left-radius: 6rpx;
	}

	.chat-bottom-pad {
		height: 30rpx;
	}

	.chat-input-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: flex-end;
		gap: 16rpx;
		padding: 16rpx 24rpx;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border-top: 1.5px solid rgba(255, 255, 255, 0.7);
		z-index: 90;
	}

	.chat-input {
		flex: 1;
		min-height: 80rpx;
		max-height: 200rpx;
		background: rgba(243, 232, 255, 0.6);
		border: 1.5px solid rgba(183, 156, 255, 0.35);
		border-radius: 20rpx;
		padding: 14rpx 24rpx;
		font-size: 28rpx;
		box-sizing: border-box;
	}

	.chat-send {
		padding: 18rpx 36rpx;
		background: var(--brand-grad);
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 27rpx;
		font-weight: bold;
		flex-shrink: 0;
		margin-bottom: 4rpx;
	}

	.chat-send.disabled {
		opacity: 0.5;
	}
</style>
