<template>
	<view class="page pf-page">
		<glass-navbar title="✏️ 编辑资料" />

		<guide-card v-if="!isLogin()" emoji="✏️" text="登录后可以修改你的个人资料~" buttonText="去登录"
			@action="goLogin" />

		<view class="pf-body" v-else>
			<!-- 头像 -->
			<view class="card pf-card avatar-card">
				<view class="pf-avatar-wrap" @click="chooseAvatar">
					<image class="pf-avatar" :src="absUrl(form.avatar)" mode="aspectFill" v-if="form.avatar" />
					<view class="pf-avatar avatar-ph" v-else><text>👤</text></view>
					<view class="pf-avatar-mask">更换</view>
				</view>
				<text class="pf-avatar-tip">点击头像更换</text>
			</view>

			<!-- 资料表单 -->
			<view class="card pf-card">
				<view class="pf-row">
					<text class="pf-label">昵称</text>
					<input class="pf-input" v-model="form.name" :maxlength="20" placeholder="你的昵称"
						placeholder-class="ph" />
				</view>
				<view class="pf-row">
					<text class="pf-label">性别</text>
					<picker mode="selector" :range="sexOptions" @change="onSexChange">
						<view class="pf-picker">{{ form.sex || '请选择' }} ▾</view>
					</picker>
				</view>
				<view class="pf-row">
					<text class="pf-label">生日</text>
					<picker mode="date" :value="form.birth" :end="today" @change="onBirthChange">
						<view class="pf-picker">{{ form.birth || '请选择' }} ▾</view>
					</picker>
				</view>
				<view class="pf-row">
					<text class="pf-label">电话</text>
					<input class="pf-input" v-model="form.phone" type="number" :maxlength="11" placeholder="手机号"
						placeholder-class="ph" />
				</view>
				<view class="pf-row">
					<text class="pf-label">邮箱</text>
					<input class="pf-input" v-model="form.email" placeholder="邮箱地址" placeholder-class="ph" />
				</view>
				<view class="pf-row col">
					<text class="pf-label">个人简介</text>
					<textarea class="pf-textarea" v-model="form.info" :maxlength="200" auto-height
						placeholder="介绍一下自己,让大家更了解你~" placeholder-class="ph" />
				</view>
			</view>

			<view class="pill-btn pf-save" :class="{ disabled: saving }" @click="save">
				{{ saving ? '保存中…' : '💾 保存修改' }}
			</view>
		</view>
	</view>
</template>

<script setup>
	import { reactive, ref } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { uploadFile } from '../../api/file.js'
	import { absUrl } from '../../utils/format.js'
	import { store, isLogin, setUser } from '../../utils/store.js'
	import { put } from '../../utils/request.js'

	const sexOptions = ['男', '女', '保密']
	const saving = ref(false)
	const today = new Date().toISOString().slice(0, 10)

	const form = reactive({
		avatar: '',
		name: '',
		sex: '',
		birth: '',
		phone: '',
		email: '',
		info: ''
	})

	function fillForm() {
		const u = store.user || {}
		form.avatar = u.avatar || ''
		form.name = u.name || ''
		form.sex = u.sex || ''
		form.birth = u.birth || ''
		form.phone = u.phone || ''
		form.email = u.email || ''
		form.info = u.info || ''
	}

	onShow(() => {
		if (isLogin()) fillForm()
	})

	function chooseAvatar() {
		uni.chooseImage({
			count: 1,
			success: (res) => {
				const path = res.tempFilePaths && res.tempFilePaths[0]
				if (!path) return
				uni.showLoading({ title: '上传中…' })
				uploadFile(path).then(url => {
					form.avatar = url
				}).finally(() => uni.hideLoading())
			}
		})
	}

	function onSexChange(e) {
		form.sex = sexOptions[Number(e.detail.value)] || ''
	}

	function onBirthChange(e) {
		form.birth = e.detail.value
	}

	function save() {
		if (saving.value) return
		if (!form.name.trim()) {
			uni.showToast({ title: '昵称不能为空', icon: 'none' })
			return
		}
		if (form.email && !/^[\w.-]+@[\w-]+(\.[\w-]+)+$/.test(form.email)) {
			uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
			return
		}
		if (form.phone && !/^1\d{10}$/.test(form.phone)) {
			uni.showToast({ title: '手机号格式不正确', icon: 'none' })
			return
		}
		saving.value = true
		const payload = Object.assign({}, store.user, {
			name: form.name.trim(),
			avatar: form.avatar,
			sex: form.sex,
			birth: form.birth,
			phone: form.phone,
			email: form.email,
			info: form.info
		})
		put('/user/update', payload).then((data) => {
			// 后端返回最新用户信息则合并,保持 token 不变
			const merged = Object.assign({}, store.user, (data && typeof data === 'object' && !Array.isArray(data)) ? data : {}, {
				name: payload.name,
				avatar: payload.avatar,
				sex: payload.sex,
				birth: payload.birth,
				phone: payload.phone,
				email: payload.email,
				info: payload.info
			})
			setUser(merged)
			uni.showToast({ title: '保存成功 ✨', icon: 'success' })
			setTimeout(() => uni.navigateBack(), 700)
		}).catch(() => { /* 错误已提示 */ }).finally(() => {
			saving.value = false
		})
	}

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}
</script>

<style>
	.pf-page {
		min-height: 100vh;
		padding-bottom: 60rpx;
	}

	.pf-body {
		padding: 20rpx 24rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.avatar-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14rpx;
		padding: 36rpx;
	}

	.pf-avatar-wrap {
		position: relative;
		width: 160rpx;
		height: 160rpx;
	}

	.pf-avatar {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		font-size: 80rpx;
		border: 4rpx solid rgba(255, 255, 255, 0.9);
		box-shadow: 0 10rpx 26rpx rgba(160, 120, 220, 0.3);
	}

	.pf-avatar-mask {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		text-align: center;
		background: rgba(107, 91, 149, 0.7);
		color: #ffffff;
		font-size: 21rpx;
		padding: 6rpx 0;
		border-radius: 0 0 160rpx 160rpx;
	}

	.pf-avatar-tip {
		font-size: 22rpx;
		color: var(--text-sub);
	}

	.pf-card {
		padding: 10rpx 28rpx;
	}

	.pf-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 26rpx 0;
		border-bottom: 1.5px dashed rgba(183, 156, 255, 0.2);
	}

	.pf-row:last-child {
		border-bottom: none;
	}

	.pf-row.col {
		flex-direction: column;
		align-items: flex-start;
		gap: 14rpx;
	}

	.pf-label {
		width: 130rpx;
		font-size: 27rpx;
		font-weight: bold;
		color: var(--title-c);
		flex-shrink: 0;
	}

	.pf-input {
		flex: 1;
		font-size: 27rpx;
		color: var(--text-main);
	}

	.pf-picker {
		font-size: 27rpx;
		color: var(--text-main);
	}

	.pf-textarea {
		width: 100%;
		min-height: 140rpx;
		font-size: 26rpx;
		line-height: 1.6;
		color: var(--text-main);
		box-sizing: border-box;
	}

	.pf-save {
		margin-top: 10rpx;
	}
</style>
