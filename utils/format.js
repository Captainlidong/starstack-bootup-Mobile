import { BASE_URL } from '../config.js'

// 相对路径 → 绝对地址(后端返回的文件地址一般已是绝对地址,此处兜底)
export function absUrl(url) {
	if (!url) return ''
	if (/^https?:\/\//i.test(url)) return url
	if (url.indexOf('/') === 0) return BASE_URL + url
	return url
}

// 列表小图 → 后端 WebP 缩略图接口(懒生成,与 Web 端 $thumb() 行为一致)
export function thumbUrl(url) {
	if (!url) return ''
	if (url.indexOf('/files/thumb/') > -1) return absUrl(url)
	if (url.indexOf('/files/') > -1) return absUrl(url.replace('/files/', '/files/thumb/'))
	return absUrl(url)
}

// tags 存储为 JSON 字符串:'["后端","程序员"]'
export function parseTags(tags) {
	if (!tags) return []
	if (Array.isArray(tags)) return tags
	try {
		const arr = JSON.parse(tags)
		return Array.isArray(arr) ? arr.filter(Boolean) : []
	} catch (e) {
		return String(tags).split(/[,，、\s]+/).filter(Boolean)
	}
}

// 后端时间为 "2026-11-01 22:09:13" 字符串,展示时去掉秒
export function fmtTime(t) {
	if (!t) return ''
	return String(t).slice(0, 16)
}

// 富文本处理:图片自适应、表格/代码块基础样式(高亮色由页面 hljs 样式渲染)
export function formatRichText(html) {
	if (!html) return ''
	let s = html
	// 图片:去掉旧 style,注入自适应样式
	s = s.replace(/<img([^>]*)>/gi, (m, attrs) => {
		const clean = attrs.replace(/\sstyle="[^"]*"/gi, '')
			.replace(/\sloading="[^"]*"/gi, '')
		return '<img' + clean + ' style="max-width:100%;height:auto;display:block;margin:12rpx auto;border-radius:10rpx;">'
	})
	// 表格
	s = s.replace(/<table([^>]*)>/gi, '<table$1 style="border-collapse:collapse;width:100%;margin:12rpx 0;">')
	s = s.replace(/<(td|th)([^>]*)>/gi, '<$1$2 style="border:1px solid #e5dcf5;padding:8rpx 12rpx;font-size:26rpx;">')
	// 代码块底色(hljs 主题类由页面样式接管颜色)
	s = s.replace(/<pre([^>]*)>/gi, (m, attrs) => {
		if (attrs.indexOf('style=') > -1) return m
		return '<pre' + attrs + ' style="background:#2b2a3d;color:#f8f8f2;border-radius:14rpx;padding:20rpx;overflow-x:auto;font-size:24rpx;line-height:1.6;">'
	})
	s = s.replace(/<code([^>]*)>/gi, (m, attrs) => {
		if (attrs.indexOf('style=') > -1) return m
		return '<code' + attrs + ' style="font-family:Menlo,Consolas,monospace;">'
	})
	// 引用块
	s = s.replace(/<blockquote([^>]*)>/gi, (m, attrs) => {
		if (attrs.indexOf('style=') > -1) return m
		return '<blockquote' + attrs + ' style="margin:12rpx 0;padding:12rpx 20rpx;border-left:6rpx solid #c9b8f9;background:rgba(243,232,255,.6);border-radius:8rpx;color:#7a6f96;">'
	})
	return s
}
