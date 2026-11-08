import { get, post, put } from '../utils/request.js'

// 博主问答
// 提问 { authorId, title, content }
export const addQuestion = (data) => post('/question/add', data)
export const myAsk = () => get('/question/myAsk')
export const myReceived = () => get('/question/myReceived')
// 回答 { id, answer }
export const answerQuestion = (data) => put('/question/answer', data)
