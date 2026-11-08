import { get } from '../utils/request.js'

// 个人空间(公开)
// info → { user, blogCount, fansCount, followCount, likesCount, totalReads }
export const spaceInfo = (userId) => get('/space/info/' + userId)
export const spaceBlogs = (userId, params) => get('/space/blogs/' + userId, params)
export const spaceFans = (userId, params) => get('/space/fans/' + userId, params)
export const spaceFollowing = (userId, params) => get('/space/following/' + userId, params)
