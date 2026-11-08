import { reactive } from 'vue'

// 全局响应式状态
export const store = reactive({
	user: null, // 登录用户对象(含 token),与 Web 端 localStorage 'xm-user' 结构一致
	categories: [], // 博客分类缓存
	unread: {
		message: 0, // 私信未读
		notification: 0 // 系统通知未读
	}
})

const STORAGE_KEY = 'xm-user'

export function initStore() {
	try {
		const u = uni.getStorageSync(STORAGE_KEY)
		if (u && u.token) store.user = u
	} catch (e) { /* 忽略本地存储异常 */ }
}

export function setUser(u) {
	store.user = u
	try {
		if (u) uni.setStorageSync(STORAGE_KEY, u)
		else uni.removeStorageSync(STORAGE_KEY)
	} catch (e) { /* 忽略 */ }
}

export function isLogin() {
	return !!(store.user && store.user.token)
}

export function isSelf(id) {
	return isLogin() && String(store.user.id) === String(id)
}

export function logout() {
	setUser(null)
	store.unread.message = 0
	store.unread.notification = 0
}
