import type { Relationship, Poem, CommunityPost } from "@/lib/types";

const v = (confidence = 100) => ({
  review: "verified" as const,
  confidence,
  verified_by: "redmansion-kb-v1",
  updated_at: "2026-08-10T00:00:00Z",
  embedding_status: "pending" as const,
});

export const relationships: Record<string, Relationship> = {
  relationship_lin_daiyu_jia_baoyu: {
    id: "relationship_lin_daiyu_jia_baoyu",
    from: "character_lin_daiyu",
    to: "character_jia_baoyu",
    type: "表兄妹 / 情人 / 知己",
    nature: ["kinship", "romantic"],
    direction: "mutual",
    summary:
      "全书最核心爱情线。前世绛珠仙草与神瑛侍者的还泪之约，今生青梅竹马、灵魂知己，最终以泪尽焚稿、黛死宝娶的悲剧收场。",
    stages: [
      {
        stage: 1,
        title: "初遇——似曾相识",
        chapter: 3,
        description:
          "黛玉初进荣国府，宝玉一见便道「这个妹妹我曾见过的」，「今日只作远别重逢」。宝玉问黛玉「可也有玉没有」，闻之无玉即摔通灵宝玉。",
      },
      {
        stage: 2,
        title: "青梅竹马——两小无猜",
        chapter: 5,
        description:
          "贾母安排二人同住碧纱橱内外，「日则同行同坐，夜则同止同息」。",
      },
      {
        stage: 3,
        title: "共读西厢——心心相印",
        chapter: 23,
        description:
          "桃花树下共读《会真记》（《西厢记》）。宝玉以「你就是那倾国倾城貌，我就是那多愁多病身」试探黛玉，二人在禁书中找到精神共鸣。",
      },
      {
        stage: 4,
        title: "葬花听吟——灵魂震颤",
        chapter: 27,
        description:
          "宝玉在山坡后偷听黛玉葬花吟，闻「花落人亡两不知」而恸倒山坡。二人互不知情，却完成最深的精神共振。",
      },
      {
        stage: 5,
        title: "诉肺腑——情定今生",
        chapter: 32,
        description:
          "宝玉对黛玉说出「你放心」三字，黛玉「如轰雷掣电」。黛玉走后，宝玉误将袭人当作黛玉说出「睡里梦里也忘不了你」。二人终于确认彼此心意。",
      },
      {
        stage: 6,
        title: "赠帕题诗——以心传心",
        chapter: 34,
        description:
          "宝玉挨打后，遣晴雯送两条旧手帕给黛玉。黛玉思忖大悟，提笔写下三首题帕诗，情感至深至痛。",
      },
      {
        stage: 7,
        title: "紫鹃试玉——生死以之",
        chapter: 57,
        description:
          "紫鹃以「林妹妹回苏州」试探宝玉，宝玉痴病发作、死去活来，以生命证明了对黛玉的执着。",
      },
      {
        stage: 8,
        title: "通灵失玉——命运转折",
        chapter: 94,
        description:
          "宝玉通灵宝玉丢失，从此精神恍惚、失魂落魄，为后续掉包计埋下伏笔。",
        note: "后四十回，attribution=gaoe",
      },
      {
        stage: 9,
        title: "黛死钗嫁——阴阳永隔",
        chapter: 97,
        description:
          "王熙凤设掉包计：对宝玉伪称娶林妹妹，实则娶宝钗。黛玉从傻大姐口中得知消息，一病不起，焚旧帕诗稿，泪尽而逝。",
        note: "后四十回，attribution=gaoe。红学界对掉包计是否为曹雪芹原意存在重大争议。",
      },
    ],
    evidence_events: [
      { event_id: "event_daiyu_enters_jia", description: "宝黛初会——摔玉认旧" },
      { event_id: "event_read_west_chamber", description: "共读西厢——精神共鸣" },
      { event_id: "event_bury_flowers_ch27", description: "葬花吟——灵魂共振" },
      { event_id: "event_heartfelt_words_ch32", description: "诉肺腑——情定今生" },
      { event_id: "event_gift_handkerchief_ch34", description: "赠帕题诗——以心传心" },
      { event_id: "event_zijuan_tests_yu_ch57", description: "紫鹃试玉——生死以之" },
    ],
    impact:
      "宝黛爱情是全书最核心的情感线索。前世今生的双重设定赋予了这一爱情悲剧超越世俗的神话维度。二人的悲剧既是个人性格的悲剧，更是封建婚姻制度的必然结果——代表理想与现实的永恒冲突。",
    status: v(),
  },

  relationship_jia_baoyu_xue_baochai: {
    id: "relationship_jia_baoyu_xue_baochai",
    from: "character_jia_baoyu",
    to: "character_xue_baochai",
    type: "表亲 / 夫妻",
    nature: ["kinship", "romantic", "political"],
    direction: "mutual",
    summary:
      "以「金玉良缘」为名的姻缘，是家族意志的产物。宝玉心中始终以「木石前盟」为先，纵然齐眉举案，到底意难平。",
    stages: [
      {
        stage: 1,
        title: "金玉之说",
        chapter: 8,
        description:
          "宝钗金锁与宝玉通灵宝玉的「金玉」之说在贾府流传，黛玉闻之半含酸。",
      },
      {
        stage: 2,
        title: "出闺成大礼",
        chapter: 97,
        description:
          "在黛玉病危之际，宝玉与宝钗成婚——掉包计下宝玉以为娶的是黛玉（后四十回续书情节）。",
        note: "后四十回，attribution=gaoe",
      },
    ],
    evidence_events: [
      { event_id: "event_baoyu_marriage_ch97", description: "出闺成大礼" },
    ],
    impact:
      "金玉姻缘是宝黛悲剧的直接推力，也是「家族意志压倒个人情感」的集中体现。",
    status: v(),
  },

  relationship_lin_daiyu_xue_baochai: {
    id: "relationship_lin_daiyu_xue_baochai",
    from: "character_lin_daiyu",
    to: "character_xue_baochai",
    type: "表姐妹 / 知己",
    nature: ["kinship", "friendship", "rivalry"],
    direction: "mutual",
    summary:
      "钗黛是全书最著名的一组对照关系：「任是无情也动人」与「孤高自许」。后期二人冰释前嫌，金兰契互剖金兰语，情同姐妹。",
    stages: [
      {
        stage: 1,
        title: "竞争与龃龉",
        chapter: 8,
        description: "「金玉」之说流传，黛玉对宝钗心存芥蒂，时有含酸之语。",
      },
      {
        stage: 2,
        title: "兰言解疑癖",
        chapter: 42,
        description:
          "宝钗规劝黛玉少读杂书，黛玉心折其善意——脂砚斋批「钗、玉名虽两个，人却一身」。",
      },
      {
        stage: 3,
        title: "金兰契互剖金兰语",
        chapter: 45,
        description:
          "宝钗送燕窝探望黛玉，二人互诉衷肠，情同金兰，钗黛之争就此消解。",
      },
    ],
    evidence_events: [
      { event_id: "event_golden_words_ch45", description: "金兰契互剖金兰语" },
    ],
    impact:
      "钗黛对照结构承载了全书对「两种人生选择」的思考，是红学「钗黛合一」论的核心素材。",
    status: v(),
  },

  relationship_zijuan_lin_daiyu: {
    id: "relationship_zijuan_lin_daiyu",
    from: "character_zijuan",
    to: "character_lin_daiyu",
    type: "主仆 / 姐妹",
    nature: ["master_servant", "friendship"],
    direction: "one-way",
    summary:
      "紫鹃是黛玉在贾府唯一可以交心之人，以妹妹般的体贴守护黛玉，并一心为她终身打算。",
    stages: [
      {
        stage: 1,
        title: "情辞试忙玉",
        chapter: 57,
        description:
          "紫鹃以「林妹妹回苏州」试探宝玉真心，事后对黛玉说「万两黄金容易得，知心一个也难求」。",
      },
    ],
    evidence_events: [
      { event_id: "event_zijuan_tests_yu_ch57", description: "情辞试忙玉" },
    ],
    impact:
      "紫鹃的存在让黛玉的孤绝世界有了一丝暖色，也使宝黛爱情的民间推动力具象化。",
    status: v(),
  },

  relationship_jiamu_lin_daiyu: {
    id: "relationship_jiamu_lin_daiyu",
    from: "character_jiamu",
    to: "character_lin_daiyu",
    type: "祖孙",
    nature: ["kinship"],
    direction: "one-way",
    summary:
      "贾母对丧母的外孙女黛玉怜爱有加，接她进京亲自抚养，与宝玉同住碧纱橱内外，视若己出。",
    stages: [
      {
        stage: 1,
        title: "接外孙女",
        chapter: 3,
        description: "黛玉丧母，贾母派人接她进京，亲自抚养，「万般怜爱」。",
      },
    ],
    evidence_events: [
      { event_id: "event_daiyu_enters_jia", description: "黛玉进贾府" },
    ],
    impact:
      "贾母的宠爱是黛玉在贾府的立身之本；而她最终在宝黛婚姻上的沉默，也预示了黛玉依靠的脆弱性。",
    status: v(),
  },

  relationship_jia_baoyu_qingwen: {
    id: "relationship_jia_baoyu_qingwen",
    from: "character_jia_baoyu",
    to: "character_qingwen",
    type: "主仆 / 知己",
    nature: ["master_servant", "friendship"],
    direction: "one-way",
    summary:
      "宝玉待晴雯超越主仆，「撕扇子作千金一笑」可见其不摆主子架子的性情；晴雯被逐后，宝玉作《芙蓉女儿诔》以祭。",
    stages: [
      {
        stage: 1,
        title: "撕扇",
        chapter: 31,
        description: "晴雯撕扇，宝玉不仅不怒，反而称「千金难买一笑」。",
      },
    ],
    evidence_events: [],
    impact:
      "晴雯之死是抄检大观园悲剧的缩影，也是宝玉对「清白女儿」命运无力回天的第一次痛感。",
    status: v(),
  },

  relationship_wangfuren_jia_baoyu: {
    id: "relationship_wangfuren_jia_baoyu",
    from: "character_wangfuren",
    to: "character_jia_baoyu",
    type: "母子",
    nature: ["kinship"],
    direction: "one-way",
    summary:
      "王夫人爱子极深，却以功名科举为期望，母子之间的理解始终隔着一层。",
    stages: [],
    evidence_events: [],
    impact: "母子关系的隔膜是宝玉悲剧的家庭根源之一。",
    status: v(),
  },
};

export const poems: Poem[] = [
  {
    id: "poem_zanghuayin",
    title: "葬花吟（节选）",
    author_id: "character_lin_daiyu",
    chapter: 27,
    text: "花谢花飞花满天，红消香断有谁怜。\n游丝软系飘春榭，落絮轻沾扑绣帘。\n一朝春尽红颜老，花落人亡两不知。",
    interpretation:
      "《葬花吟》是黛玉悲剧意识的集中表达：以花自喻，预感到「花落人亡」的结局。脂批称此诗「是大观园诸艳之归源小引」。",
    scene: "暮春时节，黛玉肩锄葬花，落英缤纷",
  },
  {
    id: "poem_baochai_bohaitang",
    title: "咏白海棠（薛宝钗句）",
    author_id: "character_xue_baochai",
    chapter: 37,
    text: "珍重芳姿昼掩门，自携手瓮灌苔盆。\n胭脂洗出秋阶影，冰雪招来露砌魂。",
    interpretation:
      "宝钗自矜自重，以白海棠自况——「珍重芳姿」正是其人格的写照。",
    scene: "秋爽斋海棠诗社首社",
  },
  {
    id: "poem_daiyu_bohaitang",
    title: "咏白海棠（林黛玉句）",
    author_id: "character_lin_daiyu",
    chapter: 37,
    text: "半卷湘帘半掩门，碾冰为土玉为盆。\n偷来梨蕊三分白，借得梅花一缕魂。",
    interpretation:
      "黛玉写海棠如写自己：清冷、孤高，「一缕魂」直通其精神气质。",
    scene: "秋爽斋海棠诗社首社",
  },
];

export const communityPosts: CommunityPost[] = [
  {
    id: "post_001",
    title: "林黛玉的悲剧，究竟是性格使然，还是环境使然？",
    excerpt: "如果把黛玉放到现代，她的敏感与自尊还会指向同样的结局吗？",
    author: "枕上红楼",
    votes: 128,
    comments: 46,
    tag: "人物讨论",
  },
  {
    id: "post_002",
    title: "宝钗的「藏愚守拙」，是圆滑还是通透？",
    excerpt: "重读第四十二回宝钗规劝黛玉一段，忽然读懂了这个人物。",
    author: "蘅芜旧客",
    votes: 97,
    comments: 31,
    tag: "观点争鸣",
  },
  {
    id: "post_003",
    title: "如果宝玉没有丢玉，故事会怎样？",
    excerpt: "后四十回最关键的一处机关，聊聊「通灵玉」在叙事里的作用。",
    author: "怡红院看门人",
    votes: 76,
    comments: 22,
    tag: "脑洞讨论",
  },
  {
    id: "post_004",
    title: "刘姥姥进大观园，满园笑声里藏着谁的慈悲？",
    excerpt: "重读第三十九至四十二回，笑闹之间全是伏笔。",
    author: "稻香村夜话",
    votes: 64,
    comments: 18,
    tag: "人物讨论",
  },
];
