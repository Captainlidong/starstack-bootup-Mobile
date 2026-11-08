# 贡献指南 · Contributing

感谢关注「星栈始动」移动端!本文帮助你 10 分钟跑起来项目,并说明参与贡献的约定。架构原理请先阅读 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md),接口契约见 [docs/API.md](./docs/API.md)。

## 1. 环境准备

| 工具 | 要求 | 说明 |
|---|---|---|
| HBuilderX | 3.4.8+(推荐最新版) | 唯一必需的 IDE,内置 uni-app 编译器,无需 npm |
| 后端 | 原项目 Spring Boot(9090)+ MySQL(xm-blog) | 本地调试需自建;只用线上后端则不装 |
| 微信开发者工具 | 可选 | 仅调试小程序时需要(当前暂不支持小程序) |

## 2. 快速上手

```bash
git clone https://github.com/Captainlidong/starstack-bootup-Mobile.git
```

1. HBuilderX → 文件 → 导入 → 从本地目录导入 → 选择项目根目录
2. 确认 `config.js` 中 `BASE_URL` 指向可用的后端(默认线上)
3. 运行 → 运行到浏览器 → Chrome(devServer 固定端口 **5180**)
4. 手机预览:与电脑同 WiFi,访问控制台打印的 Network 地址;或运行 → 运行到手机或模拟器

## 3. 分支与提交规范

- `main` 分支保持可运行;新功能/修复请新建分支:`feat/xxx`、`fix/xxx`、`docs/xxx`
- 提交信息使用约定式前缀(中文描述即可):

```
feat: 新增博客分享海报功能
fix: 修复聊天页键盘弹起遮挡输入框
docs: 补充活动模块接口文档
style: 调整卡片圆角为 24rpx
refactor: 抽离分页加载为可复用组合式函数
```

- 一个 PR 聚焦一件事;涉及 UI 变更请附手机截图(前后对比更佳)

## 4. 代码约定(重要,PR 前自查)

| 约定 | 说明 |
|---|---|
| Vue 3 组合式 API | 页面用 `<script setup>`,生命周期从 `@dcloudio/uni-app` 导入(onLoad/onShow/onReachBottom…) |
| 单位 | 尺寸用 `rpx`(750rpx = 屏宽);导航栏/状态栏高度等与原生相关的用 `px` |
| 颜色/圆角 | 一律消费 `App.vue` 中的 CSS 变量(`var(--purple)` 等),不要硬编码色值 |
| 组件注册 | **只走 easycom**,新建组件必须放 `components/<名>/<名>.vue` 目录式结构,页面里不写 import |
| 接口调用 | 全部经由 `api/` 模块 + `utils/request.js`,页面禁止直接 `uni.request`;错误提示由网络层统一弹出,页面侧不要重复 toast |
| module 取值 | 点赞/收藏/评论的 `module` 是中文字符串 `'博客'` / `'活动'`,勿改成英文 |
| tags 字段 | 提交时 `JSON.stringify(数组)`,读取时用 `parseTags()` |
| 列表分页 | 遵循 `loadMore / resetLoad` 惯例(见架构文档 §4.7) |
| 登录门槛 | 需登录的操作入口统一先调 `requireLogin()`(`utils/auth.js`) |

## 5. 新增一个页面的流程

1. 建 `pages/<模块>/<页面>.vue`,复用 `.card` `.pill-btn` 等全局工具类与 `glass-navbar`
2. 在 `pages.json` → `pages` 数组注册(带 `navigationBarTitleText`);非 Tab 页导航栏用 `glass-navbar`(全局已是 custom 模式)
3. 数据请求写到 `api/` 对应模块,不要内联 URL
4. 需要 Tab 的话同步改 `tabBar.list`(最多 5 个)

## 6. 对接一个新后端接口的流程

1. 在 `api/<对应模块>.js` 增加一个具名函数,注释写清参数与返回
2. 页面调用并处理失败路径(`.catch(() => {})` 或局部回退,提示已由网络层完成)
3. 若接口有新的错误码/字段,同步更新 [docs/API.md](./docs/API.md)

## 7. 自测清单(提交 PR 前)

- [ ] H5 浏览器(建议 Chrome 手机模拟 390×844)功能正常
- [ ] **游客态**与**登录态**分别过一遍相关页面(游客应看到引导卡,而不是报错)
- [ ] 下拉刷新、触底加载、空数据三种列表状态都正常
- [ ] 涉及图片上传:确认走 `/files/upload` 且能正常回显
- [ ] 注意后端限流:不要写自动化脚本连点(评论 5/min、点赞 30/min 会触发 5019)
- [ ] 不要把 `config.js` 的 `BASE_URL` 改成你本地地址提交

## 8. 提交 Issue / PR

- **Issue**:说明设备/平台(H5 或 App)、复现步骤、期望与实际表现,附截图
- **PR**:关联对应 Issue,描述改动点与自测情况;维护者会在 1-2 天内 review

## 9. 行为准则

保持友善交流,尊重不同技术水平的小伙伴——这也是星栈社区的公约 🪐
