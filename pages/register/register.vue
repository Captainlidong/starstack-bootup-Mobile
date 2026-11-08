<template>
	<view class="auth-page statusbar-pad">
		<view class="auth-brand">
			<image class="auth-logo" src="/static/logo.png" mode="aspectFit" />
			<text class="auth-name">加入星栈</text>
			<text class="auth-slogan">和 IT 同伴们一起星际航行 🚀</text>
		</view>

		<view class="card auth-card">
			<view class="form-item">
				<input class="form-input" v-model="form.username" placeholder="用户名(4-16位字母/数字/下划线)"
					placeholder-class="ph" :maxlength="16" />
			</view>
			<view class="form-item">
				<input class="form-input" v-model="form.password" password placeholder="密码(至少8位,含字母和数字)"
					placeholder-class="ph" />
			</view>
			<view class="pwd-strength" v-if="form.password">
				<view class="strength-bar">
					<view class="strength-cell" :class="{ on: strength >= 1, lv1: strength >= 1 }"></view>
					<view class="strength-cell" :class="{ on: strength >= 2, lv2: strength >= 2 }"></view>
					<view class="strength-cell" :class="{ on: strength >= 3, lv3: strength >= 3 }"></view>
				</view>
				<text class="strength-text">{{ strengthLabel }}</text>
			</view>
			<view class="form-item">
				<input class="form-input" v-model="form.confirmPass" password placeholder="确认密码" placeholder-class="ph" />
			</view>
			<view class="form-item captcha-row">
				<input class="form-input captcha-input" v-model="form.captchaCode" placeholder="验证码"
					placeholder-class="ph" :maxlength="8" />
				<image class="captcha-img" :src="captchaImg" @click="loadCaptcha" v-if="captchaImg" mode="aspectFit" />
				<view class="captcha-img captcha-ph" v-else @click="loadCaptcha"><text>点击获取</text></view>
			</view>

			<button class="pill-btn submit-btn" :class="{ disabled: loading }" @click="submit">
				{{ loading ? '注册中…' : '注 册' }}
			</button>

			<view class="auth-links">
				<text @click="goLogin">已有账号?去登录 ☁️</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { reactive, ref, computed } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { getCaptcha, register } from '../../api/auth.js'

	const form = reactive({
		username: '',
		password: '',
		confirmPass: '',
		captchaCode: '',
		captchaKey: '',
		role: 'USER'
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

	const strength = computed(() => {
		const p = form.password
		let s = 0
		if (p.length >= 8) s++
		if (/[a-zA-Z]/.test(p) && /\d/.test(p)) s++
		if (p.length >= 12 || /[^a-zA-Z0-9]/.test(p)) s++
		return s
	})

	const strengthLabel = computed(() => ({ 0: '太弱了', 1: '弱', 2: '中', 3: '强' })[strength.value])

	function goLogin() {
		uni.redirectTo({ url: '/pages/login/login' })
	}

	function submit() {
		if (loading.value) return
		const username = form.username.trim()
		if (!/^\w{4,16}$/.test(username)) {
			return uni.showToast({ title: '用户名需4-16位字母/数字/下划线', icon: 'none' })
		}
		if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(form.password)) {
			return uni.showToast({ title: '密码至少8位,且需包含字母和数字', icon: 'none' })
		}
		if (form.password !== form.confirmPass) {
			return uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
		}
		if (!form.captchaCode.trim()) {
			return uni.showToast({ title: '请输入验证码', icon: 'none' })
		}
		loading.value = true
		register({
			username,
			password: form.password,
			role: form.role,
			captchaKey: form.captchaKey,
			captchaCode: form.captchaCode.trim()
		}).then(() => {
			uni.showToast({ title: '注册成功,请登录 🎉', icon: 'none' })
			setTimeout(() => {
				uni.redirectTo({ url: '/pages/login/login' })
			}, 800)
		}).catch(() => {
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
		padding: 40rpx 0;
	}

	.auth-logo {
		width: 130rpx;
		height: 130rpx;
		border-radius: 32rpx;
		background: rgba(255, 255, 255, 0.7);
		box-shadow: 0 10rpx 30rpx rgba(160, 120, 220, 0.3);
	}

	.auth-name {
		font-size: 40rpx;
		font-weight: bold;
		color: var(--title-c);
		letter-spacing: 6rpx;
		margin-top: 8rpx;
	}

	.auth-slogan {
		font-size: 24rpx;
		color: var(--text-sub);
	}

	.auth-card {
		width: 100%;
		padding: 44rpx 40rpx;
		display: flex;
		flex-direction: column;
		gap: 26rpx;
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

	.pwd-strength {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-top: -12rpx;
		padding: 0 10rpx;
	}

	.strength-bar {
		display: flex;
		gap: 8rpx;
		flex: 1;
	}

	.strength-cell {
		flex: 1;
		height: 10rpx;
		border-radius: 8rpx;
		background: rgba(185, 174, 203, 0.35);
	}

	.strength-cell.on.lv1 {
		background: #f87171;
	}

	.strength-cell.on.lv2 {
		background: #fbbf24;
	}

	.strength-cell.on.lv3 {
		background: #34d399;
	}

	.strength-text {
		font-size: 22rpx;
		color: var(--text-sub);
		width: 90rpx;
		text-align: right;
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
</style>
