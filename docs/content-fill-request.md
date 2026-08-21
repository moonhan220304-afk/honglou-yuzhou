# 红楼宇宙 · 金陵十二钗深度内容填充需求 V1

> 写给知识引擎 Agent（数据库/内容对话框）。请按本需求产出**金陵十二钗全部深度档案**，
> 直接保存到本项目目录（不是只贴在回复里）。项目根目录：/Users/jy.moon/Documents/opc-HLM
> 本需求是 docs/knowledge-base/ 下既有文档的**执行补充**，数据契约与字段键名以既有文档为准：
> - `02-schema.sql`（存储结构）· `03-json-templates.md`（字段键名，**不可改键名**）
> - `04-content-spec.md`（内容规范：事件粒度/关系id排序/后40回标注/审核字段）
> - `06-verification-record.md`（已有检索记录，可沿用其已验证结论）

---

## 一、交付范围（全部必须完成）

### A. 金陵十二钗深度档案（12 人，一个都不能少）
林黛玉、薛宝钗、贾元春、贾探春、史湘云、妙玉、贾迎春、贾惜春、王熙凤、李纨、贾巧姐、秦可卿

- **林黛玉、薛宝钗**：以 `05-sample-data.json` 现有内容为底，**加深到本文档的深度标准**（补齐 interpretations 深度解读、原文证据等），作为增强版交付
- **其余 10 人**：全新完整档案

### B. 每个十二钗人物配套
| 配套 | 数量要求 |
|---|---|
| 事件 | 每人 5-10 个（关键事件 major ≥ 2），**深度标准见第三节** |
| 关系 | 每人 3-6 条（含与宝玉/黛玉/宝钗/贾母等核心人物的关系），核心关系带完整 stages |
| sources | 每条引文建 source 记录（original_text 为主，注明通行本） |
| viewpoints | 与该人物相关的红学观点 1-3 条（如凤姐之才、妙玉之洁、秦可卿之谜等，注明提出者） |

### C. 补充章节表缺口
`02-schema.sql` 的 chapter 表需全 120 回。目前仅验证 18 回（见 `06-verification-record.md`），
**请补齐全部 120 回的回目名 + attribution（前 80 回 caoxueqin / 后 40 回 gaoe）**，
回目文字必须与通行本一致并经搜索验证。

### D. 检索记录
新增 `docs/knowledge-base/content/verification.md`：列出你实际检索验证的条目
（12 钗身份/别名、每条原文引文、120 回回目名、事件回次、红学观点出处）。

---

## 二、深度标准（本次最重要的新要求）

> 背景：现有时间线每事件只有一句话，太浅。以下为**强制深度标准**，逐字段达标。

### 1. 人物（character）

| 字段 | 深度要求 |
|---|---|
| `identity.family / position / origin` | 具体详实（如探春注明"贾政庶出，赵姨娘所生"） |
| `tags` | 4-8 个，覆盖性格/才艺/命运/身份 |
| `summary.short` | 50-100 字总括 |
| `summary.long` | **≥ 200 字**：生平脉络 + 性格核心 + 命运走向（前 80 回与后 40 回分开表述） |
| `personality_analysis` | **3-5 个维度**，每个：`description ≥ 80 字`（结合情节展开，不只贴标签）+ `evidence_events ≥ 1`（指向本人物事件） |
| `timeline` | 5-10 个节点，覆盖 命运起点→性格成型→关系发展→结局，标题带回次 |

### 2. 事件（event）—— 时间线卡片展示的核心

| 字段 | 深度要求 |
|---|---|
| `summary.short` | 一句话（卡片用） |
| `summary.meaning` | **2-4 条**，每条一句"这件事意味着什么"（叙事功能/人物塑造/命运预示） |
| `participants` | 含主要人物 + 相关人物，`role` 具体（如"始作俑者""见证者""受害者"） |
| `evidence` | **≥ 1 条**原文引文（必须检索验证，宁短勿错，note 注明回次与情境） |
| `interpretations` | **2-3 条深度解读**，每条约 80-150 字，`type` 覆盖不同角度：`literary`（文学手法/叙事结构）、`character`（人物性格/心理）、`hongxue`（红学观点/争议）。**解读要具体有细节，引用情节和原文句，禁止空泛套话**（如"体现了XX的性格"这种必须展开） |

**解读质量示范**（好的写法）：
```
{
  "type": "literary",
  "title": "一石三鸟的叙事视角",
  "content": "借黛玉初来乍到之眼写贾府：读者与黛玉同为新客，贾府的门第、礼法、人物关系借她的观察自然展开——贾母之慈、三春之怯、凤姐之威、宝玉之痴，皆在黛玉第一次拜访中完成亮相。叙事学上称为'陌生化视角'。"
}
```

### 3. 关系（relationship）

| 字段 | 深度要求 |
|---|---|
| `summary` | ≥ 60 字，概括关系性质与走向 |
| `stages` | **核心关系 ≥ 3 阶段**（如与宝玉/黛玉/钗黛之间），每阶段 `description ≥ 60 字`，含情节细节与原文依据；后四十回阶段必须 `note: "后四十回，attribution=gaoe"` |
| `impact` | **≥ 100 字**：该关系对人物命运、家族兴衰或全书主题的作用 |
| `evidence_events` | 2-5 个关联事件（含简短 description） |

### 4. source / viewpoint
- source：`authority` 注明版本（如"通行本原文（人民文学出版社程乙本校注本）"）；`verification` 写明验证情况
- viewpoint：多观点并存（`opinions[]` 含支持/反对双方），争议观点 `controversial: true`

---

## 三、文件交付格式（严格按此）

```
docs/knowledge-base/content/characters/character_lin_daiyu.json      （12 个文件，文件名=人物id）
docs/knowledge-base/content/verification.md                          （检索记录）

每个 JSON 文件结构（一个文件装一个人物的全套数据）：
{
  "character": { ... 03-json-templates.md 的 character 模板 ... },
  "events": [ ... 该人物关联的事件，event 模板 ... ],
  "relationships": [ ... 该人物参与的关系，relationship 模板 ... ],
  "sources": [ ... 本文件引用的 source 记录 ... ],
  "viewpoints": [ ... 相关红学观点（可选） ... ]
}
```

规则：
1. **只允许在 `docs/knowledge-base/content/` 目录下创建新文件**，禁止修改删除任何已有文件
2. 事件 id / 关系 id / source id 按 `04-content-spec.md` 第 11 节命名空间（如 `event_xifeng_controlling_ningguo_ch13`、`relationship_jia_baoyu_jia_tanchun`）
3. 关系 id 中人物排序按 `04-content-spec.md` 第 2 节核心度排序
4. 同一个人物跨文件的事件/关系请保持 id 一致（如黛玉相关事件只在黛玉文件里定义一次，其他人物引用该 id）
5. 完成后回复文件清单（文件名 + 内容摘要）

---

## 四、硬性质量要求

1. **全部原文引文必须真实搜索验证**，宁短勿错，禁止凭记忆编造
2. **后四十回内容全部标注 gaoe**（涉及 81-120 回的引用/事件/关系阶段）
3. **事实与观点分离**：事件是事实，判断归 viewpoint
4. 事件 `event_level`：major/minor/micro 按 `04-content-spec.md` 第 1 节判定
5. 每条记录 `status.review: "verified"`、`confidence` 按实际填写、`verified_by: "kb-agent-v2"`
6. 不要写任何工程代码，你的职责止步于数据交付

---

## 五、验收标准（对照自查）

- [ ] 12 钗全部交付，10 个新人物完整 + 黛玉宝钗增强版
- [ ] 每人 5-10 个事件，且 interpretations 每条 ≥80 字、有细节、非套话
- [ ] 每人 ≥1 条原文引文且经搜索验证（verification.md 可查）
- [ ] 120 回回目全量补齐
- [ ] 后四十回全部标注 gaoe
- [ ] 字段键名与 03-json-templates.md 零出入
- [ ] 只新增 docs/knowledge-base/content/ 下文件
