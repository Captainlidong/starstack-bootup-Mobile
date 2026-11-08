import { get, post, put, del } from '../utils/request.js'

// ==================== 博客 ====================
// 分页列表: { pageNum, pageSize, categoryName?, title?, sort(composite|date|reads|likes), scope? }
export const selectPage = (params) => get('/blog/selectPage', params)
export const selectById = (id) => get('/blog/selectById/' + id)
export const selectTop = () => get('/blog/selectTop')
export const selectRecommend = (blogId) => get('/blog/selectRecommend/' + blogId)
export const updateReadCount = (id) => put('/blog/updateReadCount/' + id)
export const addBlog = (data) => post('/blog/add', data)
export const updateBlog = (data) => put('/blog/update', data)
export const deleteBlog = (id) => del('/blog/delete/' + id)

// 个人维度查询: { pageNum, pageSize, status?, ... }
export const selectUserBlog = (params) => get('/blog/selectUserBlog', params)
export const selectUserLike = (params) => get('/blog/selectUserLike', params)
export const selectUserCollect = (params) => get('/blog/selectUserCollect', params)
export const selectUserComment = (params) => get('/blog/selectUserComment', params)

// ==================== 分类 ====================
export const selectAllCategories = () => get('/category/selectAll')

// ==================== 协同过滤推荐 ====================
export const recommendForUser = (userId, params) => get('/recommend/user/' + userId, params)
