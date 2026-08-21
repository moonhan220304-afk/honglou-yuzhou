# 03 — JSON 字段 / API 模板（四个核心实体）

> 以下 JSON 模板的字段键名已与工程侧 `lib/types.ts` 锁定，**不可增删改键名**。
> 标注 `?` 表示可选字段。

---

## 3.1 character（人物）

```json
{
  "id": "character_lin_daiyu",
  "name": "林黛玉",
  "aliases": ["颦颦", "颦儿", "潇湘妃子", "绛珠仙子", "林妹妹", "玉儿"],
  "category": "金陵十二钗正册",
  "identity": {
    "family": "贾母之外孙女；贾敏与林如海之女",
    "position": "贾府寄居之表小姐",
    "origin": "姑苏（今苏州），生于扬州",
    "generation": "贾府第四代（与贾宝玉同辈）"
  },
  "tags": ["才情", "多愁善感", "孤高清傲", "敏感", "诗才冠绝", "病弱"],
  "summary": {
    "short": "金陵十二钗之首。贾母外孙女，才情冠绝大观园，与贾宝玉生死相恋。",
    "long": "林黛玉，前身为太虚幻境绛珠仙草……（详述）"
  },
  "personality_analysis": [
    {
      "dimension": "才情与诗意",
      "description": "诗才为全书之冠，以《葬花吟》《秋窗风雨夕》《桃花行》等不朽诗篇体现其才思与对命运的深刻感知。",
      "evidence_events": ["event_bury_flowers_ch27", "event_autumn_poem_ch45", "event_peach_poem_ch70"]
    },
    {
      "dimension": "孤高敏感",
      "description": "因寄人篱下而敏感多疑，对周遭人事高度警觉，常以刻薄之语自护。",
      "evidence_events": ["event_send_flowers_ch7", "event_bite_purse_ch18"]
    }
  ],
  "timeline": [
    { "order": 1, "event_id": "event_daiyu_enters_jia", "title": "黛玉进贾府" },
    { "order": 2, "event_id": "event_read_west_chamber", "title": "共读西厢" }
  ],
  "related_characters": [],
  "sources": [
    {
      "source_id": "source_ch03_daiyu_appearance",
      "quote": "两弯似蹙非蹙笼烟眉，一双似喜非喜含露目。态生两靥之愁，娇袭一身之病。",
      "note": "第三回黛玉初入贾府，宝玉眼中所见。"
    }
  ],
  "status": {
    "review": "verified",
    "confidence": 100,
    "verified_by": "redmansion-kb-v1",
    "updated_at": "2026-08-10T00:00:00Z",
    "embedding_status": "pending"
  }
}
```

---

## 3.2 event（事件）

```json
{
  "id": "event_bury_flowers_ch27",
  "title": "黛玉葬花",
  "event_level": "major",
  "chapter": {
    "number": 27,
    "title": "滴翠亭杨妃戏彩蝶 埋香冢飞燕泣残红",
    "attribution": "caoxueqin"
  },
  "location": {
    "name": "大观园花冢",
    "specific": "沁芳闸桥边，葬桃花的去处。"
  },
  "summary": {
    "short": "芒种节黛玉独自葬花，吟《葬花吟》，以花自喻，悲叹命运。",
    "meaning": [
      "以葬花象征薄命红颜的命运悲剧",
      "「质本洁来还洁去」表达对纯洁人格的坚守",
      "为全书黛玉命运的纲领性诗篇"
    ]
  },
  "participants": [
    { "character_id": "character_lin_daiyu", "role": "主角（葬花人）" },
    { "character_id": "character_jia_baoyu", "role": "旁听者（花冢山坡后偷听，听后恸倒）" }
  ],
  "evidence": [
    {
      "source_id": "source_ch27_zanghua_yin",
      "quote": "花谢花飞飞满天，红消香断有谁怜？……侬今葬花人笑痴，他年葬侬知是谁？试看春残花渐落，便是红颜老死时。一朝春尽红颜老，花落人亡两不知！",
      "note": "《葬花吟》全诗见第二十七回。此选段涵盖全诗首尾核心意象。"
    }
  ],
  "interpretations": [
    {
      "type": "literary",
      "title": "黛玉命运纲领",
      "content": "《葬花吟》不仅是黛玉的自我悲叹，更是全书「千红一哭，万艳同悲」的缩影，预示大观园群芳的凋零命运。"
    }
  ],
  "related_events": ["event_read_west_chamber", "event_flower_god_festival"],
  "status": {
    "review": "verified",
    "confidence": 100,
    "verified_by": "redmansion-kb-v1",
    "updated_at": "2026-08-10T00:00:00Z",
    "embedding_status": "pending"
  }
}
```

---

## 3.3 relationship（关系）

```json
{
  "id": "relationship_lin_daiyu_jia_baoyu",
  "from": "character_lin_daiyu",
  "to": "character_jia_baoyu",
  "type": "表兄妹 / 情人 / 知己",
  "nature": ["kinship", "romantic"],
  "direction": "mutual",
  "summary": "《红楼梦》核心爱情线。前世绛珠仙草与神瑛侍者，今生青梅竹马、灵魂知己，最终以黛死宝娶的悲剧收场。",
  "stages": [
    {
      "stage": 1,
      "title": "初遇——似曾相识",
      "chapter": 3,
      "description": "黛玉初进贾府，宝玉一见便道「这个妹妹我曾见过的」，二人一见面便有一种超越凡俗的熟悉感。"
    },
    {
      "stage": 2,
      "title": "共读西厢——心心相印",
      "chapter": 23,
      "description": "三月中，桃花树下共读《会真记》（《西厢记》），宝玉以书中词句试探黛玉，二人在文学中找到精神共鸣。"
    },
    {
      "stage": 3,
      "title": "葬花听吟——灵魂震颤",
      "chapter": 27,
      "description": "宝玉在山坡后偷听黛玉葬花吟，闻「一朝春尽红颜老，花落人亡两不知」而恸倒山坡，感同身受。"
    },
    {
      "stage": 4,
      "title": "诉肺腑——情定今生",
      "chapter": 32,
      "description": "宝玉对黛玉说出「你放心」三字，黛玉如轰雷掣电，二人终于确认彼此心意。黛玉走后，宝玉误将袭人当作黛玉说出心底话，彻底暴露其真情。"
    },
    {
      "stage": 5,
      "title": "紫鹃试玉——生死以之",
      "chapter": 57,
      "description": "紫鹃以林妹妹回苏州试探宝玉，宝玉痴病发作、死去活来，以命相证对黛玉的执着。"
    },
    {
      "stage": 6,
      "title": "通灵失玉——命运转折",
      "chapter": 94,
      "description": "宝玉通灵宝玉丢失，从此精神恍惚，为后续掉包计埋下伏笔。",
      "note": "后四十回，attribution=gaoe"
    },
    {
      "stage": 7,
      "title": "黛死钗嫁——阴阳永隔",
      "chapter": 97,
      "description": "王熙凤设掉包计，黛玉焚稿断痴情，泪尽而逝；宝玉在不知情中与宝钗成婚。",
      "note": "后四十回，attribution=gaoe"
    }
  ],
  "evidence_events": [
    { "event_id": "event_first_meet_ch3", "description": "宝黛初会" },
    { "event_id": "event_read_west_chamber", "description": "共读西厢" },
    { "event_id": "event_bury_flowers_ch27", "description": "黛玉葬花、宝玉听吟" },
    { "event_id": "event_heartfelt_words_ch32", "description": "诉肺腑" }
  ],
  "impact": "宝黛爱情是全书主线之一，象征理想与现实的冲突，也是「千红一哭」的最集中体现。",
  "status": {
    "review": "verified",
    "confidence": 100,
    "verified_by": "redmansion-kb-v1",
    "updated_at": "2026-08-10T00:00:00Z",
    "embedding_status": "pending"
  }
}
```

---

## 3.4 source（证据来源）

```json
{
  "id": "source_ch27_zanghua_yin",
  "type": "original_text",
  "title": "《红楼梦》第二十七回——葬花吟全文",
  "chapter_number": 27,
  "description": "第二十七回「埋香冢飞燕泣残红」中林黛玉所吟《葬花吟》，全书最著名的诗作之一。",
  "author": null,
  "year": null,
  "authority": "通行本原文（程乙本为底本）",
  "controversial": false,
  "verification": "已与通行本逐字核对，原文无误。",
  "status": {
    "review": "verified",
    "confidence": 100,
    "updated_at": "2026-08-10T00:00:00Z"
  }
}
```

---

## 3.5 viewpoint（观点）

```json
{
  "id": "viewpoint_chai_dai_heyi",
  "title": "钗黛合一论",
  "type": "disputed",
  "author": "俞平伯（首倡）；脂砚斋（批语先行）",
  "year": 1923,
  "source_title": "《红楼梦辨》（俞平伯，1923）；《红楼梦研究》（1952修订）",
  "description": "脂砚斋第四十二回总批云：「钗、玉名虽两个，人却一身，此幻笔也。」俞平伯发挥此说，认为曹雪芹将宝钗与黛玉设计为「兼美」的一体两面——宝钗代表现实之美，黛玉代表理想之美，二人合而为一才是完整人格。",
  "related_event_ids": ["event_chai_dai_reconcile_ch42", "event_chai_dai_golden_words_ch45"],
  "opinions": [
    {
      "side": "支持者",
      "content": "第五回警幻仙子之妹「兼美」兼具钗黛之美，是二人合一的直接证据；第四十二回钗黛冰释前嫌后关系融洽，体现作者设计的合一意图。",
      "proponent": "俞平伯、部分脂批研究者"
    },
    {
      "side": "反对者",
      "content": "钗黛性格差异巨大，分别代表了不同的人生选择与价值观，二人从未真正「合一」，仅有阶段性和解。将二人合一弱化了人物形象的独立性。",
      "proponent": "正统马克思主义红学者、部分文学评论家"
    }
  ],
  "status": {
    "review": "verified",
    "confidence": 95,
    "verified_by": "redmansion-kb-v1",
    "updated_at": "2026-08-10T00:00:00Z"
  }
}
```
