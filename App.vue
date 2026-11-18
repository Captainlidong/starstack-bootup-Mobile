<script>
	import { initStore, store } from './utils/store.js'
	import { connectWS } from './utils/ws.js'
	import { refreshBadges } from './utils/badge.js'

	export default {
		onLaunch() {
			initStore()
			// 隐藏原生 tabBar,由自绘 custom-tabbar 组件接管(字号/胶囊选中态自控)
			uni.hideTabBar({ animation: false, fail: () => { /* 已隐藏或无 tabBar 场景忽略 */ } })
			if (store.user && store.user.token) {
				connectWS()
			}
			refreshBadges()
			// 每 30s 轮询未读数,保持角标新鲜(WebSocket 推送实时叠加)
			setInterval(() => {
				if (store.user && store.user.token) refreshBadges()
			}, 30000)
		},
		onShow() {},
		onHide() {}
	}
</script>

<style>
	/* ==================== 星栈奶油风设计体系 ==================== */
	/* 奶油米白底 + 白色扁平卡片 + 治愈墨绿主色 + 暖杏橙点缀 */
	page {
		--brand-grad: linear-gradient(135deg, #35785a, #2e6b4f);
		--brand-1: #2e6b4f;
		--brand-2: #3f8265;
		--primary: #2e6b4f;
		--primary-light: #3f8265;
		--primary-soft: #e7efe6;
		--accent: #e9a23b;
		--accent-grad: linear-gradient(135deg, #f2b558, #e9a23b);
		--accent-1: #e9a23b;
		--accent-soft: #fdf1dc;
		--danger: #d4574e;
		--title-c: #1f3d2e;
		--text-main: #3d4a41;
		--text-sub: #8d9c90;
		--card-bg: #ffffff;
		--card-border: #efe8da;
		--card-shadow: 0 8rpx 24rpx rgba(93, 84, 60, 0.08);
		--card-radius: 24rpx;

		min-height: 100%;
		background-color: #f7f3ea;
		background-image: linear-gradient(180deg, #f9f6ee 0%, #f3eee2 100%);
		background-attachment: fixed;
		color: #3d4a41;
		font-size: 28rpx;
	}

	/* H5 端保证渐变铺满 */
	/* #ifdef H5 */
	html,
	body {
		height: 100%;
	}

	/* 自绘 TabBar 接管:H5 兜底隐藏原生 tabBar(uni.hideTabBar 之外的保险) */
	uni-tabbar {
		display: none !important;
	}

	/* #endif */

	/* ==================== 重置 ==================== */
	button {
		padding: 0;
		margin: 0;
		background: transparent;
		border-radius: 0;
		line-height: inherit;
		font-size: inherit;
		color: inherit;
	}

	button::after {
		border: none;
	}

	view,
	text {
		box-sizing: border-box;
	}

	/* 内层原生输入元素统一边框盒模型(注意:不能对 uni-input/uni-textarea 包装元素
	   设置 border-box——框架给它们的 height:1.4em 是 content-box 语义,
	   加上 padding 后内容区会塌陷为 0,导致输入框无法聚焦) */
	input,
	textarea,
	button {
		box-sizing: border-box;
	}

	.ph {
		color: #b3bca9;
	}

	/* ==================== 通用工具类 ==================== */
	.statusbar-pad {
		padding-top: var(--status-bar-height);
	}

	.safe-bottom {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.card {
		background: var(--card-bg);
		border: 1.5px solid var(--card-border);
		border-radius: var(--card-radius);
		box-shadow: var(--card-shadow);
	}

	.line1 {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.line2 {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		word-break: break-all;
	}

	.tag {
		display: inline-block;
		padding: 4rpx 18rpx;
		background: var(--primary-soft);
		color: var(--primary);
		border-radius: 999rpx;
		font-size: 22rpx;
		line-height: 1.6;
	}

	.sec-title {
		font-size: 30rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	/* 主按钮:治愈墨绿实色胶囊 */
	.pill-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 22rpx 0;
		background: var(--brand-grad);
		color: #ffffff;
		border-radius: 999rpx;
		font-size: 30rpx;
		font-weight: bold;
		letter-spacing: 4rpx;
		line-height: 1.45;
		box-shadow: 0 8rpx 24rpx rgba(46, 107, 79, 0.28);
		transition: transform 0.15s, opacity 0.15s;
	}

	.pill-btn:active {
		transform: scale(0.97);
		opacity: 0.88;
	}

	.pill-btn.disabled {
		opacity: 0.55;
	}

	/* 次级按钮:白底绿字胶囊 */
	.pill-btn.plain {
		background: #ffffff;
		color: var(--primary);
		border: 1.5px solid rgba(46, 107, 79, 0.30);
		box-shadow: 0 6rpx 18rpx rgba(93, 84, 60, 0.08);
	}

	/* 暖杏橙按钮(强调/成功) */
	.pill-btn.mint {
		background: var(--accent-grad);
		box-shadow: 0 8rpx 24rpx rgba(233, 162, 59, 0.30);
	}

	/* 头像占位 */
	.avatar-ph {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #e7efe6, #fdf1dc);
		color: #7d9c88;
		overflow: hidden;
	}

	/* 列表底部加载提示 */
	.load-more {
		text-align: center;
		padding: 24rpx 0 40rpx;
		color: var(--text-sub);
		font-size: 24rpx;
	}
</style>
