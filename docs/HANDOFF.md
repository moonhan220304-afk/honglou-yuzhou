# 红楼社 · 项目交接文档（HANDOFF · 面向新接任 Agent）

> **给新接任 Agent**：请先完整阅读本文档再动手改代码。本文档覆盖项目背景、当前进展、数据构成、任务细节、文件路径与已知坑。
> 最后更新：2026-08-20（当前版本 **v0.3**；人格测试改版 24 题 24 人、测试结果统计、分享长图、通知系统均已上线）

---

## 一、整体项目背景

### 1.1 项目是什么

**红楼社**——《红楼梦》数字探索社区，一个供《红楼梦》爱好者阅读、讨论、测试人格的网站。品牌名「红楼社」，logo：`public/images/logo.png`（原色）/ `logo-light.png`（程序化反白版，深色背景用）。

### 1.2 用户是谁、用户要什么

- 站长（本项目唯一真实用户）是《红楼梦》爱好者，正在做**小范围邀请制内测**，希望先服务少数同好（约 10 人以内），后续再考虑放量。
- 用户重视：**探索感、沉浸感、内容准确性（可追溯，引文必须带原著回次）、视觉高级感**。
- 用户本人不写代码，完全依赖 Agent 干活；部署、验证、改 bug 都由 Agent 完成。

### 1.3 内容形态

内容型网站：人物档案（54 人）、关系图谱（352 对关系）、问题中心（如"宝黛爱情是悲剧吗"）、诗词库、大观园地图、人格测试（24 题 24 人）、社区讨论（发帖/盖楼/评论/点赞）。

### 1.4 当前运营状态

- **阶段 0 内测中**：邀请制，预置邀请码，站长已注册为管理员。
- 已上线版本：v0.3（2026-08-19 发布，人格测试统计 + 改版）；版本号记录在 `app/about/page.tsx` 的 `APP_VERSION` 与 `RELEASES` 数组，**每次发布新版本必须同步更新**。

---

## 二、技术栈与架构

### 2.1 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端框架 | **Next.js 16.3**（App Router，**静态导出** `output: "export"`） | 全部页面构建期生成静态 HTML/JS |
| 语言 | TypeScript + React 19 | |
| 样式 | Tailwind CSS v4 | |
| 数据可视化 | ECharts 6、Three.js（@react-three/fiber，首页背景/图谱） | |
| 社区后端 | **`server/api-server.js`**：纯 Node（零 npm 依赖）+ `node:sqlite`（内置 SQLite，Node ≥22.5） | 部署在 ECS，systemd 服务名 `honglou-api`，端口 4000 |
| 前端数据层 | `lib/kb/loader.ts`：合并 mock + content JSON，构建期打进静态页 | **前端本身无数据库连接** |

### 2.2 ⚠️ Next.js 16 与常见框架差异（训练数据可能过时，改前必读）

1. `node_modules/next/dist/docs/` 里有官方文档，动 Next 相关代码前先查（AGENTS.md 有说明）。
2. `PageProps<'/route'>` 全局类型；`params` 是 **Promise，必须 await**。
3. React Compiler 启用了很严的 lint（eslint-config-next 16）：**effect 内同步 setState 会被拦截**（用 async IIFE 模式包住）；`useSearchParams` 必须包 `<Suspense>`。
4. `location.href = "/xxx"` 会触发 `react-hooks/immutability` lint 错误 → 改用 `window.location.assign()`。

### 2.3 同机多站点隔离（最重要的事！）

**同一台 ECS 上还跑着另一个项目「时几财务」**（/srv/shiji-finance，端口 3000，nginx 默认站点，占用根路径 `/`）：

- **绝对不要动时几财务的任何文件**（本地目录 `/Users/jy.moon/Documents/Default Project/shiji-finance` 也禁止打开）。
- 根路径 `/` 的裸 `/api/`、`/admin`、`/uploads/` 属于时几财务（本地建站测试时除外）。
- 红楼社所有资源/跳转必须带 basePath 前缀：桌面 `/honglou-yuzhou`、移动 `/honglou-yuzhou/m`。**前端代码一律用 `lib/api.ts` 的 `sitePath()` 包装裸路径**（内部自动加前缀），禁止硬编码裸路径跳转（曾因此 bug 注册后跳到金融站）。
- nginx 配置：红楼社规则独立在 `/etc/nginx/snippets/honglou-locations.conf` + `/etc/nginx/conf.d/honglou.conf`（shiji 配置 include 引入）；**改 nginx 前先看 `/etc/nginx` 的 git 记录**（已建 git 仓库可回滚）。

---

## 三、线上环境（生产）

| 项 | 值 |
|---|---|
| 桌面站 | http://39.106.144.168/honglou-yuzhou/ |
| 移动站 | http://39.106.144.168/honglou-yuzhou/m/ （独立构建，`NEXT_PUBLIC_MOBILE=1`） |
| 管理后台 | http://39.106.144.168/honglou-yuzhou/admin （登录制，管理员角色可见） |
| API 服务 | `http://39.106.144.168/honglou-yuzhou/api/*` → nginx 反代到 `:4000`（systemd: `honglou-api`） |
| SSH | `ssh root@39.106.144.168`，密码凭证 `/tmp/ssh-askpass.sh`（若缺失向用户要） |

**部署后的常见操作**：
- 查后端日志：`ssh root@39.106.144.168` → `journalctl -u honglou-api -n 100`；`/srv/honglou-yuzhou-api/data/health.log`
- 服务端更新：先备份 → `scp server/api-server.js root@39.106.144.168:/srv/honglou-yuzhou-api/` → `systemctl restart honglou-api`
- 前端更新：重新构建 → 部署脚本 → 提醒用户**强刷（⌘⇧R）**（静态资源缓存约 1 小时）

---

## 四、数据构成

### 4.1 生产数据库 hlm.db（SQLite，`/srv/honglou-yuzhou-api/data/hlm.db`）——10 张表

| 表 | 字段要点 | 用途 |
|---|---|---|
| `users` | username、password_hash、role(user/admin)、status(active/banned)、avatar(/uploads/ 路径)、signature(≤120字) | 用户 |
| `sessions` | 30 天 cookie 会话 | 登录态 |
| `invite_codes` | 一码一号，used_at 置位作废；格式 `HLM-900000-000001` 等 | 邀请码（**发码必须发完整串，只发尾号会"邀请码无效"**） |
| `posts` | content、images、topic、question_id(问题页关联)、status(pending/approved/rejected/removed)、quote(引用观点 JSON) | 帖子 |
| `comments` | reply_to(嵌套回复)、status、like_count | 评论 |
| `likes` | 帖子点赞 | |
| `viewpoint_likes` | 问题页观点点赞 | |
| `comment_likes` | 评论点赞 | |
| `notifications` | 通知（互动提醒） | 通知系统 |
| `test_results` | archetype_id、character_id、用户名、时间；**每人一条，重复测覆盖** | 人格测试结果 |

### 4.2 JSONL 日志（`/srv/honglou-yuzhou-api/data/`）

- `track.jsonl`（PV/IP 统计）、`feedback.jsonl`、`moderation.jsonl`（敏感词命中）、`health.log`（每小时内存/磁盘）
- **注意：目前没有操作审计日志**（audit.jsonl 尚未实现，见待办第 1 条）

### 4.3 上传文件

`/srv/honglou-yuzhou-api/uploads/`（帖子图片、用户头像，nginx `/uploads/` 别名伺服；前端上传前 canvas 压缩：长边 1600、JPEG 0.8，≤5MB）

### 4.4 知识库内容（构建期打进静态页，非数据库）

- `docs/knowledge-base/content-v2/`：characters/（54 人档案 JSON）、questions.json（问题中心）、poems.json、locations.json、relationship-merge-map.json、discussion-topics.json、character-ages.json、name-etymology.json
- `lib/kb/loader.ts` 构建期合并以上内容；人物 id 需经 `normalizeId` 归一化（如 `character_pinger` → `character_ping_er`）
- **内容可追溯原则**：人物/事件描述必须带原文依据（回次+引文），后四十回内容标注 `gaoe`

### 4.5 图片资产

- `public/images/characters/`：**54 张人物头像**，文件名=人物 id，已全部注册进 `lib/images.ts` 的 `characterImages`；新增头像=放入目录+注册映射；无图显示文字头像；`CharacterAvatar` 组件点击可放大
- 首页 hero：`public/images/codex-garden-4k.jpg`（大背景图必须 JPEG）
- 分享卡二维码：`public/images/qr.png`

---

## 五、目前进展（已完成的功能）

### 5.1 人格测试（v0.3 重头戏，2026-08-18~19）

- **24 题情境题 / 24 位人物**：`lib/test-data.ts`，`archetypes`（24 人，每人有 title/四维度/原著性格一句话/traits/原著回次） + `testQuestions`（24 题，每题 4 选项，选项带 `weights` 加权计分，如 `{ daiyu: 2, qingwen: 1 }`）
- 24 人：黛玉/宝钗/宝玉/湘云/探春/凤姐/贾母/妙玉/李纨/晴雯/袭人/香菱/紫鹃/刘姥姥/贾政/王夫人/贾雨村/薛蟠/尤三姐/柳湘莲/迎春/惜春/元春/鸳鸯
- 结果分析**不出现任何外部人格标签**（无 MBTI/大五）；用「能量倾向 / 认知方式 / 决策方式 / 生活方式」四个维度组织，内容全部来自原著
- 得分判型：`components/test-flow.tsx` 内计算（按 weights 汇总得分取最高者）
- **新增/修改人物注意**：每人 ≥4 题出场、权重总量均衡（4-12）；改完必须用 `tsx` 脚本模拟作答验证 24 人全部可测出
- 测试页文案在 `app/test/page.tsx` 写「二十四道情境题」，与实际题数同步
- 前端流程：`app/test/page.tsx`（题目页，顶部 `TestStatsBoard` 数据看板）→ `components/test-flow.tsx`（答题流程 + 结果页：四维度详情、原著性格、站内统计、分享按钮）

### 5.2 测试结果统计（v0.3，2026-08-19）

- 结果提交：`POST /api/test/result`（登录用户，重复测覆盖）
- 统计查询：`GET /api/test/stats`（公开，返回 total + byType 24 人分布）
- 前端展示：
  - 测试页顶部 `TestStatsBoard`：24 格头像分布看板
  - 结果页：「站内已有 N 位同好完成测试 · 与你有 X 人相同」（真实数据）
  - 个人中心 `/profile`：「我的测试结果」区块（再次分享/重新测试/了解人物）

### 5.3 测试结果分享长图（canvas 生成，2026-08-19~20 迭代）

- `components/test-result-share.tsx`：1080 宽、**高度动态**（`H = computeFootY() + 252 + 90`，底部留白 90px）
- 结构自上而下：站名头部 → 人物头像（圆形裁剪）→ 标题区（「你的红楼人格」小字 + 大标题「怡红公子·贾宝玉型」+「与「贾宝玉」性格相合」）→ 原著性格（一句话）→ 四维度详情 → 性格特质徽章（自适应宽度）→ 统计条（站内同好/相同人数）→ 二维码
- **2026-08-20 修复**：标题区行距不足导致大标题（48px）顶住小字（24px）——间距改为 `cy += 48`（小字后）、`cy += 60`（大标题后），布局预计算 `computeFootY` 同步；**若再改字号/行距，drawBody 与 computeFootY 必须同步修改**
- 入口：测试结果页「生成分享卡」、个人中心「再次分享」；生成后弹 modal 可保存图片（调用方在 `components/test-flow.tsx` 与 `app/profile/page.tsx`）

### 5.4 通知系统（v0.3）

- `notifications` 表；互动（点赞/评论/回复）触发通知
- 前端：`app/notifications/` 通知页（全局导航「通知」入口）

### 5.5 社区系统（v0.2，2026-08-17 前后完成）

- 注册/登录/邀请码/封禁；发帖（长文+多图上传+自建话题）；**自动审核**（未命中敏感词直接 approved，命中转 pending 人工复核，后台显示命中词）；待审核帖不可点赞/回复（前端提示+服务端 404 兜底）
- 盖楼：楼层+引用回复+树形嵌套评论（`comment-thread.tsx`）+评论点赞/分享/删除（作者/管理员）；帖子点赞/分享/删除
- **观点互动**（问题页）：红学家观点卡片点赞（viewpoint_likes）+按赞排序+「引用观点」带引用块发帖（posts.quote）+观点分享卡
- **分享卡片**：`components/community/share-card-modal.tsx` canvas 900×1200 文字卡（被引用观点+用户注解+站二维码），入口：观点卡/帖子/帖子详情/评论
- 管理后台：`/honglou-yuzhou/admin`（审核/用户封禁/邀请码/统计/健康监控）；**后台链接必须用裸 `<a href="/admin">`**（nginx 例外代理，next/link 会加 basePath 导致 404）
- 个人中心 `/profile`：头像上传/个性签名/我的帖子(可删)/账号设置

### 5.6 内容站（v0.1 完成）

- 人物档案（54 人）、关系图谱（352 对唯一关系，类型按大类聚合筛选）、问题中心（内嵌讨论区）、诗词库、大观园地图（scroll-panorama 全景）、journey（人物生平时间线）、事件（events）
- 桌面/移动双版本（`NEXT_PUBLIC_MOBILE=1` 时切换 MHome/MHeader 等；`lib/mobile-build.ts` 的 IS_MOBILE_BUILD）

---

## 六、具体任务细节（新任务常见入口）

### 6.1 通用开发流程

```
改代码 → npx eslint <file> → 构建验证 → 本地冒烟（playwright + vision）→ 部署 → 提醒用户强刷
```

### 6.2 构建（换变体必先清缓存！）

```bash
rm -rf .next && env NEXT_PUBLIC_BASE_PATH=/honglou-yuzhou npm run build   # 桌面 → out/
./scripts/deploy-ecs.sh                                                   # 桌面部署
rm -rf .next && env NEXT_PUBLIC_MOBILE=1 NEXT_PUBLIC_BASE_PATH=/honglou-yuzhou npm run build && rm -rf out-mobile && mv out out-mobile
./scripts/deploy-ecs-mobile.sh                                            # 移动部署
```

- **换构建变体前必须 `rm -rf .next`**（Turbopack 缓存会串版，曾致移动端部署了旧代码）
- 两站必须分别构建部署；部署脚本内已含 rsync 与上传逻辑

### 6.3 本地验证

- 后端：`DATA_DIR=xxx UPLOAD_DIR=xxx PORT=4114 node server/api-server.js`（生产数据不可动，测试用独立临时目录）
- 前端：静态服务器伺服 `out/`（可用 node 简易静态服务，端口自选）；浏览器自动化用 `playwright-cli`
- **看截图**：本模型不支持原生识图 → `node ~/.agents/skills/vision/vision.js "<图片路径>"`；**注意 `look.js` 可能取到旧缓存图**，直接从粘贴目录取最新：`ls -lat "/Users/jy.moon/Library/Containers/com.wiheads.paste/Data/tmp/images/"` 找最新 PNG 再传给 vision.js

### 6.4 沟通与交付规范

- 验收地址是 ECS 主站；改完必须部署 + 提醒强刷
- 生成物（截图/预览/导出）只能放 `/private/tmp/opc-*`，**禁止**留在仓库目录（如 `.playwright-cli/` 用完即删）
- 部署需用户确认（重大变更时）；两站都改时先桌面后移动

---

## 七、文件路径速查

```
/Users/jy.moon/Documents/opc-HLM/
├── app/                          # Next.js 页面
│   ├── page.tsx                  # 首页
│   ├── characters/               # 人物档案
│   ├── graph/                    # 关系图谱
│   ├── questions/[id]/           # 问题中心（QuestionBody 主体）
│   ├── test/page.tsx             # 人格测试入口页（24 题文案 + TestStatsBoard）
│   ├── profile/page.tsx          # 个人中心（我的测试结果区块）
│   ├── notifications/            # 通知页
│   ├── community/                # 社区列表/发帖/帖子详情
│   ├── about/page.tsx            # 关于（APP_VERSION="0.3" + RELEASES，发版必更新）
│   └── globals.css / layout.tsx  # 全局样式（系统字体栈）、布局
├── components/
│   ├── test-flow.tsx             # 测试答题流程 + 结果页
│   ├── test-result-share.tsx     # 测试结果分享长图（canvas，1080 宽动态高度）
│   ├── test-stats-board.tsx      # 测试页数据看板
│   ├── community/                # 社区组件（comment-thread、share-card-modal、question-discussion、question-body…）
│   ├── header.tsx / home-view.tsx / mobile/   # 桌面/移动导航（改导航 4 处同步）
│   └── character-avatar.tsx 等
├── lib/
│   ├── test-data.ts              # 24 题 24 人（改人物/题目重点文件）
│   ├── images.ts                 # 54 张人物头像注册表
│   ├── api.ts                    # api()/sitePath()/类型（所有前端请求走这里）
│   ├── kb/loader.ts              # 知识库内容合并
│   └── types.ts
├── server/api-server.js          # 社区后端（零依赖 Node + node:sqlite，10 张表，端口 4000）
├── scripts/
│   ├── deploy-ecs.sh             # 桌面构建+部署
│   ├── deploy-ecs-mobile.sh      # 移动构建+部署
│   └── seed.ts                   # 旧 drizzle 种子（已弃用，勿用）
├── docs/
│   ├── HANDOFF.md                # 本文档
│   ├── knowledge-base/content-v2/  # 内容知识库（characters/questions/poems/locations…）
│   ├── design-tokens.md          # 设计规范（配色/字体）
│   └── image-assets-request*.md  # 旧图片需求文档（历史）
├── public/images/                # 图片资产（characters/ 头像、qr.png、logo*.png、codex-garden-4k.jpg）
└── next.config.ts / package.json / AGENTS.md（本项目 Agent 规则，必读）
```

---

## 八、已修复的坑（勿重复踩）

1. **根路径跳转 = 跳到金融站**：裸路径必须 `sitePath()` 包装；`/admin` 是唯一例外（用裸 `<a>`）
2. 首页右上登录/注册按钮忘接事件（要用 Link）
3. `useSearchParams` 不包 Suspense → prerender 报错
4. effect 内同步 setState 被 React Compiler lint 拦截 → async IIFE 模式
5. 大背景图必须 JPEG（PNG 会内存爆炸）；hero 用 codex-garden-4k.jpg
6. 关系数据曾 472 条含 92 对重复 → 已合并 352 唯一；loader 有同对去重保底，勿回退
7. 类型筛选曾"点一个标签只有一条线"（187 种）→ 改按大类聚合（REL_CATEGORIES）
8. 王夫人页空白 = button 嵌套 button；拼音乱码 = id 未归一化（ID_NORMALIZE）
9. 后台 UV 曾显示 undefined → `byDay[d].ips.size`
10. **logo-light.png 曾与 logo.png 完全相同** → 已程序化反白重建（红梅→粉白渐变、透明底），两者现在不同，勿再覆盖
11. **邀请码发"001/002/003"无效**：必须完整串 `HLM-900000-000001`；勿创建纯数字短码（可被猜测）
12. 浏览器「不安全」标志：HTTP+IP 直连所致，非代码问题；需域名+SSL 才能解决（用户未决策）
13. **主题/换肤系统已整体移除**（用户 2026-08-16 明确要求），不要再加换肤代码、不要引入实景背景图
14. **next/font/google 不可用**（构建环境网络被软路由 fake-ip 劫持 198.18.0.1）→ 字体已改系统字体栈（globals.css @theme），勿加回网络字体
15. 分享长图标题重叠：drawBody 与 computeFootY 的间距必须一致（详见 5.3）

---

## 九、待办 / 已知问题（按优先级）

1. **【优先】后台操作轨迹监控系统**：用户反映"自己参与讨论的内容平白无故消失了"，后台看不到操作轨迹。需 `audit.jsonl` 操作日志（注册/登录/发帖/评论/点赞/删帖/审核/上传埋点）+ 后台 `?view=audit` 展示，让站长能回答"某用户某时刻发帖是否成功、内容为何不可见（被删/被驳回/命中敏感词）"
2. 内测进行中：邀请码已用约 5/7，站长账号「有事找站长」（admin）；自动审核，站长几乎无需盯后台；**用户报错由当前接任 Agent 专责处理**（报错流程见 6.1/6.3 + 三章日志排查）
3. HTTPS/域名：用户未决策（域名+阿里云免费证书 / 保持 IP+HTTP / 自签）
4. 阶段 4：语音发布（未做）+ 存储迁阿里云 OSS（当前服务器磁盘 33G）
5. 阶段 5 剩余：数据备份（DB+uploads 定时 rsync 到本地）、监控告警（目前仅每小时 health.log）
6. 敏感词表可扩充（server/api-server.js 的 SENSITIVE_WORDS）
7. 知识库内容可继续扩充（docs/knowledge-base/content-v2/）
8. 26 位人物仍无头像图；图谱 NODE_POS 53 颗星（新人物未画）——**当前 24 人测试人物都有头像**（lib/images.ts 注册）

---

## 十、保护清单（绝对不要动）

- **生产数据**：/srv/honglou-yuzhou-api/data/hlm.db、uploads/、*.jsonl（含用户密码哈希、帖子、邀请码）——操作前先备份
- **时几财务**：/srv/shiji-finance（端口 3000）、nginx 默认站点配置、本地 `/Users/jy.moon/Documents/Default Project/shiji-finance`
- **系统凭证**：/tmp/ssh-askpass.sh（两个项目共用，勿删）
- 本地仓库边界：只允许操作 `/Users/jy.moon/Documents/opc-HLM`；临时文件一律 `/private/tmp/opc-*`
- 仓库是 git 仓库（仅 1 个 initial commit），**未提交的文件不要随意 git add/commit**；生成物（.next/out/out-mobile/.playwright-cli/截图）严禁进入 git
