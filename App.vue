<script>
	import { initStore, store } from './utils/store.js'
	import { connectWS } from './utils/ws.js'
	import { refreshBadges } from './utils/badge.js'

	export default {
		onLaunch() {
			initStore()
			if (store.user && store.user.token) {
				connectWS()
			}
			refreshBadges()
			// 每 30s 轮询未读数,保持 TabBar 角标新鲜(WebSocket 推送实时叠加)
			setInterval(() => {
				if (store.user && store.user.token) refreshBadges()
			}, 30000)
		},
		onShow() {},
		onHide() {}
	}
</script>

<style>
	/* ==================== 星栈萌系设计体系 ==================== */
	page {
		--brand-grad: linear-gradient(135deg, #b79cff, #ff9ecf);
		--brand-1: #b79cff;
		--brand-2: #ff9ecf;
		--purple: #8b5cf6;
		--purple-light: #a78bfa;
		--pink: #e8619c;
		--title-c: #6b5b95;
		--text-main: #4a4458;
		--text-sub: #9b8bab;
		--mint-grad: linear-gradient(135deg, #6ee7b7, #34d399);
		--mint-1: #34d399;
		--card-bg: rgba(255, 255, 255, 0.82);
		--card-border: rgba(255, 255, 255, 0.55);
		--card-shadow: 0 10rpx 30rpx rgba(160, 120, 220, 0.16);
		--card-radius: 24rpx;

		min-height: 100%;
		background-color: #f3e8fb;
		background-image: linear-gradient(160deg, #c9b8f9 0%, #e3c7f7 22%, #ffd7ee 48%, #ffeaf5 66%, #c8f3e2 100%);
		background-attachment: fixed;
		color: #4a4458;
		font-size: 28rpx;
	}

	/* H5 端保证渐变铺满 */
	/* #ifdef H5 */
	html,
	body {
		height: 100%;
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
		color: #b9aecb;
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
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
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
		background: #f3e8ff;
		color: var(--purple);
		border-radius: 999rpx;
		font-size: 22rpx;
		line-height: 1.6;
	}

	.sec-title {
		font-size: 30rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	/* 主按钮:品牌渐变胶囊 */
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
		box-shadow: 0 8rpx 24rpx rgba(183, 156, 255, 0.45);
		transition: transform 0.15s, opacity 0.15s;
	}

	.pill-btn:active {
		transform: scale(0.97);
		opacity: 0.88;
	}

	.pill-btn.disabled {
		opacity: 0.55;
	}

	/* 次级按钮:白底紫字胶囊 */
	.pill-btn.plain {
		background: rgba(255, 255, 255, 0.85);
		color: var(--purple);
		border: 1.5px solid rgba(139, 92, 246, 0.35);
		box-shadow: 0 6rpx 18rpx rgba(160, 120, 220, 0.12);
	}

	/* 薄荷绿按钮(成功/报名) */
	.pill-btn.mint {
		background: var(--mint-grad);
		box-shadow: 0 8rpx 24rpx rgba(52, 211, 153, 0.4);
	}

	/* 头像占位 */
	.avatar-ph {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #e9dcff, #ffd9f0);
		color: #b08ae0;
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
