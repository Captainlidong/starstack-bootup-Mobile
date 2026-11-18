// ============================================================
// 星栈奶油风 · 线性 SVG 图标库(feather 风格:1.8 描边 / 圆角端点)
// 用法:icon('home', '#2e6b4f') → data URI,直接给 <image :src>
// 同一体系供 TabBar / 首页头部按钮 / 悬浮发布按钮消费,保证线条语言一致
// ============================================================

const PATHS = {
	home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
	recommend: '<path d="M12 3l2.2 5.3L19.5 10l-5.3 1.7L12 17l-2.2-5.3L4.5 10l5.3-1.7z"/>',
	activity: '<rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M16 2v4M8 2v4M3 9.5h18"/>',
	message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
	mine: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
	edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
	bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'
}

export function icon(name, color = '#2e6b4f', strokeWidth = 1.8) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${PATHS[name] || ''}</svg>`
	return 'data:image/svg+xml,' + encodeURIComponent(svg)
}
