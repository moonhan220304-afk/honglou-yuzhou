# 《红楼梦》网站｜OpenCode 内容数据库框架

> 版本：v0.1  
> 用途：交给 OpenCode 直接执行数据库建模、种子数据与内容库建设。  
> 核心原则：**人物是骨架，问题是钩子，事件/章节/原文是事实层，观点/证据是理解层，讨论是社区层。**

---

## 1. 产品数据目标

本项目不是“红楼梦百科”，而是一个可探索的《红楼梦》知识与讨论网络。

核心探索链路：

**人物 → 事件 → 章节/原文 → 问题 → 观点/证据 → 讨论**

典型用户路径：

- 首页点击“潇湘馆 / 林黛玉”
- 进入林黛玉人物页
- 查看她的生平、关系、关键事件
- 点进“黛玉为什么葬花？”
- 阅读原文证据与不同解释
- 再进入相关人物、章节、事件或讨论

数据库必须服务这种“不断深入”的探索，而不是只支持人物简介卡片。

---

## 2. 核心实体与推荐 Schema

### 2.1 Character｜人物

用途：人物主档案与所有内容的核心锚点。

必要字段：

- `id`
- `slug`
- `name`
- `gender`
- `short_intro`
- `identity_summary`
- `family_group`
- `first_appearance_chapter_id`
- `importance_level`：core / major / secondary
- `content_level`：L1 / L2 / L3
- `status`：draft / reviewed / published
- `sort_weight`
- `asset_key`
- `created_at`
- `updated_at`

可选字段：

- `birth_origin_summary`
- `fate_summary`
- `residence_location_id`
- `keywords[]`
- `notes_internal`

规则：

- 人物视觉只保存 `asset_key/path`
- 禁止 OpenCode 生成、替换、重绘人物图
- `slug` 使用稳定英文或拼音，如 `lin-daiyu`

---

### 2.2 CharacterAlias / Title｜别名 / 称谓

字段：

- `id`
- `character_id`
- `alias`
- `alias_type`：courtesy / nickname / title / family_address / servant_address / other
- `context`
- `source_id`
- `status`

---

### 2.3 Relationship｜人物关系

用途：支持人物关系图、关系卡片、关系路径探索。

字段：

- `id`
- `from_character_id`
- `to_character_id`
- `relationship_type`
- `directional`：boolean
- `relationship_summary`
- `start_chapter_id`
- `end_chapter_id`
- `strength_weight`
- `fact_type`
- `evidence_ids[]`
- `source_ids[]`
- `status`

关系类型示例：

- family
- romantic
- friendship
- master_servant
- political
- conflict
- patronage
- marriage
- kinship
- social_alliance
- symbolic_parallel

---

### 2.4 Event｜事件

用途：人物生平时间线、情节网络、问题证据。

字段：

- `id`
- `slug`
- `title`
- `summary`
- `event_type`
- `start_chapter_id`
- `end_chapter_id`
- `location_id`
- `importance_weight`
- `fact_type`
- `source_ids[]`
- `status`

关联：

- characters[]
- chapters[]
- questions[]
- evidence[]
- locations[]

---

### 2.5 Chapter｜章节

字段：

- `id`
- `chapter_number`
- `title`
- `summary`
- `edition_id`
- `status`

可扩展：

- `major_characters[]`
- `major_events[]`
- `questions[]`
- `evidence[]`

---

### 2.6 TextExcerpt / Evidence｜短原文 / 证据

用途：人物、问题、观点、事件的原文依据。

字段：

- `id`
- `chapter_id`
- `edition_id`
- `quote_short`
- `context_summary`
- `evidence_type`
- `fact_type`
- `source_id`
- `copyright_note`
- `status`

版权规则：

- 只保存短摘录
- 不批量保存整章原文
- 必须保留章节与版本来源
- 长内容只存概述与定位信息

---

### 2.7 Question｜问题

用途：网站最重要的用户探索钩子。

字段：

- `id`
- `slug`
- `title`
- `short_summary`
- `neutral_overview`
- `question_type`
- `importance_weight`
- `heat_weight`
- `status`

关联：

- `character_ids[]`
- `event_ids[]`
- `chapter_ids[]`
- `location_ids[]`
- `viewpoint_ids[]`
- `evidence_ids[]`

---

### 2.8 Viewpoint / Claim｜观点 / 主张

用途：支持“不同解释并存”。

字段：

- `id`
- `question_id`
- `title`
- `summary`
- `argument_body`
- `stance_type`
- `fact_type`
- `confidence`
- `source_ids[]`
- `status`

`fact_type` 必须使用：

- `canonical_text_fact`
- `text_inference`
- `scholarly_viewpoint`
- `adaptation_only`
- `disputed_version`

---

### 2.9 QuestionEvidenceLink｜问题—证据关系

字段：

- `id`
- `question_id`
- `viewpoint_id`
- `evidence_id`
- `relation_type`：support / weaken / contextual / neutral
- `weight`
- `note`

---

### 2.10 Location｜地点

用途：首页大观园、人物居所、事件空间。

字段：

- `id`
- `slug`
- `name`
- `location_type`
- `short_intro`
- `parent_location_id`
- `map_x`
- `map_y`
- `asset_key`
- `status`

示例：

- 大观园
- 潇湘馆
- 怡红院
- 蘅芜苑
- 栊翠庵
- 稻香村
- 荣国府
- 宁国府

---

### 2.11 Poem / LiteraryWork｜诗词曲文

字段：

- `id`
- `title`
- `work_type`
- `author_character_id`
- `chapter_id`
- `summary`
- `quote_short`
- `symbolic_notes`
- `source_id`
- `status`

---

### 2.12 Discussion / Post｜讨论

首期只需定义接口，不必优先开发完整社区。

字段：

- `id`
- `author_user_id`
- `target_type`
- `target_id`
- `title`
- `body`
- `parent_post_id`
- `status`
- `created_at`

---

### 2.13 Source / Citation｜来源

字段：

- `id`
- `source_type`
- `title`
- `author`
- `publisher`
- `year`
- `edition`
- `url`
- `notes`
- `credibility_level`
- `status`

来源类型：

- original_text
- academic_book
- academic_paper
- annotated_edition
- redology_monograph
- interview
- reputable_article
- adaptation
- community_post

---

## 3. 关键关系图

必须支持以下关系：

- Character ↔ Character
- Character ↔ Event
- Event ↔ Chapter
- Character ↔ Chapter
- Character ↔ Location
- Character ↔ Poem/LiteraryWork
- Question ↔ Character
- Question ↔ Event
- Question ↔ Chapter
- Question ↔ Location
- Viewpoint ↔ Question
- Evidence ↔ Viewpoint
- Evidence ↔ Question
- Evidence ↔ Chapter
- Discussion ↔ Question / Character / Event

所有“关系”“观点”“争议”都应尽可能回溯到原文或可靠来源。

---

## 4. 首期人物范围

### 4.1 Must-have｜金陵十二钗正册

1. 林黛玉
2. 薛宝钗
3. 贾元春
4. 贾探春
5. 史湘云
6. 妙玉
7. 贾迎春
8. 贾惜春
9. 王熙凤
10. 贾巧姐
11. 李纨
12. 秦可卿

### 4.2 Must-have｜高关联核心人物

- 贾宝玉
- 贾母
- 贾政
- 王夫人
- 赵姨娘
- 贾环
- 薛姨妈
- 薛蟠
- 贾琏
- 平儿
- 刘姥姥
- 紫鹃
- 雪雁
- 袭人
- 晴雯
- 麝月
- 鸳鸯
- 金钏
- 香菱
- 尤氏
- 贾珍
- 贾蓉
- 贾赦
- 邢夫人
- 秦业
- 秦钟

### 4.3 Recommended｜首期建议加入

- 孙绍祖
- 司棋
- 入画
- 侍书
- 邢岫烟
- 焦大
- 周瑞家的
- 彩云
- 小红
- 贾芸
- 蒋玉菡
- 柳湘莲
- 尤二姐
- 尤三姐

### 4.4 Phase-2｜第二批

- 夏金桂
- 宝蟾
- 王子腾
- 林如海
- 贾敏
- 贾雨村
- 甄士隐
- 甄英莲相关扩展
- 史家主要人物
- 宫廷系统抽象实体
- 其他大观园丫鬟、婆子、清客与旁支人物

原则：没有明确姓名或文本依据的角色，不得自行“补全”。

---

## 5. 每个人物最低内容标准

### 核心人物最低标准

- 基本身份
- 别名 / 称谓
- 首次出场章节
- 80–150 字快速认识
- 3–8 个关键词
- 5–10 个首批时间线节点
- 5+ 条重要关系
- 3+ 个关键事件
- 3+ 个相关章节
- 3+ 条短原文证据
- 3+ 个相关问题
- 有争议时至少 2 个观点
- asset path/key

注意：以上仅为“建档最低线”，不是最终深度。核心人物的正式完成标准见 `CONTENT_DEPTH_STANDARD.md`。

---

## 6. 首期问题库｜至少 30 个 Seed Questions

1. 宝钗到底爱不爱宝玉？
2. 贾母究竟支持宝黛还是金玉？
3. 王夫人为什么赶走晴雯？
4. 黛玉为什么葬花？
5. 晴雯是不是黛玉的“影子”？
6. 黛玉真的“小性儿”吗？
7. 宝玉和黛玉的爱情从什么时候真正成立？
8. 黛玉是否早就意识到了“金玉良缘”？
9. 宝钗为什么总劝宝玉读仕途经济之书？
10. 宝钗的“冷”究竟是性格还是处世方式？
11. 探春为什么对赵姨娘如此克制甚至疏离？
12. 探春理家真正改变了什么？
13. 探春为什么想改革贾府？
14. 王熙凤到底是怎样的人：能干、狠毒还是制度中的执行者？
15. 王熙凤为什么会走向失势？
16. 王熙凤对平儿到底是什么感情？
17. 刘姥姥为什么是理解贾府兴衰的重要人物？
18. 秦可卿的身份为什么长期存在争议？
19. 秦可卿之死为什么如此特殊？
20. 妙玉为什么“世难容”？
21. 妙玉对宝玉的态度应该怎样理解？
22. 史湘云的结局为什么有不同推测？
23. 史湘云与黛玉、宝钗的关系到底怎样？
24. 元春省亲为什么既荣耀又悲凉？
25. 元春在贾府兴衰中到底意味着什么？
26. 迎春为什么会成为贾府婚姻制度的牺牲者？
27. 惜春为什么最终走向出家？
28. 李纨的“槁木死灰”该怎样理解？
29. 巧姐判词与刘姥姥之间有什么关系？
30. 抄检大观园真正暴露了贾府什么问题？
31. 袭人与晴雯为什么经常被放在一起比较？
32. 王夫人为什么更信任袭人而不是晴雯？
33. 宝玉到底厌恶“仕途经济”到什么程度？
34. “木石前盟”和“金玉良缘”分别代表什么？
35. 后四十回对十二钗命运的处理有哪些争议？
36. 判词应该被理解为“剧透”还是象征系统？
37. 大观园为什么不仅是空间，也是人物命运结构？
38. 贾府衰败是从什么时候真正开始的？
39. 贾母到底看不看得出宝黛感情？
40. 红楼人物的“命运”到底是制度造成的，还是性格造成的？

---

## 7. 首期关键事件｜至少 25 个 Seed Events

1. 林黛玉进贾府
2. 宝黛初见
3. 宝玉摔玉
4. 宝黛共读《西厢记》
5. 黛玉葬花
6. 宝玉挨打
7. 黛玉题帕
8. 宝钗扑蝶
9. 元春省亲
10. 大观园题咏
11. 海棠诗社成立
12. 菊花诗会
13. 刘姥姥二进荣国府 / 游大观园
14. 王熙凤协理宁国府
15. 秦可卿之死
16. 秦可卿丧仪
17. 探春理家
18. 探春处理赵姨娘相关事务
19. 抄检大观园
20. 晴雯被逐
21. 晴雯之死
22. 金钏之死
23. 尤二姐事件
24. 迎春出嫁
25. 妙玉品茶
26. 宝玉探访栊翠庵相关情节
27. 香菱学诗
28. 司棋事件
29. 惜春与入画相关事件
30. 贾府经济与内部秩序加速恶化的关键节点

执行时必须给每个事件绑定：
- 涉及人物
- 相关章节
- 地点
- 原文证据
- 相关问题

---

## 8. 数据质量与事实分层

所有内容必须带以下之一：

### `canonical_text_fact`
原著明确写出的事实。

### `text_inference`
根据原文做出的推断。

### `scholarly_viewpoint`
红学研究、学者、注本中的解释。

### `adaptation_only`
影视剧、舞台剧等改编设定。

### `disputed_version`
版本差异、后四十回争议、脂评系统等存在争议的内容。

规则：

- 不允许把 `text_inference` 写成 `canonical_text_fact`
- 不允许把影视剧设定混入原著事实
- 观点并存，不强行给唯一答案
- 来源不足时使用 `unresolved`
- OpenCode 不得凭语言模型常识“补齐”不确定事实

---

## 9. 内容来源与版权策略

### 原著
保存：
- 章节号
- 短摘录
- 上下文概述
- 版本来源

不保存：
- 大段整章原文
- 无版本说明的长引用

### 红学 / 研究内容
保存：
- 书名/论文名
- 作者
- 出版/发表信息
- 年份
- 摘要
- 观点对应关系

原则：
- 学术来源、权威注本优先
- 二手文章只能作为线索，不作为唯一事实来源
- 来源无法核验 → draft

---

## 10. OpenCode 执行 Phase

### Phase 1｜建骨架
目标：
- 完成 schema
- 金陵十二钗
- 10–15 个核心关联人物
- 10 个问题
- 10 个事件
- 基础关系网

### Phase 2｜扩充首期内容
目标：
- 首期人物全部建档
- 30+ 问题
- 25+ 事件
- 人物关系网
- 地点与章节关联

### Phase 3｜深度内容
目标：
- 原文证据补齐
- Viewpoint / Claim
- 研究来源
- 版本争议
- 搜索索引
- API

### Phase 4｜社区
目标：
- Discussion/Post
- 用户观点
- 评论
- 投票
- 收藏

---

## 11. 给 Codex 的前端接口约束

OpenCode 数据层必须提供稳定 DTO / JSON，至少包括：

### CharacterDetail
- basic_info
- portrait_asset
- keywords
- timeline
- relationships
- key_events
- related_questions
- chapters
- evidence
- viewpoints

### QuestionDetail
- title
- neutral_overview
- related_characters
- related_events
- related_chapters
- viewpoints
- evidence
- discussions

### HomepageExploreCard
- type
- title
- subtitle
- target_slug
- related_character_asset
- heat

### RelationshipGraphNode
- id
- name
- asset_key
- importance

### RelationshipGraphEdge
- from
- to
- type
- summary
- evidence_count

### EventTimelineItem
- title
- summary
- chapter_ref
- related_characters
- location

OpenCode 不得修改 Codex 负责的视觉 / 动画 / 样式文件。

---

## 12. Coverage Report｜每 Phase 必须输出

每阶段完成时，生成覆盖报告：

- 人物总数
- L1 / L2 / L3 人物数
- 事件数
- 问题数
- 关系数
- 章节关联数
- 原文证据数
- Viewpoint 数
- 有 citation 的比例
- 缺失 citation 数
- unresolved 条目数
- 下一阶段缺口

---

# OpenCode 可直接执行 Checklist

- [ ] 创建核心 schema
- [ ] 建立 fact_type 枚举
- [ ] 建立 Source/Citation 模型
- [ ] 建立金陵十二钗人物档案
- [ ] 建立高关联核心人物档案
- [ ] 建立 CharacterRelationship 图谱
- [ ] 建立首批 10 个事件
- [ ] 建立首批 10 个问题
- [ ] 将问题关联到人物/事件/章节
- [ ] 将观点关联到问题
- [ ] 将原文证据关联到观点
- [ ] 建立 Location / 大观园地点
- [ ] 建立 Poem/LiteraryWork
- [ ] 扩充至 30+ 问题
- [ ] 扩充至 25+ 事件
- [ ] 为核心人物升级 L2
- [ ] 输出 Coverage Report
- [ ] 提供 CharacterDetail API/DTO
- [ ] 提供 QuestionDetail API/DTO
- [ ] 提供 RelationshipGraph API/DTO
- [ ] 不修改 Codex UI / animation / style
