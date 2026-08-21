# 交接文档（Handover）——红楼知识宇宙 · 知识库数据侧

> 用途：换新对话窗口时，把本文件内容发给新 Agent 作为上下文。
> 最后更新：2026-08-16

---

## 1. 项目与职责定位

- 项目根目录：`/Users/jy.moon/Documents/opc-HLM`
- 本交接方职责：**《红楼梦》知识库数据侧**（数据契约 + 内容生产 + 检索验证），不写前端代码
- 前端（Codex/OpenCode 工程侧）直接读取 `docs/knowledge-base/` 下的 JSON 数据渲染页面与关系图谱

---

## 2. 目录结构与文件清单

```
docs/knowledge-base/
├── 01-er-diagram.md             # v1 ER 图（旧）
├── 01-schema-v2-design.md       # v2 表设计（含 fact_type 用法、L1/L2/L3 规则）
├── 02-schema.sql                # v1 DDL（旧）
├── 02-schema-v2.sql             # v2 DDL（21 张表，含 Question/Location/Poem 等新表）
├── 03-json-templates.md         # JSON 字段模板（键名契约）
├── 04-content-spec.md           # 内容规范（事件粒度/关系id排序/标签规范）
├── 05-sample-data.json          # v1 样例
├── 06-verification-record.md    # v1 检索记录
├── poems-full-list.md           # 诗词全清单
│
├── content/                     # ⚠️ v1 旧数据目录（12 人档案 + 120回目录 + 检索记录）
│   ├── chapters.json            #    120 回回目 + attribution
│   ├── characters/*.json        #    第一批 12 钗档案（格式与 v2 略旧）
│   └── verification.md
│
└── content-v2/                  # ✅ 当前正式数据库（前端主要读取此目录）
    ├── characters/*.json        # 80 个人物档案
    ├── questions.json           # 78 个全局问题（含 145+ 观点）
    ├── locations.json           # 19 个大观园地点
    ├── poems.json               # 25 篇诗词曲文
    ├── character-ages.json      # 80 人年龄考（12 条年龄争议）
    ├── name-etymology.json      # 55 条命名考据（谐音/典故/象征/命名系统/争议）
    ├── discussion-topics.json   # 第二阶段讨论话题种子（1 主话题 + 14 示例观点）
    ├── relationship-merge-map.json/.md  # 关系合并映射表（已执行完）
    ├── coverage-report.md       # 覆盖报告
    └── verification-record.md   # v2 检索记录
```

⚠️ **注意**：前端同时读取 `content/` 与 `content-v2/` 两个目录（loader 会合并）。`content/` 是历史遗留，新增数据一律进 `content-v2/`。

---

## 3. 数据库当前全量状态（截至 2026-08-16）

| 指标 | 数量 |
|------|------|
| 人物档案 | **80 人**（12 钗正册 + 宝玉 + 核心主子/丫鬟/外围/十二官） |
| 事件 | 500+（回次覆盖 1-120 回，其中 1-80 回全覆盖） |
| 关系 | **352 条**（每对人物唯一一条，已去重合并） |
| 全局问题 | 78 问（含脂砚斋/版本/结局/爬灰等争议专题） |
| 地点 | 19 处 |
| 诗词 | 25 篇 |
| 年龄考 | 80 条 + 12 条年龄矛盾专论 |
| 命名考据 | 55 条 |
| 讨论话题 | 1 主话题 + 14 观点 |
| 120 回目录 | 全量（前 80 回 caoxueqin / 后 40 回 gaoe） |

---

## 4. 数据格式硬性约定（新数据必须遵守）

1. **fact_type 五值**（每条内容记录必带）：
   `canonical_text_fact`（原文事实）/ `text_inference`（原文推算）/ `scholarly_viewpoint`（学术观点）/ `adaptation_only`（影视改编）/ `disputed_version`（版本争议）
2. **后四十回**（81-120 回）内容：`attribution: "gaoe"` + 标 `disputed_version`，note 加 `[后四十回]`
3. **关系 id**：`relationship_{A}_{B}`，A 为更核心人物（排序见 04-content-spec.md 第 2 节）；**同一对人物只允许一条关系记录**（跨文件引用同 id，不再重复定义）
4. **direction**：`mutual` / `one-way`（单向关系如加害者-受害者用 one-way）
5. **nature 枚举已归一**：kinship / romantic / friendship / master_servant / patronage / conflict / mentorship / rivalry / symbolic_parallel
6. **status**：`review: verified`、`verified_by: "kb-agent-v2"`、confidence 按实际填
7. **事件 event_level**：major / minor / micro（判定规则见 04-content-spec.md 第 1 节）
8. **每条引文必须真实检索验证**，宁短勿错；source 表注明版本
9. 人物档案结构（每人一个文件）：
   ```json
   { "character": {…含 name_etymology 与 age 字段…}, "aliases":[], "events":[], "relationships":[], "poems":[], "questions":[], "sources":[], "viewpoints":[], "coverage":{…} }
   ```

---

## 5. 已完成的工作清单（按时间线）

1. **v1 数据契约**：ER 图、DDL、JSON 模板、内容规范、样例、检索记录（01-06 号文件）
2. **v1 第一批内容**：12 钗档案 + 120 回目录 + 检索记录（`content/` 目录）
3. **v2 框架升级**：读 `OPENCODE_CONTENT_DATABASE_FRAMEWORK.md` 与 `CONTENT_DEPTH_STANDARD.md`（项目根目录），新增 Question/Location/Poem/fact_type/L1-L3 体系
4. **v2 Tier S/A/B 人物**：宝玉、贾母、王夫人、袭人、晴雯、紫鹃、刘姥姥、平儿等 80 人档案
5. **前 40 回全覆盖**：34 个新人物 + 10 个前 40 回争议问题
6. **40-80 回补充**：尤二姐/尤三姐/柳湘莲/夏金桂/薛宝琴等 25 人 + 12 个争议问题
7. **热议话题 6 条**（用户图片 OCR 后入库）：脂砚斋身份、版本推荐、宝黛爱情、曹雪芹真名、高鹗续书、爬灰证据链
8. **命名考据**：55 条（谐音/典故/象征/命名系统/争议），已注入各人物档案 `name_etymology` 字段
9. **年龄考**：80 人 + 12 条年龄矛盾（全部基于原文锚点），已注入各档案 `age` 字段
10. **讨论话题种子**：「最想改写谁的结局」1 主话题 + 14 条真实网友观点
11. **关系去重合并**：352 对唯一化，删除 121 条重复记录（前端截图反馈的甄士隐↔香菱双线已修复）

---

## 6. 待办与已知缺口

1. **research_topics（L3 深度研究档案）**：schema 已建表，内容尚未生产（Tier S 人物的 ResearchTopic 专题）
2. **Tier B 剩余人物**（框架文档清单中尚缺）：赵姨娘已建，但如 **贾代儒、金荣、金寡妇、周瑞家的、门子、冯渊、倪二、卜世仁、贾琮、封氏、板儿、翠缕、李贵、张友士、净虚、张金哥、多浑虫、云儿、香怜、玉爱、贾菌、宝珠、瑞珠、玉钏** 等极次要人物尚未建 L1 档
3. **adaptation_only 内容为零**：影视改编差异（87版/10版电视剧、越剧等）尚未生产
4. **discussion 接口数据**：讨论区 Post/Comment 内容未开始（第二阶段开放）
5. **coverage-report.md** 数字需在下次大更新后刷新
6. **content/ 旧目录**：12 份 v1 档案与 v2 有字段差异，前端同时读取；如需彻底清理可并入 v2 后删除（需与工程侧确认）

---

## 7. 关键注意事项

1. **前端保底合并**：loader 对同一对人物的多条关系记录会强制合并——所以新数据**严禁**为同一对人物创建两条关系（包括「表兄妹」+「恋人」这种有意的双线），否则前端会吞掉一条
2. **关系 id 一致性**：同一条关系跨文件引用时必须用同一个 id（已合并的 352 条即是当前规范）
3. **每改一次数据**：跑 JSON 校验 + 重扫关系配对确认 0 重复（校验脚本模式见第 8 节）
4. **不要改代码**：`lib/`、`components/`、`app/` 下是前端代码，数据侧禁止触碰
5. **检索工具**：AnySearch CLI（`node ~/.agents/skills/anysearch/scripts/anysearch_cli.js`，支持 search / batch_search / extract）；图片识别用 `node ~/.agents/skills/vision/vision.js <路径>` 或 `look.js`
6. **外部需求文档**（项目根目录）：`OPENCODE_CONTENT_DATABASE_FRAMEWORK.md`（表结构与种子问题）、`CONTENT_DEPTH_STANDARD.md`（深度标准与 Tier 分级）

---

## 8. 常用校验命令

```bash
# 校验所有人物档案 JSON 有效性
node -e "const fs=require('fs');const dir='docs/knowledge-base/content-v2/characters/';let bad=[];for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){try{JSON.parse(fs.readFileSync(dir+f,'utf8'))}catch(e){bad.push(f)}}console.log(bad.length?bad:'all valid')"

# 重扫关系配对查重（应输出 duplicate pairs remaining: NONE）
node -e "const fs=require('fs');const dirs=['docs/knowledge-base/content/characters/','docs/knowledge-base/content-v2/characters/'];const m={};const n=x=>x.replace(/^character_/,'');for(const d of dirs){for(const f of fs.readdirSync(d).filter(x=>x.endsWith('.json'))){const j=JSON.parse(fs.readFileSync(d+f,'utf8'));for(const r of(j.relationships||[])){const a=n(r.from||''),b=n(r.to||'');const k=[a,b].sort().join('<=>');(m[k]=m[k]||[]).push(f)}}}const dup=Object.entries(m).filter(([k,v])=>v.length>1);console.log('pairs:',Object.keys(m).length,'duplicates:',dup.length)"
```

---

## 9. 给新 Agent 的启动指令（可直接粘贴）

> 你负责《红楼梦》知识库数据侧。请先阅读本交接文件（docs/knowledge-base/HANDOVER.md），
> 再阅读项目根目录的 OPENCODE_CONTENT_DATABASE_FRAMEWORK.md 与 CONTENT_DEPTH_STANDARD.md，
> 以及 docs/knowledge-base/04-content-spec.md 的内容规范。
> 当前数据库在 docs/knowledge-base/content-v2/ 下，共 80 人物档案、78 问题、352 关系。
> 所有新数据必须：带 fact_type、后四十回标 gaoe、引文经真实检索验证、关系同对唯一。
> 请按用户指令继续补充数据。
