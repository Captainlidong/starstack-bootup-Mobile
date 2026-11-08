import { BASE_URL } from '../config.js'
import { store, logout, isLogin } from './store.js'

let redirecting = false

function handle401() {
	logout()
	if (!redirecting) {
		redirecting = true
		setTimeout(() => { redirecting = false }, 1500)
		uni.reLaunch({ url: '/pages/login/login' })
	}
}

/**
 * 统一请求封装
 * 后端返回格式 { code: "200", msg, data },code 为字符串
 * 需登录接口自动携带请求头 token
 */
export function request(options) {
	return new Promise((resolve, reject) => {
		const header = Object.assign({ 'Content-Type': 'application/json' }, options.header || {})
		if (store.user && store.user.token) header.token = store.user.token
		uni.request({
			url: BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header,
			timeout: 30000,
			success: (res) => {
				let body = res.data
				if (typeof body === 'string') {
					try { body = JSON.parse(body) } catch (e) { /* 非 JSON 响应 */ }
				}
				if (!body || typeof body !== 'object') {
					reject({ code: '500', msg: '响应异常' })
					return
				}
				if (body.code === '200' || body.code === 200) {
					resolve(body.data)
					return
				}
				if (String(body.code) === '401') {
					if (isLogin()) {
						uni.showToast({ title: '登录已过期,请重新登录', icon: 'none' })
						handle401()
					}
					reject(body)
					return
				}
				uni.showToast({ title: body.msg || '操作失败', icon: 'none' })
				reject(body)
			},
			fail: () => {
				uni.showToast({ title: '网络异常,请稍后再试', icon: 'none' })
				reject({ code: '-1', msg: '网络异常' })
			}
		})
	})
}

export const get = (url, data) => request({ url, data, method: 'GET' })
export const post = (url, data) => request({ url, data, method: 'POST' })
export const put = (url, data) => request({ url, data, method: 'PUT' })
export const del = (url, data) => request({ url, data, method: 'DELETE' })
