import type { Character } from "@/lib/types";

const v = (review: "draft" | "pending" | "verified" = "verified", confidence = 100) => ({
  review,
  confidence,
  verified_by: "redmansion-kb-v1",
  updated_at: "2026-08-10T00:00:00Z",
  embedding_status: "pending" as const,
});

export const characters: Record<string, Character> = {
  character_lin_daiyu: {
    id: "character_lin_daiyu",
    name: "林黛玉",
    aliases: ["颦颦", "颦儿", "潇湘妃子", "绛珠仙子", "林妹妹"],
    category: "金陵十二钗正册",
    identity: {
      family: "贾母之外孙女；父林如海（探花出身，巡盐御史），母贾敏（贾母幼女）；父母双亡，无兄弟姊妹。",
      position: "贾府寄居之表小姐；大观园潇湘馆居所。",
      origin: "姑苏（今苏州）人氏，生于扬州。",
      generation: "贾府第四代（与贾宝玉同辈）",
    },
    tags: ["才情冠绝", "多愁善感", "孤高清傲", "敏感细腻", "病态美", "诗人气质"],
    summary: {
      short: "金陵十二钗之首。贾母外孙女，前世为绛珠仙草，以泪还灌溉之恩。才华横溢、诗冠大观园，与贾宝玉知己相爱，最终泪尽而逝。",
      long: "林黛玉为《红楼梦》第一女主角。前身为西方灵河岸三生石畔绛珠仙草，受神瑛侍者（宝玉前世）甘露灌溉，修成女体后随其下凡，以一生之泪偿还灌溉之恩。父林如海为前科探花、巡盐御史，母贾敏为荣国府贾母幼女。黛玉幼年丧母、少年丧父，寄居贾府。她才情卓绝，所作《葬花吟》《秋窗风雨夕》《桃花行》等为全书最佳诗篇。性格孤高敏感，与薛宝钗构成「双峰对峙」格局。与宝玉虽为知己恋人，终因封建礼教与家族利益而不得善终——后四十回写其在宝玉与宝钗成婚之夜泪尽焚稿而亡（第97回，续书）。",
    },
    personality_analysis: [
      {
        dimension: "诗才与灵性",
        description: "诗才为全书之冠，以诗寄情、以诗言志。《葬花吟》以花喻人，表达对命运悲剧的深切感知与对纯洁的坚守。",
        evidence_events: ["event_bury_flowers_ch27", "event_golden_words_ch45"],
      },
      {
        dimension: "孤高敏感",
        description: "因寄人篱下，对周遭人事高度敏感，常以刻薄之语自护。然本性率真，一旦认人为知己，便倾心相待。",
        evidence_events: ["event_daiyu_enters_jia", "event_bury_flowers_ch27"],
      },
      {
        dimension: "叛逆精神",
        description: "不认同「女子无才便是德」和仕途经济之道，从不劝宝玉考取功名，与宝玉在精神上真正同频。",
        evidence_events: ["event_read_west_chamber", "event_heartfelt_words_ch32"],
      },
      {
        dimension: "深情执着",
        description: "对宝玉之爱纯粹而无功利，以命相许。为情生病、为情而死，是「情情」的化身。",
        evidence_events: ["event_heartfelt_words_ch32", "event_zijuan_tests_yu_ch57"],
      },
    ],
    timeline: [
      { order: 1, event_id: "event_daiyu_enters_jia", title: "黛玉进贾府（第三回）" },
      { order: 2, event_id: "event_read_west_chamber", title: "共读西厢（第二十三回）" },
      { order: 3, event_id: "event_bury_flowers_ch27", title: "葬花吟（第二十七回）" },
      { order: 4, event_id: "event_heartfelt_words_ch32", title: "诉肺腑（第三十二回）" },
      { order: 5, event_id: "event_golden_words_ch45", title: "金兰契互剖金兰语（第四十五回）" },
      { order: 6, event_id: "event_zijuan_tests_yu_ch57", title: "紫鹃试玉（第五十七回）" },
      { order: 7, event_id: "event_baoyu_marriage_ch97", title: "焚稿断痴情（第九十七回·续书）" },
    ],
    related_characters: [
      { character_id: "character_jia_baoyu", relationship_type: "情缘" },
      { character_id: "character_xue_baochai", relationship_type: "对照关系" },
      { character_id: "character_zijuan", relationship_type: "主仆知心" },
    ],
    sources: [
      {
        source_id: "source_ch02_daiyu_birth",
        quote: "今只有嫡妻贾氏，生得一女，乳名黛玉，年方五岁。",
        note: "第二回冷子兴演说荣国府，交代黛玉身世。",
      },
      {
        source_id: "source_ch03_daiyu_appearance",
        quote: "两弯似蹙非蹙罥烟眉，一双似喜非喜含情目。态生两靥之愁，娇袭一身之病。泪光点点，娇喘微微。闲静时如姣花照水，行动处似弱柳扶风。心较比干多一窍，病如西子胜三分。",
        note: "第三回黛玉初入贾府，宝玉眼中所见。",
      },
    ],
    status: v(),
  },

  character_jia_baoyu: {
    id: "character_jia_baoyu",
    name: "贾宝玉",
    aliases: ["宝二爷", "怡红公子", "绛洞花主", "痴儿"],
    category: "贾府主子",
    identity: {
      family: "贾政王夫人之子，衔玉而生；祖母为贾母。",
      position: "荣国府二公子；大观园怡红院居所。",
      origin: "金陵人氏。",
      generation: "贾府第四代",
    },
    tags: ["重情", "痴", "反叛", "通灵", "情不情"],
    summary: {
      short: "全书灵魂人物，衔玉而生，重情而反封建礼法。与黛玉精神之恋、与宝钗金玉之缘，织成全书最核心的情感结构。",
      long: "贾宝玉是《红楼梦》的中心人物。他生于温柔富贵乡，却厌恶功名利禄，鄙弃仕途经济，独尊重「女儿」之情。与林黛玉的「木石前盟」是他最深的感情归宿；与薛宝钗的「金玉良缘」则是家族意志的安排。后四十回中失玉昏聩、被调包成婚，最终出家（续书情节）。鲁迅评其「悲凉之雾，遍被华林，然呼吸而领会之者，独宝玉而已」。",
    },
    personality_analysis: [
      {
        dimension: "重情",
        description: "对身边众女子皆存怜惜之情，尤以黛玉为精神知己，情之所至可以性命相许。",
        evidence_events: ["event_read_west_chamber", "event_zijuan_tests_yu_ch57"],
      },
      {
        dimension: "反叛",
        description: "鄙弃科举功名，视仕途经济为「禄蠹」，与父辈期望正面相撞。",
        evidence_events: ["event_heartfelt_words_ch32"],
      },
    ],
    timeline: [
      { order: 1, event_id: "event_daiyu_enters_jia", title: "初见黛玉（第三回）" },
      { order: 2, event_id: "event_read_west_chamber", title: "共读西厢（第二十三回）" },
      { order: 3, event_id: "event_heartfelt_words_ch32", title: "诉肺腑（第三十二回）" },
      { order: 4, event_id: "event_zijuan_tests_yu_ch57", title: "紫鹃试玉（第五十七回）" },
      { order: 5, event_id: "event_baoyu_marriage_ch97", title: "成婚（第九十七回·续书）" },
    ],
    related_characters: [
      { character_id: "character_lin_daiyu", relationship_type: "情缘" },
      { character_id: "character_xue_baochai", relationship_type: "姻缘" },
    ],
    sources: [],
    status: v(),
  },

  character_xue_baochai: {
    id: "character_xue_baochai",
    name: "薛宝钗",
    aliases: ["蘅芜君", "宝姐姐", "宝丫头"],
    category: "金陵十二钗正册",
    identity: {
      family: "薛姨妈之女，王夫人外甥女；兄薛蟠。",
      position: "贾府客居小姐；大观园蘅芜苑居所。",
      origin: "金陵人氏。",
      generation: "贾府第四代",
    },
    tags: ["稳重", "博学", "人情练达", "藏愚守拙", "金玉良缘"],
    summary: {
      short: "黛玉的对照人物，行事稳重周全，深谙世情。博学而藏拙，与宝玉有「金玉良缘」之约。",
      long: "薛宝钗与林黛玉并列为金陵十二钗之首。她博学而藏拙，待人宽厚而守礼，处事周全得体，深得贾府上下人心，与黛玉的孤高自许形成「双峰对峙」。后四十回中，在家族安排下与宝玉成婚，却终未得到他的心——「纵然是齐眉举案，到底意难平」。",
    },
    personality_analysis: [
      {
        dimension: "稳重",
        description: "处事周全体面，以礼自持，危机时刻是大家的定心石。",
        evidence_events: ["event_baoyu_marriage_ch97"],
      },
      {
        dimension: "博学",
        description: "诗画医理无所不通，但素来「罕言寡语」，藏愚守拙。",
        evidence_events: ["event_golden_words_ch45"],
      },
    ],
    timeline: [
      { order: 1, event_id: "event_golden_words_ch45", title: "金兰契互剖金兰语（第四十五回）" },
      { order: 2, event_id: "event_baoyu_marriage_ch97", title: "出闺成大礼（第九十七回·续书）" },
    ],
    related_characters: [
      { character_id: "character_jia_baoyu", relationship_type: "姻缘" },
      { character_id: "character_lin_daiyu", relationship_type: "对照关系" },
    ],
    sources: [],
    status: v(),
  },

  character_jiamu: {
    id: "character_jiamu",
    name: "贾母",
    aliases: ["史太君", "老祖宗", "老太太"],
    category: "贾府长辈",
    identity: {
      family: "荣国公长子贾代善之妻，史侯家小姐；儿贾赦、贾政，女贾敏。",
      position: "荣国府最高辈分，贾府实际的精神权威。",
      origin: "金陵人氏（史家）。",
      generation: "贾府第二代",
    },
    tags: ["慈爱", "精明", "风趣", "护短"],
    summary: {
      short: "贾府的最高权威，慈爱而精明，最疼爱宝玉与黛玉。",
      long: "贾母出身史侯家，嫁入荣国府，历经三代繁华。她慈爱风趣，是宝玉黛玉最亲近的长辈；但她也是家族秩序的维护者，在宝黛婚姻问题上的沉默与让步，预示了黛玉依靠的脆弱性。",
    },
    personality_analysis: [
      {
        dimension: "慈爱豁达",
        description: "对孙辈极尽疼爱，尤其怜惜无依的黛玉；性情风趣，是阖府的笑谈中心。",
        evidence_events: ["event_daiyu_enters_jia", "event_qingxuguan_ch29"],
      },
      {
        dimension: "精明周全",
        description: "历经三代的大家主母，人情世故通达，疼爱之下不失家主的判断与分寸。",
        evidence_events: ["event_qingxuguan_ch29"],
      },
      {
        dimension: "护短溺爱",
        description: "对宝玉的爱护到了「不教而纵」的地步，挨打时亲赴书房救场，贾政也无可如何。",
        evidence_events: ["event_baoyu_beaten_ch33"],
      },
    ],
    timeline: [
      { order: 1, event_id: "event_daiyu_enters_jia", title: "接外孙女黛玉进京（第三回）" },
      { order: 2, event_id: "event_qingxuguan_ch29", title: "清虚观打醮（第二十九回）" },
      { order: 3, event_id: "event_baoyu_beaten_ch33", title: "宝玉挨打救场（第三十三回）" },
    ],
    related_characters: [
      { character_id: "character_lin_daiyu", relationship_type: "祖孙怜爱" },
      { character_id: "character_jia_baoyu", relationship_type: "祖孙" },
    ],
    sources: [
      {
        source_id: "source_ch29_qingxuguan",
        quote: "贾母方说：「你们又来做什么，我不过没事来逛逛。」",
        note: "第二十九回清虚观打醮，贾母随口家常语。",
      },
    ],
    status: v(),
  },

  character_wangfuren: {
    id: "character_wangfuren",
    name: "王夫人",
    aliases: ["太太"],
    category: "贾府长辈",
    identity: {
      family: "贾政之妻，王子腾之妹，王熙凤姑母；子贾珠（早亡）、贾宝玉，女贾元春。",
      position: "荣国府当家夫人。",
      origin: "金陵王氏。",
      generation: "贾府第三代",
    },
    tags: ["宽厚之名", "封建礼法", "爱子", "吃斋念佛"],
    summary: {
      short: "宝玉之母，以「宽厚」著称，却是封建秩序最坚定的维护者之一。",
      long: "王夫人爱子极深，却无法理解宝玉的精神世界。她宽厚与冷酷并存：抄检大观园后逐晴雯、撵芳官，皆出于其「礼法」逻辑。在金玉良缘与宝黛之情的抉择中，她站在了家族一边。",
    },
    personality_analysis: [
      {
        dimension: "爱子至深",
        description: "宝玉挨打时哭劝贾政「打死宝玉事小，倘或老太太一时不自在了，岂不事大」，以孝道压父权，护子之心急切真切。",
        evidence_events: ["event_baoyu_beaten_ch33"],
      },
      {
        dimension: "礼法维护者",
        description: "抄检大观园、撵逐晴雯，皆出于「别教坏宝玉」的礼法逻辑；宽厚与冷酷一体两面。",
        evidence_events: ["event_chaojian_daguanyuan_ch74", "event_qingwen_expelled_ch77"],
      },
      {
        dimension: "吃斋念佛",
        description: "常年吃斋念佛的贵妇人，慈悲表象下以家族利益为最高准则。",
        evidence_events: [],
      },
    ],
    timeline: [
      { order: 1, event_id: "event_baoyu_beaten_ch33", title: "宝玉挨打哭劝（第三十三回）" },
      { order: 2, event_id: "event_chaojian_daguanyuan_ch74", title: "抄检大观园（第七十四回）" },
      { order: 3, event_id: "event_qingwen_expelled_ch77", title: "逐晴雯（第七十七回）" },
    ],
    related_characters: [
      { character_id: "character_jia_baoyu", relationship_type: "母子" },
    ],
    sources: [
      {
        source_id: "source_ch33_wangfuren_cry",
        quote: "王夫人哭道：「宝玉虽然该打，老爷也要自重。况且炎天暑日的，老太太身上也不大好，打死宝玉事小，倘或老太太一时不自在了，岂不事大！」",
        note: "第三十三回宝玉挨打，王夫人哭劝贾政。",
      },
    ],
    status: v(),
  },

  character_zijuan: {
    id: "character_zijuan",
    name: "紫鹃",
    aliases: ["鹦哥"],
    category: "贾府奴仆",
    identity: {
      family: "贾母房中丫鬟，后服侍黛玉。",
      position: "潇湘馆大丫鬟。",
      origin: "贾府家生子。",
    },
    tags: ["忠心", "聪慧", "重情", "心直"],
    summary: {
      short: "黛玉身边最知心的丫鬟，以「情辞试忙玉」闻名。",
      long: "紫鹃一心为黛玉的终身打算，敢于以性命相试宝玉的真情。她是宝黛爱情中少有的主动推动者，其忠心在黛玉临终时依然不改。",
    },
    personality_analysis: [
      {
        dimension: "忠心",
        description: "对黛玉事事上心，病中侍药、愁时解语，情同姐妹，一心为她终身打算。",
        evidence_events: ["event_zijuan_tests_yu_ch57"],
      },
    ],
    timeline: [
      { order: 1, event_id: "event_zijuan_tests_yu_ch57", title: "情辞试忙玉（第五十七回）" },
    ],
    related_characters: [
      { character_id: "character_lin_daiyu", relationship_type: "主仆知心" },
    ],
    sources: [],
    status: v(),
  },

  character_xiren: {
    id: "character_xiren",
    name: "袭人",
    aliases: ["花袭人", "珍珠"],
    category: "贾府奴仆",
    identity: {
      family: "花家卖身入府。",
      position: "怡红院首席丫鬟，宝玉贴身服侍。",
      origin: "金陵人氏。",
    },
    tags: ["贤", "体贴", "规劝", "忠顺"],
    summary: {
      short: "宝玉身边最体贴的大丫鬟，以「贤袭人」著称。",
      long: "袭人侍奉宝玉无微不至，却始终以规劝他读书仕进为己任——她的「贤」与宝玉的「痴」构成深层的隔膜。后四十回中嫁与蒋玉菡（续书情节）。",
    },
    personality_analysis: [
      {
        dimension: "贤惠体贴",
        description: "服侍宝玉无微不至，情切切良宵花解语，以「三不许」规劝，一片苦心。",
        evidence_events: ["event_chuyun_ch6", "event_quan_baoyu_ch19"],
      },
      {
        dimension: "忠顺守礼",
        description: "自视为宝玉之人，处处以「礼」为度；其忠顺深受王夫人倚重，被视为「贤袭人」。",
        evidence_events: ["event_chuyun_ch6"],
      },
    ],
    timeline: [
      { order: 1, event_id: "event_chuyun_ch6", title: "初试云雨情（第六回）" },
      { order: 2, event_id: "event_quan_baoyu_ch19", title: "情切切良宵花解语（第十九回）" },
    ],
    related_characters: [
      { character_id: "character_jia_baoyu", relationship_type: "主仆" },
    ],
    sources: [
      {
        source_id: "source_ch06_xiren_tou",
        quote: "袭人素知贾母已将自己与了宝玉的，今便如此，亦不为越礼，遂和宝玉偷试一番，幸得无人撞见。",
        note: "第六回初试云雨情，袭人身份自此而变。",
      },
    ],
    status: v(),
  },

  character_qingwen: {
    id: "character_qingwen",
    name: "晴雯",
    aliases: ["霁月", "芙蓉女儿"],
    category: "贾府奴仆",
    identity: {
      family: "赖大家买来的丫鬟，贾母赐予宝玉。",
      position: "怡红院丫鬟。",
      origin: "金陵人氏。",
    },
    tags: ["灵巧", "烈性", "清白", "心比天高"],
    summary: {
      short: "宝玉身边最「风流灵巧」的丫鬟，也是被冤枉而死的烈性女儿。",
      long: "晴雯「心比天高，身为下贱」，不屑讨好主子，补雀金裘、撕扇子可见其灵巧与真性情。抄检大观园中被逐出，抱屈而死。宝玉作《芙蓉女儿诔》以祭。",
    },
    personality_analysis: [
      {
        dimension: "灵巧无双",
        description: "女红技艺冠绝怡红院，病中一夜挣命补好无人能识的雀金裘。",
        evidence_events: ["event_mend_robe_ch52"],
      },
      {
        dimension: "烈性刚直",
        description: "不媚上、不藏话，撕扇子作千金一笑；被逐后「我死也不甘心的：我虽生的比别人略好些，并没有私情勾引你」——抱屈之烈，至死不悔。",
        evidence_events: ["event_tear_fan_ch31", "event_qingwen_expelled_ch77"],
      },
      {
        dimension: "清白自守",
        description: "宝玉以《芙蓉女儿诔》相祭，「其为质则金玉不足喻其贵」——清白是晴雯人格的底色。",
        evidence_events: ["event_qingwen_expelled_ch77"],
      },
    ],
    timeline: [
      { order: 1, event_id: "event_tear_fan_ch31", title: "撕扇作千金一笑（第三十一回）" },
      { order: 2, event_id: "event_mend_robe_ch52", title: "病补雀金裘（第五十二回）" },
      { order: 3, event_id: "event_qingwen_expelled_ch77", title: "抱屈被逐（第七十七回）" },
    ],
    related_characters: [
      { character_id: "character_jia_baoyu", relationship_type: "主仆知心" },
    ],
    sources: [
      {
        source_id: "source_ch77_qingwen_expelled",
        quote: "晴雯四五日水米不曾沾牙，懨懨弱息，如今现打炕上拉下来，蓬头垢面的，两个女人攙架起来去了。",
        note: "第七十七回晴雯被逐，抱屈而逝。",
      },
    ],
    status: v(),
  },
};
