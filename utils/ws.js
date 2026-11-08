import { BASE_URL } from '../config.js'
import { store } from './store.js'

// WebSocket 实时私信通道,协议与 Web 端一致:
// ws(s)://host:9090/ws/message?token=JWT
// 心跳:客户端发 {"type":"ping"},服务端回 {"type":"pong"}
// 推送:{"type":"new-message","message":{...},"senderName":"xxx"}

let task = null
let heartbeatTimer = null
let reconnectTimer = null
let manualClosed = false

const listeners = {}

export function on(event, fn) {
	if (!listeners[event]) listeners[event] = []
	listeners[event].push(fn)
}

export function off(event, fn) {
	const arr = listeners[event]
	if (!arr) return
	const i = arr.indexOf(fn)
	if (i > -1) arr.splice(i, 1)
}

function emit(event, payload) {
	(listeners[event] || []).forEach(fn => {
		try { fn(payload) } catch (e) { /* 监听器异常不影响其它监听 */ }
	})
}

export function connectWS() {
	if (!store.user || !store.user.token) return
	manualClosed = false
	if (task) {
		try { task.close({}) } catch (e) { /* 忽略 */ }
		task = null
	}
	const url = BASE_URL.replace(/^http/, 'ws') + '/ws/message?token=' + encodeURIComponent(store.user.token)
	task = uni.connectSocket({ url, complete: () => { } })
	if (!task) return

	task.onOpen(() => {
		startHeartbeat()
		emit('open')
	})

	task.onMessage((res) => {
		let data = null
		try {
			data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
		} catch (e) { return }
		if (!data || !data.type || data.type === 'pong') return
		if (data.type === 'new-message') {
			store.unread.message += 1
			emit('new-message', data)
		}
	})

	task.onClose(() => {
		stopHeartbeat()
		scheduleReconnect()
	})

	task.onError(() => { /* onClose 会紧随触发,交给重连逻辑 */ })
}

function startHeartbeat() {
	stopHeartbeat()
	heartbeatTimer = setInterval(() => {
		try {
			if (task) task.send({ data: JSON.stringify({ type: 'ping' }), fail: () => { } })
		} catch (e) { /* 忽略 */ }
	}, 25000)
}

function stopHeartbeat() {
	if (heartbeatTimer) {
		clearInterval(heartbeatTimer)
		heartbeatTimer = null
	}
}

function scheduleReconnect() {
	if (manualClosed || reconnectTimer) return
	reconnectTimer = setTimeout(() => {
		reconnectTimer = null
		if (store.user && store.user.token && !manualClosed) connectWS()
	}, 5000)
}

export function closeWS() {
	manualClosed = true
	stopHeartbeat()
	if (reconnectTimer) {
		clearTimeout(reconnectTimer)
		reconnectTimer = null
	}
	try { if (task) task.close({ code: 1000 }) } catch (e) { /* 忽略 */ }
	task = null
}
