import { get, post, put } from '../utils/request.js'

// 获取图形验证码 → { key, image(base64 dataURL) }
export const getCaptcha = () => get('/captcha')

// 登录 { username, password, role:'USER', captchaKey, captchaCode }
export const login = (data) => post('/login', data)

// 注册 { username, password, role:'USER', captchaKey, captchaCode }
export const register = (data) => post('/register', data)

// 修改密码 { username, password(旧), newPassword, role:'USER' }
export const updatePassword = (data) => put('/updatePassword', data)
