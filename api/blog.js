import { get, post, put, del } from '../utils/request.js'

// ==================== 博客 ====================
// 分页列表: { pageNum, pageSize, categoryName?, title?, sort(composite|date|reads|likes), scope? }
export const selectPage = (params) => get('/blog/selectPage', params)
export const selectById = (id) => get('/blog/selectById/' + id)
export const selectTop = () => get('/blog/selectTop')

// 热榜 + 真实点赞数:后端 selectTop 的 SQL 不联查点赞计数(likesCount 为 null),
// 这里逐条用 selectById 的联查字段回填(热榜仅 3~6 条,selectById 公开且无副作用)
export async function selectTopWithLikes(limit = 6) {
	const rows = await selectTop()
	const list = (rows || []).slice(0, limit)
	await Promise.all(list.map(async (b, i) => {
		try {
			const full = await selectById(b.id)
			if (full && list[i] && list[i].id === full.id) {
				list[i].likesCount = full.likesCount
			}
		} catch (e) { /* 补数失败保持原值,不阻塞热榜展示 */ }
	}))
	return list
}
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
