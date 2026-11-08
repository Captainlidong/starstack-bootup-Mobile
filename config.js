// ============================================================
// 后端服务地址配置 —— 切换环境只需改这里
// ⚠️ 公开仓库请勿提交真实服务器地址/账号密码,运行前改成你自己的
// online: 线上服务器    local: 本地调试(需自行启动 Spring Boot + MySQL)
// ============================================================
export const SERVERS = {
	online: 'http://your-server-domain-or-ip:9090',
	local: 'http://localhost:9090'
}

// 当前使用的后端地址
export const BASE_URL = SERVERS.online

// Web 端地址(分享博客时拼接用,Web 端与后端同源部署)
export const WEB_URL = BASE_URL
