import { get } from './request.js'
import { store, isLogin } from './store.js'

// 未读数只写全局 store:角标由自绘 custom-tabbar 组件直接消费(原生 tabBar 已隐藏)
export async function refreshBadges() {
	if (!isLogin()) {
		clearBadge()
		return
	}
	try {
		const results = await Promise.all([
			get('/message/unreadCount'),
			get('/notification/unreadCount')
		])
		store.unread.message = Number(results[0]) || 0
		store.unread.notification = Number(results[1]) || 0
	} catch (e) { /* 静默失败 */ }
}

export function clearBadge() {
	store.unread.message = 0
	store.unread.notification = 0
}
