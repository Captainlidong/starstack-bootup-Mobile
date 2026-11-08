import { get, put } from '../utils/request.js'

// 系统通知分页: { pageNum, pageSize }
export const selectPage = (params) => get('/notification/selectPage', params)
export const unreadCount = () => get('/notification/unreadCount')
export const readOne = (id) => put('/notification/read/' + id)
export const readAll = () => put('/notification/readAll')
