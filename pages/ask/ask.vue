<template>
	<view class="page ask-page">
		<glass-navbar :title="'向 ' + (authorName || 'TA') + ' 提问'" />

		<guide-card v-if="!isLogin()" emoji="❓" text="登录后可以向博主提问,博主会在个人中心收到你的问题~"
			buttonText="去登录" @action="goLogin" />

		<view class="ask-body" v-else>
			<view class="card ask-card">
				<view class="ask-tip">✨ 提问会推送给博主,博主将在「收到的提问」中回答你</view>
				<input class="ask-title" v-model="title" :maxlength="50" placeholder="问题标题(必填)"
					placeholder-class="ph" />
				<textarea class="ask-content" v-model="content" :maxlength="500" auto-height
					placeholder="详细描述你的问题(必填)…" placeholder-class="ph" />
				<view class="ask-count">{{ content.length }}/500</view>
			</view>
			<view class="pill-btn ask-submit" :class="{ disabled: submitting }" @click="submit">
				{{ submitting ? '提交中…' : '🚀 提交问题' }}
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { addQuestion } from '../../api/question.js'
	import { isLogin } from '../../utils/store.js'

	const authorId = ref('')
	const authorName = ref('')
	const title = ref('')
	const content = ref('')
	const submitting = ref(false)

	onLoad((q) => {
		authorId.value = q.authorId
		if (q.name) authorName.value = decodeURIComponent(q.name)
	})

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}

	function submit() {
		if (submitting.value) return
		if (!title.value.trim()) {
			uni.showToast({ title: '请输入问题标题', icon: 'none' })
			return
		}
		if (!content.value.trim()) {
			uni.showToast({ title: '请描述你的问题', icon: 'none' })
			return
		}
		submitting.value = true
		addQuestion({
			authorId: Number(authorId.value),
			title: title.value.trim(),
			content: content.value.trim()
		}).then(() => {
			uni.showToast({ title: '提问成功,等待博主回答~', icon: 'none' })
			setTimeout(() => uni.navigateBack(), 900)
		}).catch(() => { /* 错误已提示 */ }).finally(() => {
			submitting.value = false
		})
	}
</script>

<style>
	.ask-page {
		min-height: 100vh;
	}

	.ask-body {
		padding: 20rpx 24rpx;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.ask-card {
		padding: 28rpx;
		display: flex;
		flex-direction: column;
		gap: 22rpx;
	}

	.ask-tip {
		font-size: 23rpx;
		color: var(--purple);
		background: rgba(243, 232, 255, 0.6);
		border-radius: 12rpx;
		padding: 14rpx 20rpx;
	}

	.ask-title {
		width: 100%;
		height: 88rpx;
		box-sizing: border-box;
		font-size: 32rpx;
		font-weight: bold;
		color: var(--title-c);
		padding: 0;
		border-bottom: 1.5px dashed rgba(183, 156, 255, 0.4);
	}

	.ask-content {
		width: 100%;
		min-height: 260rpx;
		font-size: 28rpx;
		line-height: 1.7;
		color: var(--text-main);
		box-sizing: border-box;
	}

	.ask-count {
		text-align: right;
		font-size: 22rpx;
		color: var(--text-sub);
	}

	.ask-submit {
		margin-top: 6rpx;
	}
</style>
