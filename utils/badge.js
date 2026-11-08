import { get } from './request.js'
import { store, isLogin } from './store.js'

// 消息 Tab 在 tabBar 中是第 4 项(index 3)
const MESSAGE_TAB_INDEX = 3

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
		applyBadge()
	} catch (e) { /* 静默失败 */ }
}

export function applyBadge() {
	// 消息 Tab 角标只反映「私信未读」:进入聊天读完即清零,符合直觉。
	// 系统通知未读在「我的」菜单文案与首页铃铛上提示,不混入此角标。
	const unread = store.unread.message
	if (unread > 0) {
		uni.setTabBarBadge({
			index: MESSAGE_TAB_INDEX,
			text: unread > 99 ? '99+' : String(unread),
			fail: () => { /* 非 tabBar 场景忽略 */ }
		})
	} else {
		uni.removeTabBarBadge({ index: MESSAGE_TAB_INDEX, fail: () => { } })
	}
}

export function clearBadge() {
	store.unread.message = 0
	store.unread.notification = 0
	uni.removeTabBarBadge({ index: MESSAGE_TAB_INDEX, fail: () => { } })
}
