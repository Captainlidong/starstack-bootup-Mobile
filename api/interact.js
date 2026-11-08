import { get, post, del } from '../utils/request.js'

// 点赞/收藏切换, body: { fid, module: '博客' | '活动' }
export const setLikes = (data) => post('/likes/set', data)
export const setCollect = (data) => post('/collect/set', data)

// 关注
export const follow = (userId) => post('/follow/' + userId)
export const unfollow = (userId) => del('/follow/' + userId)
export const isFollowed = (userId) => get('/space/isFollowed/' + userId)

// 评论(两级楼中楼), module 与点赞一致: '博客' | '活动'
export const getComments = (fid, module) => get('/comment/selectForUser', { fid, module })
export const getCommentCount = (fid, module) => get('/comment/selectCount', { fid, module })
// { content, fid, module, pid?, rootId? }
export const addComment = (data) => post('/comment/add', data)
export const deleteComment = (id) => del('/comment/delete/' + id)

// 举报 { targetType: 'BLOG'|'ACTIVITY', targetId, reason }
export const addReport = (data) => post('/report/add', data)
