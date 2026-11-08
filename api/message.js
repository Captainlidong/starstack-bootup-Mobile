import { get, post, put } from '../utils/request.js'

// 私信会话列表 → [{ otherId, otherName, otherAvatar, lastContent, lastTime, unreadCount }]
export const getConversations = () => get('/message/conversations')
// 与某人的聊天记录(最近 50 条)
export const getHistory = (otherUserId) => get('/message/history/' + otherUserId)
// { receiverId, content }
export const sendMessage = (data) => post('/message/send', data)
// 进入会话后标记已读
export const markRead = (otherUserId) => put('/message/read/' + otherUserId)
export const unreadCount = () => get('/message/unreadCount')
