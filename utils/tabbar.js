// ============================================================
// 原生 tabBar 隐藏兜底
// pages.json tabBar.custom=true 已让 App/H5 不渲染原生栏;
// 此函数作为保险(App 老版本行为差异 / custom 失效场景),在 Tab 页 onShow 反复调用无害
// ============================================================
export function hideNativeTabBar() {
	uni.hideTabBar({ animation: false, fail: () => { /* 已隐藏/无 tabBar 时忽略 */ } })
}
