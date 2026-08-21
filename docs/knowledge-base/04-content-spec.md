# 04 — 内容规范（Content Specification）

> 本文档为《红楼知识宇宙》Knowledge Base 的数据内容规范，所有数据录入必须遵守。

---

## 1. 事件粒度判定规则

| 层级 | 枚举值 | 定义 | 示例 | 判别标准 |
|------|--------|------|------|----------|
| **关键事件** | `major` | 对人物命运/情节走向产生转折性影响，通常有经典回目对应，被红学广泛讨论。 | 黛玉葬花（第27回）、元妃省亲（第18回）、宝玉挨打（第33回）、抄检大观园（第74回）、黛玉焚稿（第97回） | 1) 回目直接点名；2) 红学论文高频引用；3) 对人物命运有决定性影响。 |
| **一般事件** | `minor` | 推进日常情节的典型场景，不直接决定命运，但对人物刻画有重要意义。 | 芒种节饯花神（第27回）、宝钗扑蝶（第27回）、宝玉给麝月梳头（第20回）、香菱学诗（第48回） | 1) 发生在某回之中（非封面事件）；2) 有一定叙事篇幅；3) 对人物性格/关系有揭示。 |
| **微事件** | `micro` | 一句话或一小段中的人物心理变化、对话细节、小动作等，不足以构成独立场景但仍有关键信息。 | 一句心理变化（如"黛玉听了，不觉又喜又惊"）、一次眼神交流、一个细微动作描写。 | 1) 叙事篇幅极小；2) 可从属于 larger 事件中；3) 对深层理解人物有提示价值。 |

**判定流程**：
1. 先看回目名是否直接涉及 → 是则至少 `minor`，大概率 `major`
2. 看是否改变了至少一个人物的命运走向 → 是则为 `major`
3. 看是否有独立场景描写（>1 段） → 是则为 `minor`
4. 仅一句或一段中的细节 → `micro`

---

## 2. 关系 ID 命名与排序约定

### ID 命名规则
```
格式：relationship_{A}_{B}
规则：A 为全书核心度更高的人物，B 为次要人物。
```

### 核心度排序（从高到低）
```
第一梯队：贾宝玉 > 林黛玉 > 薛宝钗
第二梯队：贾母 > 王夫人 > 王熙凤 > 贾政
第三梯队：贾探春 > 史湘云 > 贾元春 > 妙玉 > 贾迎春 > 贾惜春 > 李纨 > 秦可卿 > 贾巧姐
第四梯队：袭人 > 晴雯 > 紫鹃 > 平儿 > 鸳鸯 > 贾琏 > 薛姨妈 > 刘姥姥 > 麝月 > 尤氏
```

**示例**：
- `relationship_lin_daiyu_zijuan`（黛玉在前，紫鹃在后）
- `relationship_jia_baoyu_xiren`（宝玉在前，袭人在后）
- `relationship_wang_xifeng_ping_er`（王熙凤在前，平儿在后）

### 关系 ID 生成函数逻辑（供工程侧参考）
```python
def generate_relationship_id(char_a, char_b):
    core_order = [
        "jia_baoyu", "lin_daiyu", "xue_baochai", "jia_mu", "wang_furen",
        "wang_xifeng", "jia_zheng", "jia_tanchun", "shi_xiangyun", "jia_yuanchun",
        "miao_yu", "jia_yingchun", "jia_xichun", "li_wan", "qin_keqing",
        "jia_qiaojie", "xiren", "qingwen", "zijuan", "ping_er",
        "yuanyang", "jia_lian", "xue_yima", "liu_laolao", "sheyue", "you_shi"
    ]
    rank_a = core_order.index(char_a) if char_a in core_order else 999
    rank_b = core_order.index(char_b) if char_b in core_order else 999
    if rank_a <= rank_b:
        return f"relationship_{char_a}_{char_b}"
    else:
        return f"relationship_{char_b}_{char_a}"
```

---

## 3. 关系本质 (`nature`) 枚举

| 枚举值 | 含义 | 示例 |
|--------|------|------|
| `kinship` | 血缘/姻亲关系 | 贾宝玉—贾母（祖孙）、贾琏—王熙凤（夫妻） |
| `romantic` | 情爱关系 | 贾宝玉—林黛玉（恋人）、贾宝玉—薛宝钗（夫妻） |
| `friendship` | 友谊/知己 | 林黛玉—薛宝钗（金兰契，第四十五回后） |
| `master_servant` | 主仆关系 | 贾宝玉—袭人、林黛玉—紫鹃 |
| `political` | 利益/政治联盟 | 贾府—薛府（四大家族联姻）、王熙凤—贾琏（也含政治成分） |
| `rivalry` | 竞争/敌对 | 林黛玉—薛宝钗（前期情敌，可复合标签 friendship） |
| `mentorship` | 师徒/教导 | 林黛玉—香菱（教诗）、贾雨村—林黛玉（西席） |
| `ambiguous` | 模糊/多义 | 贾宝玉—秦可卿（梦中情与伦理交叠） |

**说明**：一条关系可同时有多个 `nature` 标签。如宝黛关系 = `["kinship", "romantic"]`。

---

## 4. 标签 (`tags`) 规范

### 人物标签类别

| 类别 | 示例标签值 |
|------|-----------|
| **性格** | 多愁善感、豁达开朗、孤高、温婉、精明强干、懦弱、刚烈 |
| **才艺** | 诗才冠绝、善画、善弈、精音律、博学 |
| **外貌** | 病态美、丰腴美、英气、清俊 |
| **身份** | 寄居、当家奶奶、庶出、丫鬟、管家 |
| **命运** | 早夭、出家、远嫁、寡居 |

### 标签规则
1. 每个 tag 为 2-6 字精简中文短语
2. 每人至少 3 个标签，最多 10 个
3. 避免同义重复（如同时标"多愁善感"和"多愁"不可）
4. 优先级：性格 > 才艺 > 身份 > 命运 > 外貌

---

## 5. 来源引用规范

### 原文引用 (`original_text`) 规则
1. 每条引文必须标注回数
2. 引文文字以通行本（人民文学出版社程乙本校注本）为准
3. 如果不同版本有差异，以注释说明
4. 原文引文「宁可短不可错」
5. 引用诗句/对联时标注是否为回前诗/回中诗/回末诗

### 脂批引用 (`zhi_ping`) 规则
1. 标注批语类型：眉批/夹批/回前批/回末批
2. 标注所据版本：甲戌本/庚辰本/戚序本 等
3. 标注批语关联的原文

### 红学论文 (`hongxue_paper`) 规则
1. 必须填写 `author`（作者）和 `year`（年份）
2. `description` 中简述核心论点
3. 标注 `controversial = true` 如果该论文观点有重大争议

---

## 6. 前后八十回区分标注

### 强制规则
1. 所有数据中涉及后四十回（第 81-120 回）的内容，必须显式标注 `attribution: gaoe`
2. `chapter` 表中，前 80 回为 `caoxueqin`，后 40 回为 `gaoe`
3. `event` 的 `chapter.attribution` 和 `source.chapter_number` 对应章节的 attribution 必须一致
4. 凡是后四十回的事件/引文，在 `evidence.note` 中必须附加 `[后四十回]` 标注
5. 争议性后四十回内容（如黛玉焚稿、掉包计等）在 `source.controversial` 中标记为 `true`

### 标注示例
```json
{
  "chapter": { "number": 97, "title": "林黛玉焚稿断痴情 薛宝钗出闺成大礼", "attribution": "gaoe" },
  "evidence": [{
    "source_id": "source_ch97_fen_gao",
    "quote": "黛玉……狠命撕那绢子……撂在火上……",
    "note": "[后四十回] 黛玉焚稿情节，高鹗续书所写。此情节对黛玉结局的刻画与曹雪芹原意可能有异，红学界对后四十回归属存在争议。"
  }]
}
```

---

## 7. 人物身份 (`identity`) 字段规范

| 字段 | 说明 | 示例 |
|------|------|------|
| `family` | 家族关系（主要亲属） | "贾母之外孙女；贾敏与林如海之女" |
| `position` | 在贾府中的身份地位 | "贾府寄居之表小姐" |
| `origin` | 籍贯/出生地 | "姑苏（今苏州），生于扬州" |
| `generation` | 世代（便于排辈） | "贾府第四代" |

---

## 8. 关系阶段 (`stages`) 规范

1. 每个阶段必须有 `stage`（序号）、`title`（标题）、`chapter`（起始回次）
2. 阶段标题精简（4-10 字）
3. 阶段描述说明该阶段关系特征和标志性事件
4. 核心关系（宝黛、宝钗-宝玉、钗黛等）必须有完整 stages
5. 后四十回阶段须标 `note: "后四十回，attribution=gaoe"`

---

## 9. 审核字段规范

| 字段 | 说明 |
|------|------|
| `status.review` | `draft` → 草稿 / `pending` → 待审 / `verified` → 已验证 |
| `status.confidence` | AI 置信度 0-100，基于引文可得性和事实普适性 |
| `status.verified_by` | 标识验证者（如 "redmansion-kb-v1"） |
| `status.embedding_status` | `pending` → 待向量化 / `indexed` → 已索引 / `failed` → 失败 |

---

## 10. 时间线 (`timeline` / `order`) 规范

1. 所有事件按书中叙事顺序排列（`order` 字段为递增整数），不使用公历日期
2. `event.order` 为全局事件序号
3. `character.timeline` 为该人物专属事件时间线，其中 `order` 为该人物的局部序号
4. 同一回内多个事件的顺序按原文出现先后排列

---

## 11. 数据库 ID 命名空间约定

| 表 | ID 前缀 | 示例 |
|----|---------|------|
| character | `character_` | `character_lin_daiyu` |
| event | `event_` | `event_bury_flowers_ch27` |
| relationship | `relationship_` | `relationship_lin_daiyu_jia_baoyu` |
| source | `source_` | `source_ch27_zanghua_yin` |
| viewpoint | `viewpoint_` | `viewpoint_chai_dai_heyi` |
| chapter | 仅用数字 | `27` |

ID 命名原则：英文 snake_case，简洁可读，避免拼音混用。
