# 星栈移动端 · API 接口文档

> 本文档整理自后端项目 `myITChatblog/docs/API.md`(113 个端点全集)中**移动端实际使用**的接口,并结合真机联调做了核对。后端 Java 源码见原项目仓库 [starstack](https://github.com/Captainlidong/starstack)。
>
> 移动端所有接口调用集中在 `api/` 目录,按后端 Controller 一一对应;本文按业务模块重组,方便查阅。

## 1. 基础约定

### 1.1 Base URL

```
http://<你的后端地址>:9090        # 在项目根 config.js 中配置
http://localhost:9090             # 本地调试
```

- 无 context-path,根路径即服务
- 后端 CORS 全开放(`*`),H5 跨域直连无碍;App 原生请求无跨域概念

### 1.2 统一响应格式

```json
{ "code": "200", "msg": "成功", "data": ... }
```

⚠️ `code` 是**字符串**。移动端网络层(`utils/request.js`)约定:`200` → resolve(data);`401` → 清登录态跳登录页;其它 → toast(msg) 后 reject。

### 1.3 认证方式

- 登录后所有需登录接口携带请求头 **`token: <JWT>`**(注意:不是 Authorization/Bearer)
- JWT 有效期 **2 小时**,过期返回 `401`
- WebSocket 握手无法带自定义头,token 走 URL 参数(见 §11)

### 1.4 分页约定

分页接口一律 `?pageNum=1&pageSize=10`,返回 Spring PageInfo 结构:

```json
{ "total": 3, "list": [ ... ], "pageNum": 1, "pageSize": 10, ... }
```

移动端只消费 `list` 与 `total`(实际上以 `list.length < pageSize` 判断末页)。

### 1.5 主要错误码

| code | 含义 | 移动端处理 |
|---|---|---|
| 200 | 成功 | - |
| 400 | 参数错误 | toast msg |
| 401 | 未登录 / token 失效 | 清登录态 → 登录页 |
| 403 | 角色不足 | toast msg |
| 5001 | 用户名已存在 | toast msg |
| 5002 | 账号或密码错误 | toast msg(注意连续 5 次锁定的 5008) |
| 5003 | 验证码错误 | 自动刷新验证码 |
| 5006 | 重复报名活动 | toast msg |
| 5008 | 密码连续错误锁定(约 5 分钟) | toast msg,**切勿重试** |
| 5013 | 含敏感词 | toast msg |
| 5014 | 重复举报 | toast msg |
| 5015 | 内容不可见(私人/未过审) | toast msg |
| 5016 | 不能关注自己 | toast msg |
| 5018 | 文件类型不允许 | toast msg |
| 5019 | 触发限流 | toast msg |

### 1.6 限流(按「接口+IP」固定窗口)

点赞 30/min · 评论 5/min · 关注 20/min · 提问 3/min · 其余见后端文档。触发返回 5019。

## 2. 认证与账号

| 方法 | 路径 | 参数(body) | 说明 |
|---|---|---|---|
| GET | `/captcha` | - | 图形验证码 → `data: { key, image(base64 dataURL) }`,**一次性消费**,2 分钟过期 |
| POST | `/login` | `username, password, role("USER"), captchaKey, captchaCode` | → `data: 用户对象(含 token)`,移动端整体存入 `xm-user` |
| POST | `/register` | 同上(role 固定 USER) | 用户名 4-16 位字母数字下划线;密码 ≥8 位且含字母+数字 |
| PUT | `/updatePassword` | `username, password(旧), newPassword, role("USER")` | 成功后强制重新登录 |
| PUT | `/user/update` | 用户对象(完整字段) | 本人或 ADMIN 可用,移动端保存资料用 |

> 登录/注册失败后验证码即失效,移动端会自动刷新验证码并清空输入。

## 3. 博客与分类

### 3.1 博客

| 方法 | 路径 | 参数 | 说明 |
|---|---|---|---|
| GET | `/blog/selectPage` | `pageNum, pageSize, categoryName?, title?, sort?, scope?` | **公开**。`sort`: `composite`(综合)/`date`(最新)/`reads`(最热)/`likes`(点赞最多);首页列表不传 scope |
| GET | `/blog/selectById/{id}` | - | **公开**,返回含 `userLike/userCollect/likesCount/collectCount` 等冗余状态 |
| GET | `/blog/selectTop` | - | **公开**,热榜(综合分+时间衰减),移动端取前 3/6 条 |
| GET | `/blog/selectRecommend/{blogId}` | - | **公开**,相关博客推荐 |
| PUT | `/blog/updateReadCount/{id}` | - | **公开**,进入详情调用,阅读量 +1 并记录协同过滤行为 |
| POST | `/blog/add` | Blog 对象 | 发布。`status`: `PENDING`(提交审核)/`DRAFT`(草稿);`tags` 为 **JSON 字符串** `'["后端","小白"]'` |
| PUT | `/blog/update` | Blog 对象(含 id) | 编辑后重新提审 |
| DELETE | `/blog/delete/{id}` | - | 作者本人或 ADMIN |
| GET | `/blog/selectUserBlog` | `pageNum, pageSize, status?` | 我的博客(`PUBLISHED`)/草稿箱(`DRAFT`),含状态标签字段 |
| GET | `/blog/selectUserLike` | `pageNum, pageSize` | 我点赞的博客 |
| GET | `/blog/selectUserCollect` | `pageNum, pageSize` | 我收藏的博客 |
| GET | `/blog/selectUserComment` | `pageNum, pageSize` | 我评论过的博客(行内含 `fid` 可跳详情) |

Blog 对象核心字段:`id, title, descr, content(HTML), cover, tags(JSON字符串), categoryId, userId, date, readCount, visibility(PUBLIC/PRIVATE), status(DRAFT/PENDING/PUBLISHED/REJECTED), rejectReason, top(0/1)` + 联查字段 `categoryName, userName, userAvatar, likesCount, userLike, userCollect, collectCount`。

### 3.2 分类

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/category/selectAll` | **公开**,→ `[{id, name}]`,移动端缓存于 `store.categories` |

### 3.3 协同过滤推荐

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/recommend/user/{userId}?pageNum=&pageSize=` | 基于浏览/点赞/收藏行为的 User-CF 推荐,返回 PageInfo\<Blog\>。行为数据由后端在浏览(权重1)/点赞(2)/收藏(3)时自动记录 |

## 4. 互动(点赞/收藏/关注/评论/举报)

点赞、收藏、评论共用 **`fid + module`** 模型。⚠️ `module` 取值是**中文字符串**:`"博客"` / `"活动"`(以 Web 端实际传参为准,已联调核实)。

| 方法 | 路径 | 参数(body) | 说明 |
|---|---|---|---|
| POST | `/likes/set` | `{ fid, module: "博客"\|"活动" }` | **切换**语义:已赞则取消 |
| POST | `/collect/set` | 同上 | 切换收藏 |
| POST | `/follow/{userId}` | - | 关注(5016=不能关注自己) |
| DELETE | `/follow/{userId}` | - | 取消关注 |
| GET | `/space/isFollowed/{userId}` | - | 当前用户是否已关注(游客返回 false) |
| GET | `/comment/selectForUser?fid=&module=` | - | **公开**,两级评论树:`[{..., userName, userAvatar, children:[...], replyUser}]` |
| GET | `/comment/selectCount?fid=&module=` | - | **公开**,评论总数(Integer) |
| POST | `/comment/add` | `{ content, fid, module, pid?, rootId? }` | 楼中楼:回复根评论 `pid=rootId=根id`;回复楼中楼 `pid=该条id, rootId=根id`。限流 5/min,敏感词 5013 |
| DELETE | `/comment/delete/{id}` | - | 删除本人评论 |
| POST | `/report/add` | `{ targetType: "BLOG"\|"ACTIVITY", targetId, reason }` | 举报,重复举报 5014 |

## 5. 私信

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/message/conversations` | 会话列表 → `[{ otherId, otherName, otherAvatar, lastContent, lastTime, unreadCount }]` |
| GET | `/message/history/{otherUserId}` | 与某人的消息(最近 50 条)→ `[{ senderId, receiverId, content, time }]` |
| POST | `/message/send` | body `{ receiverId, content(≤500) }`,**消息正文始终走 HTTP 落库** |
| PUT | `/message/read/{otherUserId}` | 进入会话后标记已读 |
| GET | `/message/unreadCount` | 私信未读总数(Integer) |

## 6. 系统通知

type 枚举:`LIKE / COLLECT / COMMENT / FOLLOW / AUDIT / REPORT / SYSTEM / ASK / ANSWER`。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/notification/selectPage?pageNum=&pageSize=` | 我的通知 → `[{ id, type, title, content, targetId, isRead, time }]` |
| GET | `/notification/unreadCount` | 未读总数 |
| PUT | `/notification/read/{id}` | 单条已读 |
| PUT | `/notification/readAll` | 全部已读 |

移动端点击跳转映射(与 Web 端 NotificationBell 一致):

| type | 跳转 |
|---|---|
| LIKE / COLLECT / COMMENT | 博客详情 `?blogId=targetId` |
| FOLLOW | 对方空间 `?userId=targetId` |
| AUDIT / REPORT | 我的博客 |
| ASK | 收到的提问 |
| ANSWER | 我的提问 |
| SYSTEM | `targetId ? 活动详情 : 活动 Tab` |

## 7. 活动与报名

Activity 对象核心字段:`id, name, descr, content(HTML), cover, start, end, form, address, host, readCount` + 状态冗余 `isLike, isCollect, isSign, isEnd, likesCount, collectCount`。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/activity/selectPage?pageNum=&pageSize=` | **公开**,活动分页 |
| GET | `/activity/selectById/{id}` | **公开**,活动详情(含 isSign/isEnd 等状态) |
| PUT | `/activity/updateReadCount/{id}` | **公开**,阅读量 |
| POST | `/activitySign/add` | body `{ activityId }`,重复报名 5006 |
| DELETE | `/activitySign/delete/user/{activityId}/{userId}` | 取消报名(登录即可) |
| GET | `/activity/selectUser` | 我报名的活动(分页) |
| GET | `/activity/selectUserLike` / `selectUserCollect` / `selectUserComment` | 个人维度(我的互动页用) |

## 8. 个人空间(公开)

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/space/info/{userId}` | → `{ user, blogCount, fansCount, followCount, likesCount, totalReads }` |
| GET | `/space/blogs/{userId}?pageNum=&pageSize=` | TA 的公开文章 |
| GET | `/space/fans/{userId}?pageNum=&pageSize=` | 粉丝列表 → 用户对象数组(PageInfo) |
| GET | `/space/following/{userId}?pageNum=&pageSize=` | 关注列表 |
| GET | `/space/isFollowed/{userId}` | 见 §4 |

## 9. 博主问答

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/question/add` | body `{ authorId, title, content }`,限流 3/min |
| GET | `/question/myAsk` | 我发出的提问 → `[{ id, title, content, answer, answerTime, authorName, status(WAIT/ANSWERED), time }]` |
| GET | `/question/myReceived` | 我收到的提问 → `[{ ..., askerName, askerAvatar, status }]` |
| PUT | `/question/answer` | body `{ id, answer }`,仅被提问的作者本人 |

## 10. 文件上传

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/files/upload` | `multipart/form-data`,字段名 `file`,header 带 token → `data: 文件URL`。白名单:jpg/jpeg/png/gif/webp/bmp/pdf,上限 100MB |
| POST | `/files/editor/upload` | 编辑器插图专用,返回 wangEditor 格式 `{ errno: 0, data: [{ url }] }` |
| GET | `/files/{flag}` | 原图访问(**公开**) |
| GET | `/files/thumb/{flag}` | WebP 缩略图(懒生成),列表封面用它省流量 |

> 图片 URL 为绝对地址(含 host),客户端 `<image>` 直接可用;`utils/format.js → thumbUrl()` 负责把 `/files/` 换成 `/files/thumb/`。

## 11. WebSocket 实时通道(私信推送)

```
连接   ws(s)://host:9090/ws/message?token=<JWT>     # token 走 URL 参数,握手时做 JWT 校验
心跳   客户端每 25s 发  {"type":"ping"}  → 服务端回 {"type":"pong"}
推送   {"type":"new-message","message":{"id","senderId","receiverId","content","time"},"senderName":"..."}
```

- 支持同一账号多端在线(都会收到推送)
- 推送失败不影响消息落库(HTTP 发送是唯一事实来源)
- 客户端实现见 `utils/ws.js`:25s 心跳、断线 5s 重连、极简事件总线分发 `new-message`

---

## 附:移动端请求封装速记

```js
import { get, post, put, del } from '@/utils/request.js'   // 自动带 token/统一错误提示
// GET 参数放第二个对象参数,自动拼 query;POST/PUT/DELETE 自动 JSON body
const page = await get('/blog/selectPage', { pageNum: 1, pageSize: 10, sort: 'composite' })
await post('/likes/set', { fid: 28, module: '博客' })
```
