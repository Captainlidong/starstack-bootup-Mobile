import { isLogin } from './store.js'

// 需要登录的操作前置校验:未登录时提示并跳转登录页
export function requireLogin() {
	if (isLogin()) return true
	uni.showToast({ title: '请先登录', icon: 'none' })
	setTimeout(() => {
		uni.navigateTo({ url: '/pages/login/login' })
	}, 400)
	return false
}
