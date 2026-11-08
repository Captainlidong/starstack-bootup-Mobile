# 部署指南 · 让手机用户访问移动端

> 先说结论:**移动端不需要单独的后端**,它连接的就是 Web 端同一个 Java 后端(9090),Web 端与移动端操作同一个数据库,数据天然实时同步。你要做的只是把**前端构建产物(约 0.4MB)**放到服务器上,让手机浏览器能打开它。

## 一、构建 H5 生产包

### 方式一:双击脚本(推荐)

项目根目录提供 `build-h5.bat`(利用 HBuilderX 内置编译工具链,无需 npm/CLI 登录):

1. 用文本编辑器打开 `build-h5.bat`,确认 `HX_DIR` 指向你本机的 HBuilderX 安装目录
2. 双击运行,看到 `DONE Build complete.` 即成功
3. 产物在 `unpackage/dist/build/h5/`,并可用宝塔/任意方式上传部署

### 方式二:HBuilderX 图形界面

HBuilderX 中选中项目 → **发行 → 网站-PC Web或手机 H5** → 填写标题 → 发行,产物同样在 `unpackage/dist/build/h5/`。

## 二、部署到宝塔面板(腾讯云)

以在 **9091 端口**部署为例(与后端 9090、已有 80 站点互不冲突):

1. **添加站点**:宝塔 → 网站 → 添加站点
   - 域名:填你的服务器 IP(有备案域名后可替换)
   - 根目录:`/www/wwwroot/starstack-mobile`
   - PHP 版本:**纯静态**;数据库:不创建
2. **改端口**:站点设置 → 端口 → 改为 `9091`(若添加时没填 IP 端口,默认会是 80,与现有站点冲突,必须改)
3. **上传产物**:
   - 文件 → 进入 `/www/wwwroot/starstack-mobile`,删除默认的 404/index 文件
   - 上传本地 `unpackage/dist/build/starstack-mobile-h5.zip` → 右键 **解压**(确保解压后 `index.html` 直接位于站点根目录,而不是 `h5/index.html`)
4. **放行端口**(两处都要):
   - 宝塔 → 安全 → 添加端口规则 `9091`
   - 腾讯云控制台 → 你的服务器 → 防火墙/安全组 → 放行 `TCP 9091`
5. **验证**:手机或电脑浏览器打开 `http://你的服务器IP:9091/` 🎉

> 💡 让 Web 端用户也能找到入口:可以在 Web 端页脚加一个「移动端」链接,或用任意二维码工具把该网址生成二维码放在首页。

## 三、为什么数据是同步的?(原理)

```
手机浏览器 ──┐
             ├─ HTTP/WebSocket ──► 同一个 Java 后端(9090)──► 同一个 MySQL
Web 端页面 ──┘
```

- 移动端 `config.js` 的 `BASE_URL` 指向你的线上后端,与 Web 端生产环境同源同后端
- 后端 CORS 已全开放,9091 静态站跨域调用 9090 接口没有任何问题(WebSocket 也不受同源策略限制)
- 登录态、博客、私信、通知全部走同一套账号体系——**Web 上发的文章,手机上立刻能刷到**
- 图片/头像 URL 是后端返回的绝对地址(指向 9090 的 `/files/`),两端展示一致

## 四、安卓 App(可选,免部署)

App 端不需要"部署"到服务器:HBuilderX → 发行 → 原生 App-云打包 → 得到 APK,安装后开箱即连 9090 后端(见 [README](../README.md) 第二节)。云打包需登录 DCloud 账号,并先在 manifest.json 中获取正式 appid。

## 五、后续更新流程

前端代码有改动时:

1. 双击 `build-h5.bat` 重新构建
2. 重新打包 zip(或直接上传 `unpackage/dist/build/h5/` 内的文件覆盖)
3. 宝塔文件管理里覆盖 `/www/wwwroot/starstack-mobile/` 内容即可,**后端和数据库永远不用动**

## 六、常见问题

| 问题 | 处理 |
|---|---|
| 打不开(超时) | 检查两处端口放行:宝塔安全 + 腾讯云防火墙 |
| 页面空白 | 确认解压后 `index.html` 在站点根;必须用 hash 路由产物(本项目默认即 hash,无需 URL 重写) |
| 接口报「网络异常」 | 确认后端仍在 9090 运行:`curl http://你的服务器IP:9090/category/selectAll` |
| **发中文内容报「系统异常」**(评论/私信/提问全中招,英文正常) | **服务器数据库字符集是 latin1**。宝塔 → 数据库 → xm-blog → 导入执行表结构转换 SQL(见下文「数据库字符集修复」),无需重启后端 |
| 私信/报名等报「系统异常」且英文也失败 | 检查是否向后端 Map 型参数接口传了字符串 ID(后端对 `receiverId` 做 `(Number)` 强转),客户端务必 `Number(id)` |
| 想换部署路径/端口 | 前端是纯静态+跨域调用,改端口/目录都不需要改代码 |
| 想用域名+HTTPS | 有备案域名后:宝塔站点绑定域名申请 SSL;注意后端图片 URL 是 HTTP 绝对地址,HTTPS 页面加载 HTTP 图片会被浏览器拦截,届时需把后端也切到 HTTPS(改 application.yml 的 ip 配置并重新部署 jar) |

## 七、数据库字符集修复(生产实测踩坑,2026-11)

**症状**:Web/移动端发表中文评论、私信、提问均报「系统异常」,纯英文/数字正常;查询接口一切正常。

**根因**:服务器 MySQL 中建库时字符集为 latin1,中文写入时抛 `Incorrect string value`,被全局异常处理器包装成 500。

**修复**(宝塔 → 数据库 → xm-blog → 导入执行,无需重启后端;约 2 分钟,不动数据):

```sql
USE xm-blog;
ALTER DATABASE `xm-blog` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
-- 对以下 16 张表逐条执行(已是 utf8mb4 的表会报"无变化",忽略即可):
-- user, admin, blog, category, comment, likes, collect, follow,
-- message, notification, question, activity, activity_sign,
-- report, sensitive_word, user_behavior
ALTER TABLE `user` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE `blog` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
-- ……(其余表同格式,完整清单见上方问题表)
```

若转换后仍失败,则检查后端同目录的 `application-local.yml`(含真实数据库密码,不入库)中 JDBC URL 是否带 `?useUnicode=true&characterEncoding=utf8`,改后重启 Java 项目。

**防御建议**:新建数据库时宝塔默认即为 utf8mb4;若从旧环境迁移库,先跑一遍 `SHOW CREATE TABLE` 检查字符集再导入数据。
