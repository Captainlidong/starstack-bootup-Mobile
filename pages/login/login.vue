<template>
	<view class="auth-page statusbar-pad">
		<view class="auth-brand">
			<image class="auth-logo" src="/static/logo.png" mode="aspectFit" />
			<text class="auth-name">星栈始动</text>
			<text class="auth-slogan">StarStack BootUp · IT 技术博客</text>
		</view>

		<view class="card auth-card">
			<view class="form-item">
				<input class="form-input" v-model="form.username" placeholder="用户名" placeholder-class="ph"
					:maxlength="16" />
			</view>
			<view class="form-item">
				<input class="form-input" v-model="form.password" password placeholder="密码" placeholder-class="ph" />
			</view>
			<view class="form-item captcha-row">
				<input class="form-input captcha-input" v-model="form.captchaCode" placeholder="验证码"
					placeholder-class="ph" :maxlength="8" />
				<image class="captcha-img" :src="captchaImg" @click="loadCaptcha" v-if="captchaImg" mode="aspectFit" />
				<view class="captcha-img captcha-ph" v-else @click="loadCaptcha"><text>点击获取</text></view>
			</view>

			<button class="pill-btn submit-btn" :class="{ disabled: loading }" @click="submit">
				{{ loading ? '登录中…' : '登 录' }}
			</button>

			<view class="auth-links">
				<text @click="goRegister">没有账号?去注册 ✨</text>
			</view>
		</view>

		<view class="auth-foot">💡 登录即代表同意友善交流公约哦~</view>
	</view>
</template>

<script setup>
	import { reactive, ref } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { getCaptcha, login } from '../../api/auth.js'
	import { setUser } from '../../utils/store.js'
	import { connectWS } from '../../utils/ws.js'
	import { refreshBadges } from '../../utils/badge.js'

	const form = reactive({
		username: '',
		password: '',
		captchaCode: '',
		captchaKey: '',
		role: 'USER' // 移动端固定普通用户登录
	})
	const captchaImg = ref('')
	const loading = ref(false)

	function loadCaptcha() {
		getCaptcha().then(d => {
			form.captchaKey = d.key
			captchaImg.value = d.image
		})
	}

	onLoad(loadCaptcha)

	function goRegister() {
		uni.redirectTo({ url: '/pages/register/register' })
	}

	function submit() {
		if (loading.value) return
		if (!form.username.trim()) return uni.showToast({ title: '请输入用户名', icon: 'none' })
		if (!form.password) return uni.showToast({ title: '请输入密码', icon: 'none' })
		if (!form.captchaCode.trim()) return uni.showToast({ title: '请输入验证码', icon: 'none' })
		loading.value = true
		login({
			username: form.username.trim(),
			password: form.password,
			role: form.role,
			captchaKey: form.captchaKey,
			captchaCode: form.captchaCode.trim()
		}).then(data => {
			setUser(data)
			connectWS()
			refreshBadges()
			uni.showToast({ title: '登录成功 🎉', icon: 'none' })
			setTimeout(() => {
				uni.switchTab({ url: '/pages/home/home' })
			}, 600)
		}).catch(() => {
			// 验证码一次性消费,失败后刷新
			form.captchaCode = ''
			loadCaptcha()
		}).finally(() => {
			loading.value = false
		})
	}
</script>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 40rpx;
	}

	.auth-brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		padding: 50rpx 0;
	}

	.auth-logo {
		width: 150rpx;
		height: 150rpx;
		border-radius: 36rpx;
		background: rgba(255, 255, 255, 0.7);
		box-shadow: 0 10rpx 30rpx rgba(160, 120, 220, 0.3);
	}

	.auth-name {
		font-size: 44rpx;
		font-weight: bold;
		color: var(--title-c);
		letter-spacing: 6rpx;
		margin-top: 10rpx;
	}

	.auth-slogan {
		font-size: 24rpx;
		color: var(--text-sub);
	}

	.auth-card {
		width: 100%;
		padding: 50rpx 40rpx;
		display: flex;
		flex-direction: column;
		gap: 28rpx;
	}

	.form-item {
		width: 100%;
	}

	.form-input {
		width: 100%;
		height: 88rpx;
		box-sizing: border-box;
		background: rgba(255, 255, 255, 0.85);
		border: 1.5px solid rgba(183, 156, 255, 0.4);
		border-radius: 999rpx;
		padding: 0 34rpx;
		font-size: 28rpx;
	}

	.captcha-row {
		display: flex;
		align-items: center;
		gap: 18rpx;
	}

	.captcha-input {
		flex: 1;
	}

	.captcha-img {
		width: 210rpx;
		height: 78rpx;
		border-radius: 16rpx;
		background: #ffffff;
		border: 1.5px solid rgba(139, 92, 246, 0.4);
		box-shadow: 0 4rpx 12rpx rgba(160, 120, 220, 0.18);
		flex-shrink: 0;
	}

	.captcha-ph {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 23rpx;
		color: var(--text-sub);
		border: 1.5px dashed rgba(183, 156, 255, 0.5);
	}

	.submit-btn {
		width: 100%;
		margin-top: 10rpx;
	}

	.auth-links {
		display: flex;
		justify-content: center;
		font-size: 25rpx;
		color: var(--purple);
	}

	.auth-foot {
		margin-top: auto;
		padding: 40rpx 0 20rpx;
		font-size: 22rpx;
		color: var(--text-sub);
	}
</style>
