import { get, post, put, del } from '../utils/request.js'

// ==================== 活动 ====================
export const selectPage = (params) => get('/activity/selectPage', params)
export const selectTop = () => get('/activity/selectTop')
export const selectById = (id) => get('/activity/selectById/' + id)
export const updateReadCount = (id) => put('/activity/updateReadCount/' + id)

// 个人维度
export const selectUser = (params) => get('/activity/selectUser', params)
export const selectUserLike = (params) => get('/activity/selectUserLike', params)
export const selectUserCollect = (params) => get('/activity/selectUserCollect', params)
export const selectUserComment = (params) => get('/activity/selectUserComment', params)

// ==================== 活动报名 ====================
// 报名(重复报名后端报 5006);ID 统一转数字,避免后端强转类型问题
export const sign = (activityId) => post('/activitySign/add', { activityId: Number(activityId) })
// 取消报名
export const cancelSign = (activityId, userId) => del('/activitySign/delete/user/' + activityId + '/' + userId)
