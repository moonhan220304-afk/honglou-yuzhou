# 红楼社 · 一梦红楼 —— 视觉升级方案 V2（可直接指导前端实现）

> 目标：解决「整体太平、太素、各板块特色不鲜明」。保留雅致新中式红线（宣纸米白 / 朱砂红 / 古铜金 / 宋体标题 / 线性 SVG / 禁用 emoji），在此之上引入**板块副色系统**与**板块专属装饰语言**，让 6 大板块一眼可辨、不再雷同。
>
> 本文档为设计规格（Design Spec），颜色值、间距、字号、组件结构均已落到具体数值，可直接映射到 `app/globals.css` 的 `@theme` 与各组件 className。

---

## 0. 现状诊断（为什么「太平太素」）

对照现有代码，问题根源有四：

1. **全站只有一个强调色**：`globals.css` 仅定义 `--color-primary`（朱砂）与 `--color-gold`。所有板块的标题竖条、标签、按钮、图标高亮共用同一朱砂红，板块之间没有任何色相差异。
2. **板块页头同质化**：`聊一聊`（community-feed.tsx）、`个人中心`（profile/page.tsx）等页头都是同一公式 —— 英文小字 `tracking-[0.3em] text-gold` + `font-serif text-3xl` 标题 + `text-body` 简介 + `h-4 w-1 bg-primary` 竖条。六个板块用同一模板 = 视觉上「都长一个样」。
3. **卡片只有一套「白板」**：`card-print` 线稿水印是**全站共享**的同一幅园林线稿，`rounded-3xl bg-surface shadow-card` 到处复用，卡片之间靠内容区分而非靠视觉区分。
4. **板块无专属图标**：侧边栏 6 个板块复用通用 `IconBook/IconChat/IconQuestion/IconQuill/IconUser`，且选中态统一 `bg-primary text-white`，没有板块色。

**升级思路（一句话）**：朱砂红继续做「品牌锚点」（Logo、登录/注册、关注、全局动作），新增 6 个低饱和「板块副色」+ 每板块一套「专属图标 / 装饰元素 / 排版手法」，让每块区域自带身份，同时整体仍统一在宣纸底 + 宋体 + 线性图标的新中式语言里。

---

## 1. 设计令牌升级（先做，是一切的地基）

### 1.1 板块副色系统（新增，核心改动）

在 `app/globals.css` 的 `@theme` 中追加 6 组「板块三阶色」——`主色`（装饰/描边/大号文字）、`深阶`（正文小字/选中态/主 CTA）、`浅底`（标签底/卡片 tint/进度条底）。全部为低饱和传统矿物/植物色，在宣纸米白 `#F9F5F0` 上足够雅致，且彼此色相错开。

| 板块 | Token 前缀 | 主色 | 深阶 | 浅底 | 意象 |
|---|---|---|---|---|---|
| 人物志 | `characters` | `#4E7A7C` 黛青 | `#3A5F61` | `#EAF1F0` | 群芳谱 · 眉黛 |
| 大观园 | `garden` | `#5D8A62` 松绿 | `#47714C` | `#EBF2EC` | 园林草木 |
| 聊一聊 | `chat` | `#B66A4C` 绛赭 | `#93533A` | `#F6ECE6` | 炉火 · 烟火气 |
| 问一问 | `ask` | `#405D8A` 靛蓝 | `#324A6E` | `#EBEFF5` | 考据 · 求索 |
| 海棠诗社 | `poem` | `#BE6E86` 海棠绯 | `#9E5470` | `#F6EAEE` | 海棠花 · 诗笺 |
| 个人空间 | `me` | `#6A5B92` 绀紫 | `#54476F` | `#EFEDF5` | 私印 · 书斋 |

`@theme` 追加写法（Tailwind v4，类名自动生成 `text-characters` / `bg-garden-soft` / `border-poem` 等）：

```css
@theme {
  /* —— 板块副色（V2 新增）—— */
  --color-characters: #4E7A7C;  --color-characters-deep: #3A5F61;  --color-characters-soft: #EAF1F0;
  --color-garden:     #5D8A62;  --color-garden-deep:     #47714C;  --color-garden-soft:     #EBF2EC;
  --color-chat:       #B66A4C;  --color-chat-deep:       #93533A;  --color-chat-soft:       #F6ECE6;
  --color-ask:        #405D8A;  --color-ask-deep:        #324A6E;  --color-ask-soft:        #EBEFF5;
  --color-poem:       #BE6E86;  --color-poem-deep:       #9E5470;  --color-poem-soft:       #F6EAEE;
  --color-me:         #6A5B92;  --color-me-deep:         #54476F;  --color-me-soft:         #EFEDF5;
}
```

### 1.2 颜色使用规则（避免再次「乱/雷同」）

- **朱砂红 `--color-primary` `#A63834`**：仅用于**品牌与「人」的动作** —— Logo、登录/注册、关注/取关、全局搜索高亮、点赞激活态、错误提示。正文与卡片装饰不再滥用朱砂。
- **古铜金 `--color-gold` `#C49A6C`**：仅用于**等级/成就/分隔线/描边/印章框**，不参与板块配色。
- **板块副色**：只在该板块内部出现（页头竖条、英文小字、主 CTA、标签、图标选中态、卡片角饰、hover 阴影）。
- **对比度**：副色「深阶」用于 ≤14px 正文/图标（对白底 ≥4.5:1）；「主色」用于 ≥16px 文字、描边、色块底（白字需用深阶作底）。副色「浅底」只作背景 tint，不承载文字信息。

### 1.3 统一字阶（对齐现状，补全语义）

现状正文基准 16px。板块页头与卡片统一如下（Tailwind 类）：

| 用途 | 类 | 说明 |
|---|---|---|
| 页头英文小字 | `text-[11px] tracking-[0.32em]` | 板块英文名，用**板块深阶色** |
| 页头标题 | `font-serif text-3xl md:text-4xl font-semibold tracking-wide text-ink` | 宋体 |
| 页头简介 | `text-sm leading-relaxed text-body` | 最大宽 `max-w-2xl` |
| 卡片标题 | `font-serif text-[15px] font-semibold text-ink` | 沿用 |
| 正文 | `text-sm leading-relaxed text-body` | 沿用 |
| 数据数字 | `font-mono` | 关注/粉丝/积分数字 |

### 1.4 圆角 / 阴影 / 间距（沿用 + 定点）

- 卡片：**主卡 `rounded-3xl`（24px）**、**次级卡 `rounded-2xl`（16px）**、标签 `rounded-full`、印章 `rounded-[4px]`。
- 阴影：沿用 `--shadow-card` / `--shadow-hover`，另加一块「板块色阴影」用于卡片 hover：`0 6px 20px rgba(60,45,30,0.10)`，叠加 `ring-1 ring-<板块色>/20`。
- 间距：页头下 `mt-8`、卡片间距 `space-y-4/space-y-5`、板块分区 `space-y-6`、页面上下留白 `py-10 ~ py-14`（沿用）。

---

## 2. 新 Logo 方案（交付 1）

现状：`components/logo-mark.tsx` 为「朱红印章底 + 攒尖亭 + 水面倒影」。问题：意象偏「亭子」，与「红楼社 · 一梦红楼」关联弱，且缩到 24px 时亭形发糊。

### 方案 A（推荐）：「梦窗红楼」—— 重檐楼阁 + 圆月漏窗

- **意境**：楼（而非亭）+ 圆月漏窗（点「梦」）+ 一支海棠/一弯月（点「一梦红楼」），仍保留印章形制，与品牌红一脉相承。
- **配色**：朱砂红底 `#A63834`，古铜金描边 `#C49A6C`（55% 透明度，1.2px），楼阁与窗月用米白 `#F5EFE3`，翘角/檐口用浅米 `#EDE5D2`。
- **建议 SVG 造型**（`viewBox="0 0 48 48"`，与现 logo 同尺寸可平滑替换）：
  1. 外框：`rect x=2 y=2 w=44 h=44 rx=11` 填 `#A63834`；内描边 `rect … stroke=#C49A6C stroke-opacity=.55 stroke-width=1.2`。
  2. **重檐攒尖顶（楼）**：上檐三角 `M24 7 L34 16 H14 Z` 填 `#F5EFE3`；下檐 `M10 16 H38 V19 H10 Z` 填 `#EDE5D2`，两端加两笔飞檐翘角（`M10 16 L6 13 M38 16 L42 13`，1.6px 米白描边）。
  3. **楼身**：`rect x=20 y=19 w=8 h=15` 填 `#F5EFE3`，左右留白即成立柱；楼身正中开「圆月漏窗」`circle cx=24 cy=26 r=5` 填回底色 `#A63834`。
  4. **窗内点睛**：一弯月牙 `M24 23.5 a3.4 3.4 0 1 0 0 5`（米白 1.6px 描边）+ 右上一点朱砂星 `circle cx=27.5 cy=23 r=0.9` 填 `#F5EFE3`（表达「一梦」）。
  5. **底部水纹**（继承原 logo 记忆点）：`M9 40 q3-1.6 6 0 t6 0 t6 0 t6 0 t6 0` 米白 1.2px 描边，透明度 0.6。
- **字标（Wordmark）搭配**：侧边栏在 Logo 右侧加竖排或横排字标 —— `红楼社`（`font-serif text-xl font-semibold tracking-[0.25em] text-ink`）+ 下一行小字 `一梦红楼`（`text-[10px] tracking-[0.3em] text-gold`）。当前侧边栏 `app-sidebar.tsx` 只有 Logo 没有字标，建议补上。

### 方案 B（备选）：「印章 · 梦字」—— 阳文朱印，文字向

- **意境**：把「梦」字直接做成一方朱文印章，上方以一笔屋顶 / 一枝海棠收边，牌匾感更强，缩到 24px 仍清晰，适合作为 favicon、通知角标、分享卡片水印。
- **配色**：阳文——红字白底（`#A63834` 字 + `#F9F5F0` 底 + 金边）；或阴文——白字红底。两者都可配 55% 金边。
- **建议 SVG 造型**（`viewBox="0 0 48 48"`）：
  1. 外框同方案 A 的圆角方框（金边）。
  2. 中央「梦」字：用**宋体/篆书笔划风格**描边路径（粗 2px 米白/朱砂），笔划重心偏左上，右下留白处盖一枚极小方印 `rect 3×3 rx=1 fill=#C0392B`。
  3. 顶部一笔屋顶折线 `M14 12 L24 6 L34 12`（金或米白 1.6px）压在字上方，暗示「楼」。
- **取舍**：A 更有意境与图形辨识度（推荐主用）；B 更「品牌/社」、缩略更稳（推荐作 favicon 与角标）。

### Logo 应用规格

| 场景 | 尺寸 | 说明 |
|---|---|---|
| 侧边栏主标 | `40×40`（`h-9 w-9`） | 配字标 |
| 移动端顶栏 | `32×32` | 仅图形 |
| favicon / 通知角标 | `24×24` | 用方案 B |
| 分享卡片水印 | 右下角 12% 透明度 | 用方案 B |

---

## 3. 六大板块视觉身份（交付 2）

**统一定义「板块页头组件 SectionHero」**（建议新建 `components/section-hero.tsx` 复用，替换现有各页手写页头）：

```
<section className="border-b border-line/70 pb-6">
  <div className="flex items-center gap-3">
    <span className="h-8 w-1 rounded-full bg-{sector}" />          {/* 板块色竖条，替换原 4px 朱砂竖条 */}
    <p className="text-[11px] uppercase tracking-[0.32em] text-{sector}-deep">ENGLISH</p>
  </div>
  <h1 className="mt-3 font-serif text-3xl font-semibold tracking-wide text-ink md:text-4xl">板块名</h1>
  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">一句话简介</p>
  <div className="mt-5 flex flex-wrap gap-2">{主 CTA（板块深阶色）+ 次级入口}</div>
</section>
```

以下每个板块给出：**主题色 / 专属图标 / 装饰元素 / 排版手法 / 落地要点**。

### 3.1 人物志（/characters，含 /graph /journey /poems 子页）

- **主题色**：黛青 `#4E7A7C`（深阶 `#3A5F61`，浅底 `#EAF1F0`）。
- **专属图标 `IconCharacters`**（24×24，stroke 1.6，round）：并立双人剪影 + 底部一条书册横线 —— `circle cx=9 cy=7 r=3`、`circle cx=15 cy=7 r=3`、`path M3 20c.7-3.2 3.3-5 6-5s5.3 1.8 6 5`（右人）、`path M9 20c.7-3.2 3.3-5 6-5s5.3 1.8 6 5`（右人，错位）→ 简化为两条肩弧，底部 `M4 20h16` 册页线。
- **装饰元素**：「群芳谱 · 册页」——卡片左上角盖一枚黛青小方印（`w-6 h-6 rounded-[4px] bg-characters text-paper` 写「谱」字），标题下方用一条**竖向册页分隔线**（`border-l-2 border-characters/60 pl-3`）替代横线。
- **排版手法**：档案式。人物卡标题字距放宽 `tracking-[0.08em]`，姓名宋体，副标题「字 / 别号 / 居所」竖排一列小字。时间线节点由朱砂圆点改为**黛青圆点**（仅此板块）。
- **落地要点**：`character-card.tsx`、`character-center.tsx`、`character-avatar.tsx`、`app/characters/*` 页头的竖条与标签改黛青。

### 3.2 大观园（/map，含 /journey）

- **主题色**：松绿 `#5D8A62`（深阶 `#47714C`，浅底 `#EBF2EC`）。
- **专属图标 `IconGarden`**：园林月亮门（圆拱）—— `path M6 21V11a6 6 0 0 1 12 0v10`、地线 `M4 21h16`、拱内一枝斜竹 `M12 16c-1.5-1.5-1-4 1-5`。
- **装饰元素**：「漏窗」——地点卡片用**窗棂角饰**（四角各一段 L 形金/绿短线，`pseudo` 或四个 `span`），顶部一条松绿细线 + 左侧一扇小月亮门水印。
- **排版手法**：空间导览式。地点卡片带**编号圆标**（`w-6 h-6 rounded-full bg-garden text-paper text-[11px]` 写 壹/贰/叁），卡片内「住户头像」前置（现 `location-cards.tsx` 已有头像前置，改松绿描边即可）。
- **落地要点**：`location-cards.tsx`、`app/map/[id]`、`journey-map.tsx`；地图热区红点保留朱砂（那是品牌红，不是板块色）。

### 3.3 聊一聊（/community）

- **主题色**：绛赭 `#B66A4C`（深阶 `#93533A`，浅底 `#F6ECE6`）。
- **专属图标 `IconChatRoll`**：中式「卷轴气泡」—— 圆角矩形对话泡 `rect x=4 y=5 w=15 h=10 rx=3` + 左侧卷轴杆 `M6 4v12` + 尾舌 `M7 17 L5 20 H11`，右上一点炉火星 `circle cx=17 cy=8 r=0.8`。
- **装饰元素**：「炉火 · 烟火气」——帖子流 hover 高亮改为绛赭 tint（`hover:bg-chat-soft/60`），热帖榜序号与「热帖」标签用绛赭（替换现统一朱砂 `bg-primary/10 text-primary` 标签）。
- **排版手法**：保持小红书式弱分割线 feed（`border-b border-line-inner/60`），把**互动图标 hover/激活色**改为绛赭深阶（点赞激活可保留朱砂，其余 `hover:text-chat-deep`）。「发帖讨论」「发表状态」主 CTA 用 `bg-chat-deep`（`#93533A`）。
- **落地要点**：`community-feed.tsx`、`post-detail.tsx`、`comment-thread.tsx` 的标签、序号、图标 hover 色；页头 CTA 按钮底色改绛赭深阶。

### 3.4 问一问（/questions）

- **主题色**：靛蓝 `#405D8A`（深阶 `#324A6E`，浅底 `#EBEFF5`）。
- **专属图标 `IconAsk`**：翻开的书卷 + 问号 —— 左页 `path M12 6C9 4 5 4 3 5.5V18c2-1.5 6-1.5 9 .5`、右页镜像 `M12 6c3-2 7-2 9-.5V18c-2-1.5-6-1.5-9 .5`、中缝问号 `M12 10a2.6 2.6 0 0 1 5 .7c0 1.7-2.6 2.3-2.6 3.7` + 点 `circle cx=12 cy=16.6 r=0.5`。
- **装饰元素**：「考据 · 引用」——观点引用块（现 `QuoteBlock` 金左边框）改为**靛蓝左边框**（`border-l-2 border-ask/70`，仅问一问板块内）；问题编号用靛蓝 `font-mono`（`Q01`）。
- **排版手法**：问答式。问题标题宋体加粗，观点卡内「出处/回数」右对齐小字（靛蓝 `text-ask-deep`），「在问题下发起」链接用靛蓝下划线（替换现朱砂）。
- **落地要点**：`app/questions/*`、`components/community/question-body.tsx`、`question-discussion.tsx`、`QuoteBlock` 加一个可选 `tone="ask"` prop 或按板块套类。

### 3.5 海棠诗社（/poem-society）

- **主题色**：海棠绯 `#BE6E86`（深阶 `#9E5470`，浅底 `#F6EAEE`）。
- **专属图标 `IconPoem`**：五瓣海棠 + 斜置毛笔 —— 中心 `circle cx=12 cy=9 r=1.2`，五片花瓣 `path M12 5c-1 2-3 3-3 5s2 2 2 2…`（对称五瓣），右下斜笔杆 `M16 14 L21 19` + 笔毫 `M19.5 17.5 L21 19`。
- **装饰元素**：「诗笺 · 朱丝栏」——诗卡用**竖排朱丝栏**（`background: repeating-linear-gradient(90deg, transparent 0 26px, #F6EAEE 26px 27px)` 或左右两条绯色细竖线），底部一枚小「海棠」印章。
- **排版手法**：竖排诗题 / 对仗。诗题居中宋体 `tracking-[0.2em]`，正文可竖排（`writing-mode: vertical-rl`，移动端保留横排降级）；「佳作集」缩略卡用海棠绯底纹。页内导航（`poem-society-nav.tsx`）选中态改海棠绯深阶。
- **落地要点**：`poem-society/*` 组件、`poem-card.tsx`、`poem-rotator.tsx`、`poem-society-nav.tsx`。

### 3.6 个人空间（/profile 个人中心 + /u?id= 他人空间）

- **主题色**：绀紫 `#6A5B92`（深阶 `#54476F`，浅底 `#EFEDF5`）。
- **专属图标 `IconMe`**：一方私印 + 人形 —— 圆角方框 `rect x=4 y=4 w=16 h=16 rx=3`，框内抽象人 `circle cx=12 cy=10 r=2.6` + `path M7.5 18.5c.6-3 2.4-4.6 4.5-4.6s3.9 1.6 4.5 4.6`，右下一点朱砂 `circle cx=17.5 cy=17.5 r=0.8 fill=#C0392B`。
- **装饰元素**：「私印 · 书斋」——身份卡顶部加**绀紫渐变封面**（见第 4 节），等级徽章、关注数、进度条均用绀紫/金。
- **排版手法**：档案 + 成长。头部大号积分数字 `font-serif text-3xl text-me-deep`，进度条 `bg-me`，标签/关注按钮在「人」的动作上仍保留朱砂（遵循 1.2 规则）。
- **落地要点**：见第 4 节详细页面结构。

---

## 4. 他人空间 + 个人中心 UI 优化（交付 3）

### 4.1 等级徽章体系（先升级，两页共用）

现状 `level-badge.tsx`：所有等级统一 `bg-primary-deep` 朱砂 pill。升级为**四级四色印章徽章**（圆角 `rounded-[5px]`，呼应印章语言，非胶囊）：

| 等级 | 名称 | 底色 | 文字色 | 描边 | 意境 |
|---|---|---|---|---|---|
| LV1 | 懵懂 | `#F2EDE4`（paper-deep） | `#5C4A3D` | `#D4C7B9` | 刚入园，素净 |
| LV2 | 试才 | `#EAF1F0` | `#3A5F61` | `#4E7A7C` | 黛青 · 初试 |
| LV3 | 通灵 | `#C49A6C`（金底） | `#5C3A1E` | `#A63834`（朱砂边） | 通灵宝玉 |
| LV4 | 元老 | `#6A5B92`（绀紫底） | `#F9F5F0` | `#C49A6C`（金边） | 紫金 · 元老 |

组件结构（改写 `level-badge.tsx`）：

```tsx
const TIERS = {
  1: "bg-paper-deep text-secondary-btn-text border-line",
  2: "bg-characters-soft text-characters-deep border-characters/60",
  3: "bg-gold text-[#5C3A1E] border-primary/70",
  4: "bg-me text-paper border-gold",
};
// <span className={`inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-0.5
//   font-serif text-[10px] leading-none tracking-widest ${TIERS[lv]}`}>
//   {levelName} · LV{level}
// </span>
```

- 通灵（LV3）徽章内加一颗「通灵宝玉」点：`span class="h-1.5 w-1.5 rounded-full bg-primary"`。
- 元老（LV4）徽章右侧加一方 8px 小印 `span class="h-2 w-2 rounded-[2px] bg-gold/80"`。

### 4.2 他人空间（/u?id=，改写 `components/user-public-page.tsx`）

**新版布局（三段式，替换现单列白卡）**：

```
<div className="mx-auto max-w-4xl px-6 py-14">
  {/* ① 封面 Banner（新） */}
  <div className="relative h-40 overflow-hidden rounded-3xl border border-line/60
       bg-gradient-to-br from-me/25 via-surface to-surface shadow-card">
    <div className="card-print card-print--identity absolute inset-0 opacity-40" />   {/* 园林线稿水印 */}
    <p className="absolute right-5 bottom-3 text-[10px] tracking-[0.3em] text-me-deep/60">一梦红楼 · 同好空间</p>
  </div>

  {/* ② 身份卡（头像下压叠在 Banner 上） */}
  <section className="-mt-10 px-5">
    <div className="rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-end gap-5">
        <img className="h-24 w-24 -mt-16 rounded-full border-2 border-gold object-cover bg-surface" />  {/* 头像 96px，金边，白底垫 */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-serif text-2xl font-semibold text-ink">{username}</h1>
            <LevelBadge …/>                       {/* 新四级徽章 */}
            {互相关注 && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] text-[#8a6a3f]">互关</span>}
          </div>
          <p className="mt-1 text-xs text-muted">注册于 {date}</p>
          <p className="mt-2 font-serif text-[13px] text-gold">「{signature}」</p>
        </div>
        <button className="rounded-full bg-primary px-6 py-2.5 font-serif text-sm text-paper hover:bg-primary-deep">
          {状态：＋关注 / 已关注 / 互相关注 / 取消关注}
        </button>
      </div>

      {/* 数据条：四项，竖线分隔，数字 mono 绀紫 */}
      <div className="mt-5 flex items-center divide-x divide-line/70 border-t border-line-inner/70 pt-4 text-center">
        <Stat label="关注" value={following} />
        <Stat label="粉丝" value={followers} />
        <Stat label="积分" value={points} />
        <Stat label="内容" value={items.length} />
      </div>
    </div>
  </section>

  {/* ③ 内容（卡片网格 + 板块色） */}
  <section className="mt-6">
    <div className="flex items-center gap-3">
      <span className="h-4 w-1 rounded-full bg-me" />
      <h2 className="font-serif text-lg font-semibold text-ink">{username} 的内容</h2>
      <TabTabs：全部/动态/长文/作品 />
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {items.map(card)}   {/* 卡片 hover：ring-me/20 + 左移 */}
    </div>
  </section>
</div>
```

**关注关系呈现（新增三处）**：

1. **互关识别**：当 `following && 对方关注我` 时，按钮文案 `互相关注`，并加 `互关` 金色小签（见上）。
2. **关注按钮四态**（含禁用态 `disabled:opacity-60`）：
   - 未关注：`bg-primary text-paper`「＋ 关注」
   - 已关注：`border border-gold/60 bg-surface text-secondary-btn-text`「已关注」（hover 显示「取消关注」并变 `text-red-700`）
   - 互关：`border border-gold bg-gold/15 text-[#8a6a3f]`「互相关注」
3. **「TA 关注的人」头像条**（在数据条下方可选展开）：`-space-x-2` 叠放的头像圆 `h-7 w-7`，末尾 `+N` 圆点，点击展开列表（复用 `UserChip`）。

### 4.3 个人中心（/profile，改写 `app/profile/page.tsx`）

**核心改动：左栏三张碎卡合并为一张「我的档案卡」+ 顶部 Banner，右栏保留「我的内容 + 测试结果」。**

```
<div className="mx-auto max-w-4xl px-6 py-14">
  <SectionHero sector="me" title="个人中心" en="MY SPACE" />    {/* 复用 3.x 页头 */}

  <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
    {/* 左：我的档案卡（合并原 资料/积分/签到 三卡） */}
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-line/60 bg-surface shadow-card">
        {/* 封面 */}
        <div className="h-24 bg-gradient-to-br from-me/30 via-surface to-surface" />
        <div className="-mt-8 px-5 pb-5">
          <img className="h-16 w-16 rounded-full border-2 border-gold object-cover" />   {/* 头像 64px */}
          <div className="mt-2 flex items-center gap-2">
            <p className="font-serif text-lg font-semibold text-ink">{username}</p>
            <LevelBadge …/>
          </div>
          <p className="text-xs text-muted">{role} · 注册于 {date}</p>
          <p className="mt-1 font-serif text-[13px] text-gold">「{signature}」</p>

          {/* 积分 + 进度 */}
          <div className="mt-4 rounded-2xl bg-me-soft/60 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted">积分</span>
              <span className="font-serif text-3xl font-semibold text-me-deep">{points}</span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-gradient-to-r from-me to-me-deep" style={{width: pct+'%'}}/>
            </div>
            <p className="mt-1.5 text-[11px] text-muted">{距离下一级文案}</p>
          </div>

          {/* 关注 / 粉丝 / 签到 / 换头像（合并原散块） */}
          <div className="mt-4 flex items-center justify-between text-sm text-body">
            <span>关注 <b className="font-mono text-me-deep">{following}</b></span>
            <span>粉丝 <b className="font-mono text-me-deep">{followers}</b></span>
            <Link href="/profile/points" className="font-serif text-xs text-gold hover:text-primary">积分明细 →</Link>
          </div>
          <button 签到 className="mt-4 w-full rounded-full bg-me-deep text-paper …">每日签到 ＋5 分</button>
          <button 换头像 className="mt-3 w-full rounded-full border border-gold/60 …">更换头像</button>
        </div>
      </section>

      {/* 我的关注（头像网格 + 互关标注） */}
      <section className="rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
        <h2 className="font-serif text-base font-semibold text-ink">我的关注 <span className="font-mono text-xs text-muted">{n}</span></h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {follows.map(头像圆 h-12 w-12 + 名 + 互关小签)}
        </div>
      </section>

      {/* 账号设置（沿用，样式微调为 me 色 hover） */}
    </div>

    {/* 右：我的内容（tab 改用 me 色）+ 测试结果 */}
  </div>
</div>
```

- **tab 选中态**：`bg-me-deep text-paper`（替换现 `bg-primary`），`profile/page.tsx` 的 `TABS` 按钮与「我的内容」竖条改绀紫。
- **测试结果卡**：保留朱砂「再次分享」（人的动作），「重新测试 / 了解人物」次级按钮 hover 改绀紫。

---

## 5. 发表状态独立页面（交付 4）

现状 `status-composer.tsx` 是内嵌展开卡，仅文字、无图片、视觉弱。目标：独立页面，支持**图片 + 文字**，与发帖讨论页（`post-composer.tsx`）一致的「门面」形式感。

### 5.1 路由与文件

- 新页面：`app/community/status/page.tsx`（静态导出，无动态参数，直接可建）。
- 新组件：`components/community/status-composer-page.tsx`（参照 `post-composer.tsx` 结构）。
- 入口接线：把 `community-feed.tsx` 里的内嵌 `StatusComposer` 入口改为 `Link href="/community/status"`（保留「✦ 发表状态」胶囊样式）；`user-menu.tsx` 增加「发表状态」项。

### 5.2 页面结构（与发帖页对齐的 `inputCls`/间距）

```tsx
const inputCls = "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm
  text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-gold";

return (
  <div className="mx-auto max-w-2xl px-6 py-14">
    <Link href="/community" className="text-xs text-muted hover:text-primary">← 返回讨论区</Link>
    <h1 className="mt-4 font-serif text-3xl font-semibold text-ink">发表状态</h1>
    <p className="mt-2 text-sm text-muted">以「{me.username}」身份发布 · 一句话心境 + 最多 9 张图 · 自动审核</p>

    <form className="mt-8 space-y-5">
      {/* ① 文字（无标题，强调大字号宋体可选） */}
      <div>
        <label className="mb-1.5 block text-xs text-muted">这一刻（最多 280 字）</label>
        <textarea value={text} rows={5} maxLength={280} autoFocus
          placeholder="分享此刻的心情、一句话的心境……（例如：读到「花谢花飞花满天」时，你想起谁）"
          className={`${inputCls} font-serif text-base leading-relaxed`} />
        <div className="mt-1.5 text-right text-xs text-muted">{text.length}/280</div>
      </div>

      {/* ② 配图（复用 compressAndUpload / uploadImages，与发帖一致 80×80 九宫格） */}
      <div>
        <label className="mb-1.5 block text-xs text-muted">配图（最多 9 张，自动压缩后上传）</label>
        <div className="flex flex-wrap gap-3">
          {images.map((u, i) => (
            <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
              <img src={sitePath(u)} className="h-full w-full object-cover" />
              <button onClick={() => remove(i)} className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center
                justify-center rounded-full bg-black/60 text-xs text-white">✕</button>
            </div>
          ))}
          {images.length < 9 && (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed
              border-line text-2xl text-muted hover:border-gold hover:text-primary">＋</button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles}/>
      </div>

      {/* ③ 可选：同步话题（轻量，非必填，区别于发帖的必填话题） */}
      <div>
        <label className="mb-1.5 block text-xs text-muted">同步到话题（可选）</label>
        <div className="flex flex-wrap gap-2">
          {["今日动态", ...PRESET_TAGS].map(t => chip(t))}   {/* 单选 chip，选中 bg-chat-deep */}
        </div>
      </div>

      {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
      {busy && <p className="text-sm text-muted">正在压缩并上传图片…</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={busy || !text.trim()}
          className="flex-1 rounded-xl bg-chat-deep py-3 font-serif text-[15px] text-paper
          transition-colors hover:bg-[#7d442f] disabled:opacity-60">发布状态</button>
        <button type="button" onClick={() => router.push("/community")}
          className="rounded-xl border border-line px-5 py-3 text-sm text-muted hover:text-body">取消</button>
      </div>
    </form>
  </div>
);
```

**发布载荷**（沿用现有 `/api/posts`，与内嵌版一致，只多带 `images` 与可选 `tag`）：

```ts
await apiPost("/api/posts", {
  title: "",                       // 状态无标题
  content: text.trim(),
  tag: tag || "今日动态",
  type: "dynamic",                 // 沿用 dynamic 类型，个人中心「动态」tab 可正确归类
  images,                          // 新增：与发帖页相同结构
});
```

**发布成功**：`router.push("/community?tab=new")` 并展示 toast「已发布 ✓」。

### 5.3 与发帖页的「一致形式感」清单

| 元素 | 发帖页 `/community/new` | 状态页 `/community/status` |
|---|---|---|
| 返回链接 | `← 返回讨论区` | 同 |
| 页头 | `font-serif text-3xl` + 副标题 | 同（副标题改状态说明） |
| 表单 | `space-y-5 mt-8` | 同 |
| 输入框 | `inputCls`（白底/圆角/金 focus） | 同 |
| 配图 | 9 宫格 80×80 缩略 + ✕ | 同 |
| 主按钮 | 全宽朱砂 | 全宽**绛赭深**（聊一聊板块色） |
| 错误/上传提示 | 红字 / 灰字 | 同 |

> 差异点刻意只做一处：主按钮用聊一聊板块色（绛赭深阶 `#93533A`），让「状态」落在聊一聊板块身份里，其余形式感与发帖页完全对齐。

---

## 6. 实施落地清单（按依赖顺序）

1. **令牌**：`app/globals.css` 追加 6 组板块副色（第 1.1 节）。
2. **图标**：`components/icons.tsx` 追加 `IconCharacters / IconGarden / IconChatRoll / IconAsk / IconPoem / IconMe` 六枚线性图标。
3. **Logo**：改写 `components/logo-mark.tsx`（方案 A），`app-sidebar.tsx` 补字标；favicon 用方案 B。
4. **页头组件**：新建 `components/section-hero.tsx`，各板块页替换手写页头。
5. **等级徽章**：改写 `components/level-badge.tsx`（四级四色，第 4.1 节）。
6. **六大板块**：按第 3 节逐板块替换页头竖条、标签、图标、hover 色、CTA 色。
7. **个人空间**：改写 `user-public-page.tsx` 与 `app/profile/page.tsx`（第 4.2/4.3 节）。
8. **发表状态页**：新建 `app/community/status/page.tsx` + `status-composer-page.tsx`，接线入口（第 5 节）。
9. **全局自查**：`grep -rn "bg-primary/10\|text-gold\|h-4 w-1"` 清点残留的同质化标签/竖条，逐处替换为板块色；确认无 emoji 残留、所有交互元素焦点态 `focus-visible:outline-2 outline-{sector}`、触控目标 ≥44px。

> **落地状态记录（2026-08-23 更新）**：
> - ✅ 1 令牌（6 组板块副色）、2 图标（六枚专属图标）、4 页头组件 `section-hero.tsx`、5 等级徽章、7 个人空间、8 发表状态页 —— **均已落地**。
> - ⚠️ 3 Logo：**未按方案 A（梦窗印章）实施**。最终用户拍板改用 `public/images/logo-universal.png`（书法横幅），已用于侧边栏/移动顶栏/首页。原 `logo-mark.tsx` 保留但仅被死代码 `glass-nav.tsx` 引用，**视为废弃**。
> - 🔶 6 六大板块逐页替换：副色/页头已落地，部分装饰元素（漏窗/朱丝栏/册页分隔线等）按页面逐步接入中。

---

## 7. 无障碍与一致性校验（WCAG AA）

- 副色深阶文字对白底对比度 ≥ 4.5:1（1.2 节已按此选值）；副色仅用于 ≥16px 文字或描边/底纹。
- 焦点态：所有按钮/链接 `focus-visible:ring-2 ring-offset-2`，ring 色 = 所属板块主色。
- 触控目标：图标按钮、chip、tab ≥ 44×44px 命中区（移动端底部导航已满足）。
- 动效：延续 `docs/design-tokens.md` V1 —— 所有过渡 ≤300ms，`cubic-bezier(0.25,0.1,0.25,1)`，禁用弹跳/旋转入场。
- 文本缩放：字号基于 rem/Tailwind 文本类，支持浏览器缩放至 200% 不破版（页头标题 `md:text-4xl` 已留冗余）。

---

*设计规格版本：V2 · 基于 `globals.css` / `logo-mark.tsx` / `app-sidebar.tsx` / `profile/page.tsx` / `user-public-page.tsx` / `post-composer.tsx` / `status-composer.tsx` 现状梳理。*
