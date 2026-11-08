import { BASE_URL } from '../config.js'
import { store } from '../utils/store.js'

function tokenHeader() {
	return store.user && store.user.token ? { token: store.user.token } : {}
}

// 通用文件上传(表单字段 file)→ 返回文件 URL
export function uploadFile(filePath) {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: BASE_URL + '/files/upload',
			filePath,
			name: 'file',
			header: tokenHeader(),
			success: (res) => {
				let body = res.data
				try { body = typeof body === 'string' ? JSON.parse(body) : body } catch (e) { /* 忽略 */ }
				if (body && (body.code === '200' || body.code === 200)) {
					resolve(body.data)
				} else {
					uni.showToast({ title: (body && body.msg) || '上传失败', icon: 'none' })
					reject(body)
				}
			},
			fail: () => {
				uni.showToast({ title: '上传失败,请检查网络', icon: 'none' })
				reject()
			}
		})
	})
}

// 富文本编辑器图片上传(与 Web 端 wangEditor 同一接口)→ 返回图片 URL
export function uploadEditorImage(filePath) {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: BASE_URL + '/files/editor/upload',
			filePath,
			name: 'file',
			header: tokenHeader(),
			formData: { type: 'img' },
			success: (res) => {
				try {
					const body = JSON.parse(res.data)
					if (body.errno === 0 && body.data && body.data[0] && body.data[0].url) {
						resolve(body.data[0].url)
					} else {
						uni.showToast({ title: '图片上传失败', icon: 'none' })
						reject(body)
					}
				} catch (e) {
					uni.showToast({ title: '图片上传失败', icon: 'none' })
					reject(e)
				}
			},
			fail: () => {
				uni.showToast({ title: '图片上传失败', icon: 'none' })
				reject()
			}
		})
	})
}
