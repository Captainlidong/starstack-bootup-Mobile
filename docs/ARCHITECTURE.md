# 星栈移动端 · 架构设计文档

> 本文面向希望理解项目内部结构、参与后续开发的开发者。接口契约见 [API.md](./API.md),上手指南见 [CONTRIBUTING.md](../CONTRIBUTING.md)。

## 1. 项目定位与技术选型

「星栈始动 StarStack BootUp」是 IT 技术博客「星栈」的**移动端客户端**,与 Web 端(Vue2 + Element UI)共用同一套 Java 后端(Spring Boot, 9090 端口),本项目**不包含后端代码**。

| 项 | 选型 | 说明 |
|---|---|---|
| 框架 | uni-app (Vue 3 组合式 API) | 一套代码同时产出 H5 与安卓 App |
| 工程形态 | HBuilderX 标准工程 | 依赖 HBuilderX 内置编译器,**无 npm/package.json**,打开即用 |
| 状态管理 | Vue `reactive` 轻量 store | 应用状态简单(用户/分类/未读数),不引入 Pinia 以保持零依赖 |
| 网络层 | `uni.request` 二次封装 | 统一 token 注入、401 处理、错误提示 |
| 富文本渲染 | 内置 `rich-text` 组件 | 后端存的是 Web 端 wangEditor 生成的 HTML,配合 `utils/format.js` 做样式后处理 |
| 富文本编辑 | 内置 `editor` 组件 | H5/App 均支持,输出标准 HTML,与 wangEditor 内容兼容 |
| 实时通信 | `uni.connectSocket` | 复用 Web 端 WebSocket 私信协议 |

**为什么不用 UI 库(uview/uni-ui)?** 项目视觉是定制的「星栈萌系」设计体系(渐变/毛玻璃/胶囊),UI 库反而要大量覆写样式;核心交互组件(卡片/评论/导航栏)自研成本更低、可控性更强。

## 2. 整体分层架构

```
┌─────────────────────────────────────────────────┐
│                  pages/ (21 个页面)               │
│   5 个 Tab 页 + 16 个业务页(博客/空间/聊天/个人中心) │
├─────────────────────────────────────────────────┤
│             components/ (8 个 easycom 组件)       │
│  glass-navbar · blog-card · comment-section · …  │
├─────────────────────────────────────────────────┤
│                    api/ (9 个接口模块)             │
│   auth · blog · interact · message · activity …  │
│        按「后端 Controller」一对一划分              │
├─────────────────────────────────────────────────┤
│                  utils/ (基础设施层)               │
│  request(网络) ws(长连接) store(状态)            │
│  badge(角标) auth(守卫) format(格式化)            │
├─────────────────────────────────────────────────┤
│         config.js(后端地址) · pages.json(路由)    │
└────────────────────┬────────────────────────────┘
                     │ HTTP / WebSocket
          ┌──────────▼──────────┐
          │  Java 后端 (9090)    │
          │  原项目,本项目不修改  │
          └─────────────────────┘
```

**依赖方向**:`pages → components → api → utils → config`,严格单向,无循环引用(`utils/store.js` 是唯一的共享底层,其余 utils 之间允许单向引用)。

## 3. 目录结构导览

```
blogUniappMobile/
├── config.js               # ⭐ 后端地址开关(线上/本地),全项目唯一需要改环境的地方
├── pages.json              # 路由注册 + TabBar + easycom 开关
├── manifest.json           # 应用配置:H5 devServer 端口 5180、App 打包配置
├── App.vue                 # 全局样式(设计令牌)+ onLaunch 启动编排
├── static/logo.png
├── docs/                   # 本文档、API 文档
├── utils/
│   ├── request.js          # request/get/post/put/del,见 §4.1
│   ├── ws.js               # WebSocket 生命周期与事件分发,见 §4.3
│   ├── store.js            # reactive 全局状态 + 登录态读写,见 §4.2
│   ├── badge.js            # TabBar 消息角标(轮询 + 实时)
│   ├── auth.js             # requireLogin() 登录守卫
│   └── format.js           # 富文本后处理 / 缩略图 URL / tags 解析 / 时间格式化
├── api/
│   ├── auth.js             # /captcha /login /register /updatePassword
│   ├── blog.js             # 博客 CRUD + 个人维度查询 + 分类 + 推荐
│   ├── interact.js         # 点赞/收藏/关注/评论/举报(共用 fid+module 模型)
│   ├── message.js          # 私信
│   ├── notification.js     # 系统通知
│   ├── activity.js         # 活动 + 报名
│   ├── space.js            # 个人空间
│   ├── question.js         # 博主问答
│   └── file.js             # uni.uploadFile 封装(封面上传/编辑器插图)
├── components/             # ⚠️ 必须保持 <名>/<名>.vue 目录结构(easycom 约定)
│   ├── glass-navbar/       # 自定义毛玻璃导航栏(自定义导航栏模式,含状态栏适配)
│   ├── blog-card/          # 博客卡片(马卡龙三色交替/状态标签/置顶标)
│   ├── category-bar/       # 分类横滑条(数据缓存于 store)
│   ├── sort-bar/           # 排序胶囊条(综合/最新/最热/点赞)
│   ├── comment-section/    # 两级楼中楼评论区(自包含:加载/回复/删除)
│   ├── user-row/           # 用户行(粉丝/关注列表)
│   ├── empty-state/        # 空状态(emoji + 文案)
│   └── guide-card/         # 游客引导卡(登录引导)
└── pages/
    ├── home|recommend|activity|message|mine/   # 5 个 Tab
    ├── login|register/                          # 认证
    ├── blog/detail|edit|search/                 # 博客
    ├── activity/detail/                         # 活动详情
    ├── space/ chat/ notification/ ask/          # 空间/聊天/通知/提问
    └── person/blogs|interacts|questions|activities|profile|password/  # 个人中心
```

## 4. 核心机制设计

### 4.1 网络层(`utils/request.js`)

后端统一返回 `{ code: "200", msg, data }`,**code 是字符串**。网络层职责:

```
request(options)
  ├─ 注入请求头 token(取自 store.user.token)
  ├─ code === '200'  → resolve(data)          # 调用方只拿到业务数据
  ├─ code === '401'  → 清除登录态 + reLaunch 登录页(1.5s 防抖,避免多请求并发跳转)
  └─ 其它 code       → uni.showToast(msg) 后 reject(body)  # 调用方无需重复弹错
```

设计约定:**错误提示只在网络层弹一次**,api 层与页面层不再 toast;页面只关心成功路径,失败路径用 `.catch(() => {})` 静默或做局部回退。

### 4.2 登录态(`utils/store.js`)

- 存储 key 为 `xm-user`,与 Web 端 localStorage 结构完全一致(整个用户对象含 token),两端行为可对照
- `store.user` 是 `reactive` 对象,任何页面读取都是响应式的
- JWT 有效期 2 小时;过期由 4.1 的 401 分支统一处理
- `requireLogin()`(`utils/auth.js`)是所有「需登录操作」(点赞/评论/发布/私信…)的前置守卫:未登录时 toast + 跳登录页

### 4.3 WebSocket 实时通道(`utils/ws.js`)

与 Web 端同一套协议,后端零改动:

```
连接   ws(s)://host:9090/ws/message?token=<JWT>      # token 走 URL 参数
心跳   客户端每 25s 发 {"type":"ping"},服务端回 pong
推送   {"type":"new-message","message":{...},"senderName":"..."}
重连   断线后 5s 自动重连(手动 close 不触发)
事件   ws.on('new-message', fn) / ws.off(...)        # 极简事件总线,页面级监听
```

**消息正文不走 WS**——发送始终走 HTTP `POST /message/send` 落库,WS 只承载「有新消息」的轻量信号,失败不影响数据一致性(与 Web 端策略一致)。

未读角标 = **30s HTTP 轮询兜底**(`App.vue` onLaunch 启动)+ **WS 推送即时 +1**,双通道保证角标新鲜度。

### 4.4 状态管理(`utils/store.js`)

```js
store = reactive({
  user: null,          // 登录用户(含 token)
  categories: [],      // 分类缓存,多个页面共享一次请求
  unread: { message: 0, notification: 0 }
})
```

刻意保持极简:跨页面通信优先用「页面 onShow 重拉」(如从编辑页返回草稿箱自动刷新),而非复杂的事件系统。

### 4.5 easycom 组件体系

`pages.json` 开启 `easycom.autoscan`,组件**必须**放在 `components/<组件名>/<组件名>.vue`(uni-app 默认约定),页面模板里直接写 `<blog-card>` 无需 import。

> 踩坑记录:扁平结构 `components/blog-card.vue` 不会被默认 easycom 扫描;自定义正则规则在部分 HBuilderX 版本不可靠。因此统一使用目录式结构。

### 4.6 富文本渲染与编辑

**渲染**(博客/活动详情):后端内容是 Web 端 wangEditor 产出的 HTML。`utils/format.js → formatRichText()` 做字符串级后处理:

- `<img>` 注入 `max-width:100%` 自适应
- `<table>/<pre>/<code>/<blockquote>` 注入移动端友好的内联样式
- 代码高亮色(内容已带 `hljs-*` 类)由 `pages/blog/detail.vue` 页面样式提供(monokai-sublime 配色子集)

**编辑**(`pages/blog/edit.vue`):uni-app 内置 `editor` 组件(Quill 内核),工具栏提供 B/I/U/H2/H3/列表/引用/代码块/分割线/插图/撤销。插图走 `POST /files/editor/upload`(与 Web 端 wangEditor 同接口);`getContents()` 取 HTML 直接提交,与后端 `content` 字段(longtext HTML)天然兼容。

### 4.7 列表分页惯例

所有列表页遵循同一模式,新增列表页请保持一致:

```js
const list = ref([]), pageNum = ref(0), finished = ref(false), loading = ref(false)

async function loadMore() {          // 触底:pageNum+1 追加
  if (loading.value || finished.value) return
  const page = await api({ pageNum: pageNum.value + 1, pageSize: 10 })
  list.value = list.value.concat(page.list)
  pageNum.value += 1
  if (page.list.length < 10) finished.value = true
}
async function resetLoad() {         // 筛选变化/下拉刷新:清空重来
  pageNum.value = 0; list.value = []; finished.value = false
  await loadMore()
}
```

### 4.8 导航栏方案

`pages.json globalStyle.navigationStyle: "custom"` 全局自定义导航,由 `glass-navbar` 组件负责:渐变毛玻璃底、返回键(`getCurrentPages().length > 1 ? navigateBack : switchTab 首页`)、状态栏高度适配(`var(--status-bar-height)`,H5 为 0,App 为真实高度)。Tab 页头部则各自实现,统一加 `statusbar-pad` 类。

## 5. 视觉设计体系

设计令牌以 CSS 变量定义在 `App.vue` 的 `page{}` 选择器上,全项目通过 `var(--xxx)` 消费:

| 令牌 | 值 | 用途 |
|---|---|---|
| `--brand-grad` | `linear-gradient(135deg,#b79cff,#ff9ecf)` | 品牌渐变:激活态/主按钮/气泡 |
| `--purple` / `--pink` | `#8b5cf6` / `#e8619c` | 主文字强调/点赞高亮 |
| `--title-c` | `#6b5b95` | 标题色 |
| `--mint-grad` | `#6ee7b7→#34d399` | 成功/报名按钮 |
| `--card-*` | 白 82% + blur + 24rpx 圆角 + 紫柔影 | 毛玻璃卡片 |
| 页面背景 | `160deg 五色渐变`(紫→粉→薄荷) | 全局 page 背景 |

通用工具类:`.card` `.pill-btn`(含 `.plain` `.mint` 变体)`.tag` `.line1` `.line2` `.statusbar-pad` `.safe-bottom` `.avatar-ph`。

移动端布局原则:**单列卡片流 + 底部 TabBar + 触底加载**,不做 Web 布局的压缩移植。

## 6. 平台差异与兼容性

| 关注点 | H5 | 安卓 App |
|---|---|---|
| 状态栏高度 | 0(浏览器自带) | `var(--status-bar-height)` 真实值 |
| 跨域 | 后端 CORS 全开放,直连无碍 | 原生请求,无跨域概念 |
| 富文本 | rich-text 完整支持 | App vue 页面同为 webview 渲染,表现一致 |
| editor 组件 | HBuilderX 3.4.8+ 支持 | 同左 |
| 剪贴板分享 | `uni.setClipboardData` | 同左 |
| 路由 | hash 模式(免服务器配置) | 原生页面栈 |

微信小程序暂不支持:后端为 HTTP+IP,无法通过小程序域名校验,接入前需先完成后端 HTTPS 化。

## 7. 构建与发布

- **开发**:HBuilderX 运行到浏览器(devServer 端口 5180,见 `manifest.json` → h5 → devServer;避开 5173 防止与常见默认端口冲突)
- **H5 发行**:`发行 → 网站-H5 手机版`,产物在 `unpackage/dist/build/h5`(hash 路由,任意静态服务器可部署)
- **App 发行**:`发行 → 原生 App-云打包`,Android 包名建议 `com.starstack.blog`,证书可用公共测试证书
- 步骤截图级说明见 [README](../README.md)

## 8. 已知限制与后续规划

- [ ] 验证码依赖后端图形接口,自动化测试需人工读图(见 CONTRIBUTING 测试清单)
- [ ] 后端按接口+IP 限流(评论 5/min、点赞 30/min),客户端暂无节流 UI,后续可加按钮防抖/loading 锁
- [ ] 未读消息依赖轮询+WS,App 退后台后无推送通知,接入厂商推送需 App 端离线推送方案
- [ ] 富文本中的视频标签未做特殊处理(后端 wangEditor 默认无视频)
- [ ] iOS 打包未验证(流程与 Android 相同,需苹果开发者账号)
