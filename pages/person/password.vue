<template>
	<view class="page pwd-page">
		<glass-navbar title="🔑 修改密码" />

		<guide-card v-if="!isLogin()" emoji="🔑" text="登录后可以修改账号密码~" buttonText="去登录" @action="goLogin" />

		<view class="pwd-body" v-else>
			<view class="card pwd-card">
				<view class="pwd-tip">💡 修改密码成功后需要重新登录</view>
				<view class="pwd-item">
					<text class="pwd-label">原密码</text>
					<input class="pwd-input" v-model="form.oldPwd" password placeholder="请输入原密码"
						placeholder-class="ph" />
				</view>
				<view class="pwd-item">
					<text class="pwd-label">新密码</text>
					<input class="pwd-input" v-model="form.newPwd" password placeholder="至少8位,含字母和数字"
						placeholder-class="ph" />
				</view>
				<view class="pwd-item">
					<text class="pwd-label">确认新密码</text>
					<input class="pwd-input" v-model="form.confirmPwd" password placeholder="再次输入新密码"
						placeholder-class="ph" />
				</view>
			</view>

			<view class="pill-btn pwd-submit" :class="{ disabled: submitting }" @click="submit">
				{{ submitting ? '提交中…' : '确认修改' }}
			</view>
		</view>
	</view>
</template>

<script setup>
	import { reactive, ref } from 'vue'
	import { updatePassword } from '../../api/auth.js'
	import { isLogin, store, logout } from '../../utils/store.js'
	import { closeWS } from '../../utils/ws.js'
	import { clearBadge } from '../../utils/badge.js'

	const form = reactive({ oldPwd: '', newPwd: '', confirmPwd: '' })
	const submitting = ref(false)

	function submit() {
		if (submitting.value) return
		if (!form.oldPwd) return uni.showToast({ title: '请输入原密码', icon: 'none' })
		if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(form.newPwd)) {
			return uni.showToast({ title: '新密码至少8位,且需包含字母和数字', icon: 'none' })
		}
		if (form.newPwd !== form.confirmPwd) {
			return uni.showToast({ title: '两次输入的新密码不一致', icon: 'none' })
		}
		submitting.value = true
		updatePassword({
			username: store.user.username,
			password: form.oldPwd,
			newPassword: form.newPwd,
			role: 'USER'
		}).then(() => {
			uni.showToast({ title: '密码修改成功,请重新登录', icon: 'none' })
			logout()
			closeWS()
			clearBadge()
			setTimeout(() => {
				uni.reLaunch({ url: '/pages/login/login' })
			}, 900)
		}).catch(() => { /* 错误已提示 */ }).finally(() => {
			submitting.value = false
		})
	}

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}
</script>

<style>
	.pwd-page {
		min-height: 100vh;
	}

	.pwd-body {
		padding: 20rpx 24rpx;
		display: flex;
		flex-direction: column;
		gap: 26rpx;
	}

	.pwd-card {
		padding: 14rpx 30rpx;
	}

	.pwd-tip {
		font-size: 23rpx;
		color: var(--purple);
		background: rgba(243, 232, 255, 0.6);
		border-radius: 12rpx;
		padding: 14rpx 20rpx;
		margin: 16rpx 0 6rpx;
	}

	.pwd-item {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 28rpx 0;
		border-bottom: 1.5px dashed rgba(183, 156, 255, 0.2);
	}

	.pwd-item:last-child {
		border-bottom: none;
	}

	.pwd-label {
		width: 170rpx;
		font-size: 27rpx;
		font-weight: bold;
		color: var(--title-c);
		flex-shrink: 0;
	}

	.pwd-input {
		flex: 1;
		font-size: 27rpx;
	}

	.pwd-submit {
		margin-top: 10rpx;
	}
</style>
