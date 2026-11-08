# 星栈始动 StarStack BootUp · 移动端(uni-app)

基于 **uni-app (Vue 3)** 的「星栈始动 IT 技术博客」移动端应用,复用原项目 Java 后端(Spring Boot, 9090 端口),**不对原项目做任何改动**。

- 后端原项目:[Captainlidong/starstack](https://github.com/Captainlidong/starstack)
- 后端 API:以原项目 `docs/API.md` 为准(113 个接口),后端地址在 **`config.js`** 一处配置(仓库内为占位符,运行前请改成你自己的后端地址)
- 支持平台:**H5** + **安卓 App**(微信小程序因后端为 HTTP+IP 无法通过域名校验,暂不支持)

## 📚 项目文档

| 文档 | 内容 |
|---|---|
| [快速运行与打包(本文件)](#一快速运行hbuilderx) | HBuilderX 运行、真机预览、云打包 APK、后端地址切换 |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | **部署指南**:构建 H5 生产包(build-h5.bat)、宝塔部署步骤、数据同步原理、更新流程 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | **架构设计**:分层结构、网络层/认证/WebSocket/状态管理等核心机制、设计体系、平台差异 |
| [docs/API.md](./docs/API.md) | **API 接口文档**:移动端使用的全部后端接口、错误码、限流、WS 协议、请求封装速记 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | **贡献指南**:环境准备、提交规范、代码约定、新页面/新接口开发流程、自测清单 |

欢迎 Issue 与 PR,一起把星栈移动端做得更好 🪐

---

## 一、快速运行(HBuilderX)

1. 打开 HBuilderX → 文件 → 导入 → 从本地目录导入 → 选择 `D:\CS\blogUniappMobile`
2. 运行到浏览器:工具栏 **运行 → 运行到浏览器 → Chrome**(开发端口为 `5180`,见 `manifest.json` → h5 → devServer)
3. 手机真机预览(H5):
   - 电脑与手机连同一 WiFi,运行后用手机浏览器访问控制台打印的 **Network 地址**(如 `http://192.168.x.x:5180`)
4. 运行到安卓手机(App):
   - 手机开启 USB 调试并连接电脑
   - **运行 → 运行到手机或模拟器 → 选择你的设备**(首次需安装对应调试基座,按提示操作即可)

## 二、打包安卓 APK

1. HBuilderX 中选中项目 → **发行 → 原生 App-云打包**
2. Android 包名填一个自己的,如 `com.starstack.blog`(不要与示例 app 冲突)
3. 证书选择:**使用公共测试证书**(快速验证)或自有证书
4. 勾选「打正式包」前记得把 `manifest.json` 里的名称/图标/启动图配置好
5. 打包完成后控制台会给出 APK 下载链接,传到手机安装即可

> 首次使用云打包需要登录 DCloud 账号(HBuilderX 会提示注册/登录)。

## 三、后端地址切换

只需修改项目根目录 **`config.js`**:

```js
export const SERVERS = {
    online: 'http://your-server:9090',      // 你的线上后端地址
    local: 'http://localhost:9090'          // 本地后端
}
export const BASE_URL = SERVERS.online       // 改成 local 即切本地
```

- 本地调试需自行启动原项目 Spring Boot(9090)+ MySQL(xm-blog 库)
- 后端 CORS 已全开放,H5 跨域直连没有问题
- App 端为原生网络请求,无跨域概念

## 四、功能清单(对齐 Web 端用户侧)

| 模块 | 功能 |
|---|---|
| 认证 | 图形验证码登录 / 注册(密码强度条)/ 修改密码(改密后强制重登) |
| 首页 | 分类横滑筛选、综合/最新/最热/点赞排序、IT 热榜 Top3、下拉刷新、触底分页、搜索入口 |
| 博客 | 详情(富文本 rich-text 渲染 + 代码高亮)、点赞/收藏/分享(复制链接)/举报、相关推荐、两级楼中楼评论 |
| 发布 | uni-app editor 富文本编辑器(B/I/U/H2/H3/列表/引用/代码块/分割线/插图/撤销)、封面上传、分类单选、标签多选+自定义、公开/私人、**提交审核 / 存草稿**、驳回原因展示 |
| 推荐 | User-CF 协同过滤个性化推荐(登录后可用) |
| 活动 | 活动列表/详情、报名/取消报名(结束态判断)、点赞/收藏/评论/举报 |
| 私信 | 会话列表(未读角标)、聊天页(气泡/时间分隔)、**WebSocket 实时推送**(与 Web 端同一套 `ws/message?token=` 协议,心跳 + 断线 5s 重连) |
| 通知 | 系统通知列表、单条/全部已读、按类型跳转(LIKE/COLLECT/COMMENT/FOLLOW/AUDIT/REPORT/SYSTEM/ASK/ANSWER) |
| 互动 | 关注/取关、个人空间(文章/粉丝/关注 Tab + 统计)、向博主提问/回答提问 |
| 我的 | 统计卡(博客/粉丝/关注/获赞)、我的博客(状态标签:草稿/待审核/已驳回+原因)、草稿箱、点赞/收藏/评论(博客+活动双维度)、报名活动、问答、资料编辑(头像上传)、TabBar 消息角标(30s 轮询 + WS 实时) |

## 五、目录结构

```
blogUniappMobile/
├── config.js                 # 后端地址(线上/本地切换)
├── pages.json                # 路由 + TabBar + easycom
├── manifest.json             # 应用配置(H5 端口 5180 / App 打包配置)
├── App.vue                   # 全局样式(星栈设计令牌)+ 启动逻辑(登录态/WS/角标轮询)
├── static/logo.png
├── utils/
│   ├── request.js            # uni.request 封装(token 头/401 跳登录/统一错误提示)
│   ├── ws.js                 # WebSocket 封装(心跳/重连/事件分发)
│   ├── store.js              # 全局响应式状态(用户/分类/未读数)
│   ├── badge.js              # TabBar 消息角标
│   ├── auth.js               # requireLogin 登录守卫
│   └── format.js             # 富文本处理/缩略图 URL/tags 解析/时间格式化
├── api/                      # 按后端 Controller 划分的接口模块(9 个文件)
├── components/               # easycom 组件(blog-card/comment-section/glass-navbar 等 8 个)
└── pages/                    # 21 个页面(5 个 Tab + 16 个业务页)
```

## 六、注意事项

1. **验证码**:后端验证码一次性消费,失败后本项目会自动刷新;不要暴力重试,连续 5 次密码错误会触发账号锁定约 5 分钟(后端策略,code 5008)
2. **限流**:后端按「接口+IP」限流(点赞 30/min、评论 5/min、关注 20/min、提问 3/min),自动化压测会触发 5019
3. **发布审核**:发布提交后为 `PENDING`,需管理员在 Web 端后台审核通过才公开展示;草稿保存在「我的-草稿箱」
4. **富文本兼容**:正文为 Web 端 wangEditor 生成的 HTML,移动端用 `rich-text` 渲染并在 `utils/format.js` 中做了图片自适应/表格/代码块/引用块的内联样式处理;hljs 高亮配色在 `pages/blog/detail.vue` 样式内
5. **登录态**:与 Web 端相同的存储结构 `xm-user`(含 token),JWT 有效期 2 小时,过期自动跳登录页
6. ⚠️ 安全提醒:公开仓库请勿提交真实服务器地址、账号密码等敏感信息;开发联调期间注册的测试账号,请自行在 Web 端后台删除
