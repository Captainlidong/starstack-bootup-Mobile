<template>
	<view class="page pq-page">
		<glass-navbar title="❓ 问答" />

		<guide-card v-if="!isLogin()" emoji="❓" text="登录后可以查看你的提问与收到的提问,并与博主互动~"
			buttonText="去登录" @action="goLogin" />

		<template v-else>
			<view class="pq-tabs card">
				<view class="pq-tab" :class="{ active: tab === 'ask' }" @click="switchTab('ask')">我的提问</view>
				<view class="pq-tab" :class="{ active: tab === 'received' }" @click="switchTab('received')">收到的提问</view>
			</view>

			<view class="pq-list">
				<view class="pq-item card" v-for="q in list" :key="q.id">
					<view class="pq-head">
						<view class="pq-asker">
							<image class="pq-avatar" :src="absUrl(askerAvatar(q))" mode="aspectFill"
								v-if="askerAvatar(q)" />
							<view class="pq-avatar avatar-ph" v-else><text>👤</text></view>
							<text class="pq-name">{{ askerName(q) }}</text>
						</view>
						<text class="pq-status" :class="'s-' + q.status">
							{{ q.status === 'ANSWERED' ? '已回答' : '待回答' }}
						</text>
					</view>
					<view class="pq-title">{{ q.title }}</view>
					<view class="pq-content">{{ q.content }}</view>
					<view class="pq-answer" v-if="q.answer">
						<view class="pq-answer-head">💡 {{ tab === 'ask' ? (q.authorName || '博主') + ' 的回答' : '我的回答' }} · {{ fmtTime(q.answerTime) }}</view>
						<view class="pq-answer-body">{{ q.answer }}</view>
					</view>
					<view class="pq-foot">
						<text class="pq-time">{{ fmtTime(q.time) }}</text>
						<view class="pq-btn" v-if="tab === 'received' && q.status !== 'ANSWERED'"
							@click="answer(q)">✍️ 回答</view>
					</view>
				</view>

				<empty-state v-if="!loading && !list.length"
					:emoji="tab === 'ask' ? '🚀' : '📥'"
					:text="tab === 'ask' ? '你还没有提问过,去博主主页提问吧~' : '还没有收到提问~ 多写文章提升影响力吧'" />
			</view>
		</template>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { myAsk, myReceived, answerQuestion } from '../../api/question.js'
	import { absUrl, fmtTime } from '../../utils/format.js'
	import { isLogin, store } from '../../utils/store.js'

	const tab = ref('ask')
	const list = ref([])
	const loading = ref(false)

	function askerName(q) {
		return tab.value === 'ask' ? ('向 ' + (q.authorName || '博主') + ' 提问') : (q.askerName || '路人')
	}

	function askerAvatar(q) {
		return tab.value === 'received' ? q.askerAvatar : ''
	}

	function load() {
		if (!isLogin()) return
		loading.value = true
		const req = tab.value === 'ask' ? myAsk() : myReceived()
		req.then(rows => {
			list.value = rows || []
		}).catch(() => { /* 忽略 */ }).finally(() => {
			loading.value = false
		})
	}

	function switchTab(t) {
		if (tab.value === t) return
		tab.value = t
		load()
	}

	onLoad((q) => {
		if (q.tab) tab.value = q.tab
	})

	onShow(() => {
		if (isLogin()) load()
	})

	function answer(q) {
		uni.showModal({
			title: '回答提问',
			editable: true,
			placeholderText: '输入你的回答…',
			confirmColor: '#8b5cf6',
			success: (res) => {
				if (res.confirm) {
					const ans = (res.content || '').trim()
					if (!ans) {
						uni.showToast({ title: '回答内容不能为空', icon: 'none' })
						return
					}
					answerQuestion({ id: q.id, answer: ans }).then(() => {
						uni.showToast({ title: '回答成功 🎉', icon: 'success' })
						load()
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
	.pq-page {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.pq-tabs {
		display: flex;
		margin: 20rpx 24rpx 16rpx;
		padding: 10rpx;
		gap: 10rpx;
	}

	.pq-tab {
		flex: 1;
		text-align: center;
		padding: 16rpx 0;
		border-radius: 999rpx;
		font-size: 27rpx;
		color: var(--text-sub);
		transition: all 0.2s;
	}

	.pq-tab.active {
		background: var(--brand-grad);
		color: #ffffff;
		font-weight: bold;
		box-shadow: 0 6rpx 16rpx rgba(183, 156, 255, 0.45);
	}

	.pq-list {
		padding: 10rpx 24rpx 0;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.pq-item {
		padding: 26rpx;
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.pq-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.pq-asker {
		display: flex;
		align-items: center;
		gap: 12rpx;
		min-width: 0;
	}

	.pq-avatar {
		width: 52rpx;
		height: 52rpx;
		border-radius: 50%;
		flex-shrink: 0;
		font-size: 26rpx;
	}

	.pq-name {
		font-size: 24rpx;
		color: var(--purple);
	}

	.pq-status {
		padding: 4rpx 18rpx;
		border-radius: 999rpx;
		font-size: 21rpx;
		flex-shrink: 0;
	}

	.pq-status.s-WAIT {
		background: #fef9c3;
		color: #ca8a04;
	}

	.pq-status.s-ANSWERED {
		background: #d1fae5;
		color: #059669;
	}

	.pq-title {
		font-size: 31rpx;
		font-weight: bold;
		color: var(--title-c);
		line-height: 1.4;
	}

	.pq-content {
		font-size: 26rpx;
		color: var(--text-main);
		line-height: 1.6;
		word-break: break-all;
	}

	.pq-answer {
		background: rgba(233, 250, 243, 0.7);
		border: 1.5px solid rgba(52, 211, 153, 0.3);
		border-radius: 14rpx;
		padding: 18rpx 20rpx;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.pq-answer-head {
		font-size: 22rpx;
		color: #059669;
		font-weight: bold;
	}

	.pq-answer-body {
		font-size: 26rpx;
		color: var(--text-main);
		line-height: 1.6;
		word-break: break-all;
	}

	.pq-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.pq-time {
		font-size: 21rpx;
		color: var(--text-sub);
	}

	.pq-btn {
		padding: 10rpx 30rpx;
		background: var(--brand-grad);
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 24rpx;
		font-weight: bold;
	}
</style>
