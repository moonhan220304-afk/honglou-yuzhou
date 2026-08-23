import type { Event } from "@/lib/types";

const v = (confidence = 100) => ({
  review: "verified" as const,
  confidence,
  verified_by: "redmansion-kb-v1",
  updated_at: "2026-08-10T00:00:00Z",
  embedding_status: "pending" as const,
});

export const events: Record<string, Event> = {
  event_daiyu_enters_jia: {
    id: "event_daiyu_enters_jia",
    title: "黛玉进贾府",
    event_level: "major",
    chapter: {
      number: 3,
      title: "贾雨村夤缘复旧职 林黛玉抛父进京都",
      attribution: "caoxueqin",
    },
    location: { name: "荣国府", specific: "贾母正房" },
    summary: {
      short: "母亲亡故后，黛玉随贾雨村进京，初入荣国府，得见贾母与众人，并与宝玉初次相见。",
      meaning: [
        "黛玉人生轨迹的起点，从此寄居贾府",
        "初见宝玉，「木石前盟」在人间第一次相会",
        "宝玉问「可也有玉没有」，闻黛玉无玉即摔通灵宝玉",
        "借黛玉之眼第一次完整呈现贾府格局",
      ],
    },
    participants: [
      { character_id: "character_lin_daiyu", role: "主要人物" },
      { character_id: "character_jia_baoyu", role: "相关人物" },
      { character_id: "character_jiamu", role: "相关人物" },
    ],
    evidence: [
      {
        source_id: "source_ch03_daiyu_appearance",
        quote: "两弯似蹙非蹙罥烟眉，一双似喜非喜含情目。态生两靥之愁，娇袭一身之病。",
        note: "第三回黛玉初入贾府，宝玉眼中所见。",
      },
      {
        source_id: "source_ch03_name_origin",
        quote: "《古今人物通考》上说：「西方有石名黛，可代画眉之墨。」况这林妹妹眉尖若蹙，用取这两个字，岂不两妙！",
        note: "第三回宝玉为黛玉取字「颦颦」。",
      },
    ],
    interpretations: [
      {
        type: "literary",
        title: "一石三鸟的叙事视角",
        content: "借黛玉初来乍到之眼写贾府，读者与黛玉同为新客，家族全貌由此自然展开。",
      },
      {
        type: "character",
        title: "自尊与寄人篱下的自觉",
        content: "黛玉「步步留心，时时在意，不肯轻易多说一句话，多行一步路」，寄人篱下的自觉从一开始便刻入其性格。",
      },
    ],
    related_events: ["event_read_west_chamber", "event_bury_flowers_ch27"],
    status: v(),
  },

  event_baoyu_smash_jade_ch3: {
    id: "event_baoyu_smash_jade_ch3",
    title: "宝玉摔玉",
    event_level: "major",
    chapter: {
      number: 3,
      title: "贾雨村夤缘复旧职 林黛玉抛父进京都",
      attribution: "caoxueqin",
    },
    location: { name: "荣国府", specific: "贾母正房" },
    summary: {
      short: "宝玉初见黛玉，问「可也有玉没有」，闻黛玉无玉，登时摘下通灵宝玉狠命摔去——「什么罕物，连人之高低不择」。",
      meaning: [
        "宝玉对「金玉良缘」的第一次无意识抵抗",
        "通灵宝玉是全家眼中的「命根子」，宝玉却可为一见如故的黛玉而摔",
        "摔玉不是任性，而是对世俗价值标准的最初反叛",
        "贾母「孽障」之叹，点出宝玉离经叛道与家族期许的根本冲突",
      ],
    },
    participants: [
      { character_id: "character_jia_baoyu", role: "主要人物" },
      { character_id: "character_lin_daiyu", role: "相关人物" },
      { character_id: "character_jiamu", role: "相关人物" },
    ],
    evidence: [
      {
        source_id: "source_ch03_smash_jade",
        quote: "又问黛玉：「可也有玉没有？」……宝玉听了，登时发作起痴狂病来，摘下那玉就狠命摔去，骂道：「什么罕物，连人之高低不择，还说通灵不通灵呢！我也不要这劳什子了。」",
        note: "第三回宝黛初见，宝玉闻黛玉无玉而摔通灵宝玉。",
      },
    ],
    interpretations: [
      {
        type: "character",
        title: "一见如故的「木石前盟」",
        content: "宝玉从未见黛玉便似曾相识，问玉摔玉，是绛珠仙草与神瑛侍者前盟在人间的第一次呼应。",
      },
      {
        type: "literary",
        title: "「玉」作为世俗标准的象征",
        content: "全家视通灵宝玉为命根，宝玉却因黛玉无玉而摔之——「玉」在此是门第、身份的符号，摔玉即是对这套标准的本能反叛。",
      },
    ],
    related_events: ["event_daiyu_enters_jia"],
    status: v(),
  },

  event_read_west_chamber: {
    id: "event_read_west_chamber",
    title: "共读西厢",
    event_level: "major",
    chapter: {
      number: 23,
      title: "西厢记妙词通戏语 牡丹亭艳曲警芳心",
      attribution: "caoxueqin",
    },
    location: { name: "大观园", specific: "沁芳闸桥边桃花树下" },
    summary: {
      short: "三月中，宝玉携《会真记》（《西厢记》）在桃花树下共读，黛玉听闻后心有所动；后闻《牡丹亭》曲词而心动神摇。",
      meaning: [
        "宝黛精神世界第一次深度共鸣",
        "以「禁书」为媒介，暗写二人超越礼法的情感",
        "黛玉闻曲落泪，是其悲剧意识的早现",
      ],
    },
    participants: [
      { character_id: "character_jia_baoyu", role: "主要人物" },
      { character_id: "character_lin_daiyu", role: "主要人物" },
    ],
    evidence: [
      {
        source_id: "source_ch23_west_chamber",
        quote: "我就是个「多愁多病身」，你就是那「倾国倾城貌」。",
        note: "第二十三回宝玉借《西厢记》曲词试探黛玉。",
      },
    ],
    interpretations: [
      {
        type: "character",
        title: "精神之恋的定调",
        content: "二人以戏词传情，情感从「两小无猜」升华为精神上的知己之恋。",
      },
    ],
    related_events: ["event_bury_flowers_ch27", "event_heartfelt_words_ch32"],
    status: v(),
  },

  event_bury_flowers_ch27: {
    id: "event_bury_flowers_ch27",
    title: "黛玉葬花",
    event_level: "major",
    chapter: {
      number: 27,
      title: "滴翠亭杨妃戏彩蝶 埋香冢飞燕泣残红",
      attribution: "caoxueqin",
    },
    location: {
      name: "大观园花冢",
      specific: "沁芳闸桥边，昔日与宝玉葬桃花的去处",
    },
    summary: {
      short: "芒种节饯花神之日，黛玉独自至花冢葬花，吟《葬花吟》，悲花伤己。宝玉于山坡后偷听，闻诗恸倒。",
      meaning: [
        "以葬花象征薄命红颜的命运悲剧——「千红一哭，万艳同悲」",
        "「质本洁来还洁去，不教污淖陷渠沟」表达对纯洁人格的坚守",
        "「一朝春尽红颜老，花落人亡两不知」预言自身与大观园群芳的凋零",
        "为全书黛玉命运的纲领性篇章",
      ],
    },
    participants: [
      { character_id: "character_lin_daiyu", role: "主角（葬花人、吟诗人）" },
      { character_id: "character_jia_baoyu", role: "旁听者（花冢山坡后偷听）" },
    ],
    evidence: [
      {
        source_id: "source_ch27_zanghua_yin",
        quote: "花谢花飞花满天，红消香断有谁怜？……侬今葬花人笑痴，他年葬侬知是谁？试看春残花渐落，便是红颜老死时。一朝春尽红颜老，花落人亡两不知！",
        note: "《葬花吟》全文五十二句，此为首尾核心选段。通行本第二十七回原文。",
      },
      {
        source_id: "source_ch27_baoyu_react",
        quote: "宝玉在山坡上听见，先不过点头感叹；次后听到「侬今葬花人笑痴，他年葬侬知是谁」……不觉恸倒山坡之上，怀里兜的落花撒了一地。",
        note: "第二十七回宝玉听《葬花吟》的反应。",
      },
    ],
    interpretations: [
      {
        type: "literary",
        title: "黛玉命运纲领",
        content: "《葬花吟》不仅是黛玉的自我悲叹，更是全书「千红一哭，万艳同悲」的缩影，以花喻人，预示大观园群芳的凋零命运。",
      },
      {
        type: "literary",
        title: "两次葬花的对照",
        content: "第二十三回宝黛合葬桃花，温馨浪漫；第二十七回黛玉独葬落花，凄凉萧索。两次葬花形成鲜明对照，标志宝黛关系从甜蜜走向深沉悲凉。",
      },
    ],
    related_events: ["event_read_west_chamber", "event_daiyu_enters_jia"],
    status: v(),
  },

  event_heartfelt_words_ch32: {
    id: "event_heartfelt_words_ch32",
    title: "诉肺腑",
    event_level: "major",
    chapter: {
      number: 32,
      title: "诉肺腑心迷活宝玉 含耻辱情烈死金钏",
      attribution: "caoxueqin",
    },
    location: { name: "大观园", specific: "怡红院外" },
    summary: {
      short: "宝玉对黛玉说出「你放心」三字，黛玉如轰雷掣电；黛玉走后，宝玉误将袭人当作黛玉，说出「睡里梦里也忘不了你」的肺腑之言。",
      meaning: [
        "宝黛之情第一次正面确认",
        "「你放心」三字成为全书爱情最凝练的表达",
      ],
    },
    participants: [
      { character_id: "character_jia_baoyu", role: "主要人物" },
      { character_id: "character_lin_daiyu", role: "主要人物" },
      { character_id: "character_xiren", role: "相关人物" },
    ],
    evidence: [
      {
        source_id: "source_ch32_heartfelt_words",
        quote: "宝玉忙笑道：「你放心。」黛玉听了这话，如轰雷掣电，细细思之，竟比自己肺腑中掏出来的还觉恳切。",
        note: "第三十二回诉肺腑。",
      },
    ],
    interpretations: [
      {
        type: "character",
        title: "情定今生",
        content: "二人终于确认彼此心意，不再互相试探——此后宝黛之间再无大的猜疑，感情进入稳定期。",
      },
    ],
    related_events: ["event_read_west_chamber", "event_zijuan_tests_yu_ch57"],
    status: v(),
  },

  event_gift_handkerchief_ch34: {
    id: "event_gift_handkerchief_ch34",
    title: "赠帕题诗",
    event_level: "minor",
    chapter: {
      number: 34,
      title: "情中情因情感妹妹 错里错以错劝哥哥",
      attribution: "caoxueqin",
    },
    location: { name: "潇湘馆", specific: "黛玉闺中" },
    summary: {
      short: "宝玉挨打后，遣晴雯送两条旧手帕给黛玉。黛玉初不解，后大悟，提笔写下三首题帕诗，情感至深至痛。",
      meaning: [
        "以帕传情，是宝黛之间最深情的暗语",
        "题帕三绝是黛玉爱情的巅峰诗篇之一",
      ],
    },
    participants: [
      { character_id: "character_jia_baoyu", role: "主要人物" },
      { character_id: "character_lin_daiyu", role: "主要人物" },
      { character_id: "character_qingwen", role: "传递者" },
    ],
    evidence: [
      {
        source_id: "source_ch34_gift_pa",
        quote: "黛玉……方想起旧帕子来，不觉神魂驰荡……自提笔向那帕子上写了一首，又想，索性再题两首。",
        note: "第三十四回黛玉题帕。",
      },
    ],
    interpretations: [],
    related_events: ["event_heartfelt_words_ch32"],
    status: v(),
  },

  event_golden_words_ch45: {
    id: "event_golden_words_ch45",
    title: "金兰契互剖金兰语",
    event_level: "major",
    chapter: {
      number: 45,
      title: "金兰契互剖金兰语 风雨夕闷制风雨词",
      attribution: "caoxueqin",
    },
    location: { name: "潇湘馆", specific: "黛玉病榻前" },
    summary: {
      short: "宝钗探望病中的黛玉，以燕窝相赠、以知心话相劝，二人互诉衷肠，情同金兰。当夜秋雨，黛玉闷制《秋窗风雨夕》。",
      meaning: [
        "钗黛由竞争走向和解的标志性事件",
        "「钗黛合一」论的核心文本依据之一",
      ],
    },
    participants: [
      { character_id: "character_xue_baochai", role: "主要人物" },
      { character_id: "character_lin_daiyu", role: "主要人物" },
    ],
    evidence: [
      {
        source_id: "source_ch45_golden_words",
        quote: "黛玉道：「你素日待人，固然是极好的，然我最是个多心的人，只当你心里藏奸。……」宝钗道：「你放心，我在这里一日，我与你消遣一日。」",
        note: "第四十五回金兰契互剖金兰语。",
      },
    ],
    interpretations: [
      {
        type: "hongxue",
        title: "钗黛合一论的文本基础",
        content: "脂砚斋第四十二回总批：「钗、玉名虽两个，人却一身，此幻笔也。」此回钗黛交心，被视为二人「合一」的重要证据。",
      },
    ],
    related_events: ["event_read_west_chamber"],
    status: v(),
  },

  event_zijuan_tests_yu_ch57: {
    id: "event_zijuan_tests_yu_ch57",
    title: "紫鹃试玉",
    event_level: "major",
    chapter: {
      number: 57,
      title: "慧紫鹃情辞试忙玉 慈姨妈爱语慰痴颦",
      attribution: "caoxueqin",
    },
    location: { name: "大观园", specific: "怡红院" },
    summary: {
      short: "紫鹃以「林妹妹回苏州」试探宝玉，宝玉如遭雷击、痴病发作、死去活来，以生命证明了对黛玉的执着。",
      meaning: [
        "宝黛之情从私密走向公开的转折",
        "贾府上下由此皆知宝玉钟情黛玉",
        "紫鹃对黛玉说「万两黄金容易得，知心一个也难求」",
      ],
    },
    participants: [
      { character_id: "character_zijuan", role: "主要人物" },
      { character_id: "character_jia_baoyu", role: "主要人物" },
      { character_id: "character_lin_daiyu", role: "相关人物" },
    ],
    evidence: [
      {
        source_id: "source_ch57_zijuan",
        quote: "紫鹃笑道：「……如今竟是说了出来，林姑娘明年回苏州去。」宝玉听了，便如头顶上响了一个焦雷一般。",
        note: "第五十七回紫鹃试宝玉真情。",
      },
    ],
    interpretations: [
      {
        type: "character",
        title: "痴情的实证",
        content: "宝玉「呆病」之状，证明其对黛玉已到性命以系的地步，也为后来悲剧结局埋下伏笔。",
      },
    ],
    related_events: ["event_heartfelt_words_ch32", "event_baoyu_marriage_ch97"],
    status: v(),
  },

  event_baoyu_marriage_ch97: {
    id: "event_baoyu_marriage_ch97",
    title: "焚稿断痴情",
    event_level: "major",
    chapter: {
      number: 97,
      title: "林黛玉焚稿断痴情 薛宝钗出闺成大礼",
      attribution: "gaoe",
    },
    location: { name: "潇湘馆", specific: "黛玉病榻前" },
    summary: {
      short: "宝玉成婚之夜，黛玉在潇湘馆焚毁旧帕诗稿，泪尽而逝（后四十回续书情节）。",
      meaning: [
        "宝黛悲剧的直接呈现",
        "以「焚稿」告别全部诗情与痴情",
        "与前八十回「葬花」构成对称的收束",
      ],
    },
    participants: [
      { character_id: "character_lin_daiyu", role: "主要人物" },
      { character_id: "character_jia_baoyu", role: "相关人物" },
      { character_id: "character_xue_baochai", role: "相关人物" },
    ],
    evidence: [
      {
        source_id: "source_ch97_fen_gao",
        quote: "黛玉这才将方才的绢子拿在手中，瞅着那火点点头儿，往上一撂。",
        note: "[后四十回] 黛玉焚稿情节，高鹗续书所写。红学界对后四十回归属及此结局是否符合曹雪芹原意存在争议。",
      },
    ],
    interpretations: [
      {
        type: "hongxue",
        title: "续书归属的争议",
        content: "后四十回一般认为非曹雪芹手笔（近年通行观点为无名氏续，程伟元、高鹗整理）。黛玉结局的具体写法属续书情节，学界对前八十回伏笔所指有不同解读。",
      },
    ],
    related_events: ["event_bury_flowers_ch27"],
    status: v(),
  },

  event_qingxuguan_ch29: {
    id: "event_qingxuguan_ch29",
    title: "清虚观打醮",
    event_level: "minor",
    chapter: {
      number: 29,
      title: "享福人福深还祷福 痴情女情重愈斟情",
      attribution: "caoxueqin",
    },
    location: { name: "清虚观", specific: "道观正殿" },
    summary: {
      short: "贾母率阖府女眷至清虚观打平安醮，张道士为宝玉提亲，宝黛因此又生口角。",
      meaning: [
        "贾府贵族生活的盛景写照",
        "张道士提亲，是金玉良缘与宝黛之情的第一次公开交锋",
        "贾母当众表态度，为后文宝黛关系的走向埋下伏笔",
      ],
    },
    participants: [
      { character_id: "character_jiamu", role: "主持者" },
      { character_id: "character_lin_daiyu", role: "参与者" },
      { character_id: "character_jia_baoyu", role: "参与者" },
    ],
    evidence: [
      {
        source_id: "source_ch29_qingxuguan",
        quote: "贾母方说：「你们又来做什么，我不过没事来逛逛。」",
        note: "第二十九回清虚观打醮。",
      },
    ],
    interpretations: [],
    related_events: ["event_daiyu_enters_jia"],
    status: v(),
  },

  event_baoyu_beaten_ch33: {
    id: "event_baoyu_beaten_ch33",
    title: "宝玉挨打",
    event_level: "major",
    chapter: {
      number: 33,
      title: "手足耽耽小动唇舌 不肖种种大承笞挞",
      attribution: "caoxueqin",
    },
    location: { name: "荣国府", specific: "贾政书房" },
    summary: {
      short: "因金钏之死与琪官之事，贾政大怒，将宝玉打得动弹不得。王夫人赶来抱住板子哭劝，贾母赶到后方才罢休。",
      meaning: [
        "宝玉反叛性格与父权秩序最激烈的一次正面冲突",
        "王夫人哭诉中提及贾珠，母子隔膜的深层根源在此",
        "宝黛感情由此得到公开的确认与同情",
      ],
    },
    participants: [
      { character_id: "character_jia_baoyu", role: "被打者" },
      { character_id: "character_wangfuren", role: "护子者" },
      { character_id: "character_jiamu", role: "最终救场者" },
    ],
    evidence: [
      {
        source_id: "source_ch33_wangfuren_cry",
        quote: "王夫人哭道：「宝玉虽然该打，老爷也要自重。况且炎天暑日的，老太太身上也不大好，打死宝玉事小，倘或老太太一时不自在了，岂不事大！」",
        note: "第三十三回王夫人哭劝贾政。",
      },
    ],
    interpretations: [
      {
        type: "literary",
        title: "全书情绪的爆点",
        content: "此回是前八十回中家庭冲突最剧烈的一场，宝玉挨打牵连出金钏之死、忠顺王府索人、贾环进谗等多条线索，是家族内部矛盾的集中爆发。",
      },
    ],
    related_events: ["event_heartfelt_words_ch32", "event_gift_handkerchief_ch34"],
    status: v(),
  },

  event_chaojian_daguanyuan_ch74: {
    id: "event_chaojian_daguanyuan_ch74",
    title: "抄检大观园",
    event_level: "major",
    chapter: {
      number: 74,
      title: "惑奸谗抄检大观园 矢孤介杜绝宁国府",
      attribution: "caoxueqin",
    },
    location: { name: "大观园", specific: "各院逐一搜查" },
    summary: {
      short: "因绣春囊一事，王夫人听信王善保家的谗言，命凤姐率众连夜抄检大观园。探春怒斥、晴雯受辱，抄检成为大观园由盛转衰的标志性事件。",
      meaning: [
        "大观园群芳悲剧的开始，此后晴雯被逐、司棋事发、宝钗搬出",
        "「百足之虫，死而不僵」——探春的预言点出家族内斗之祸",
        "王夫人礼法逻辑的集中暴露",
      ],
    },
    participants: [
      { character_id: "character_wangfuren", role: "决策者" },
      { character_id: "character_qingwen", role: "受害者" },
    ],
    evidence: [
      {
        source_id: "source_ch74_tanchun",
        quote: "探春道：「我的东西倒许你们搜阅；要想搜我的丫头，这却不能。……可知这样大族人家，若从外头杀来，一时是杀不死的……必须先从家里自杀自灭起来，才能一败涂地！」",
        note: "第七十四回探春怒斥抄检。",
      },
    ],
    interpretations: [
      {
        type: "hongxue",
        title: "由盛转衰的转折点",
        content: "红学界普遍认为抄检大观园是贾府内乱公开化的标志，此后大观园众芳凋零，全书由喜转悲。",
      },
    ],
    related_events: ["event_qingwen_expelled_ch77"],
    status: v(),
  },

  event_chuyun_ch6: {
    id: "event_chuyun_ch6",
    title: "初试云雨情",
    event_level: "minor",
    chapter: {
      number: 6,
      title: "贾宝玉初试云雨情 刘姥姥一进荣国府",
      attribution: "caoxueqin",
    },
    location: { name: "怡红院", specific: "宝玉卧房" },
    summary: {
      short: "宝玉梦游太虚幻境后，与贴身丫鬟袭人偷试云雨。自此袭人待宝玉更为尽心，成为事实上的侍妾。",
      meaning: [
        "袭人身份的转折点——自此自视为宝玉之人",
        "宝玉与身边女性的情感世界由此展开",
      ],
    },
    participants: [
      { character_id: "character_jia_baoyu", role: "主要人物" },
      { character_id: "character_xiren", role: "主要人物" },
    ],
    evidence: [
      {
        source_id: "source_ch06_xiren_tou",
        quote: "袭人素知贾母已将自己与了宝玉的，今便如此，亦不为越礼，遂和宝玉偷试一番，幸得无人撞见。",
        note: "第六回初试云雨情。",
      },
    ],
    interpretations: [],
    related_events: ["event_daiyu_enters_jia"],
    status: v(),
  },

  event_quan_baoyu_ch19: {
    id: "event_quan_baoyu_ch19",
    title: "情切切良宵花解语",
    event_level: "minor",
    chapter: {
      number: 19,
      title: "情切切良宵花解语 意绵绵静日玉生香",
      attribution: "caoxueqin",
    },
    location: { name: "怡红院", specific: "袭人房中" },
    summary: {
      short: "袭人借赎身之说试探宝玉，规劝他读书上进、不可毁僧谤道、改掉爱红的毛病，提出「三不许」。",
      meaning: [
        "「贤袭人」之贤的集中体现",
        "袭人的规劝与宝玉的叛逆形成深层隔膜",
      ],
    },
    participants: [
      { character_id: "character_xiren", role: "主要人物" },
      { character_id: "character_jia_baoyu", role: "主要人物" },
    ],
    evidence: [],
    interpretations: [],
    related_events: ["event_chuyun_ch6"],
    status: v(),
  },

  event_tear_fan_ch31: {
    id: "event_tear_fan_ch31",
    title: "撕扇子作千金一笑",
    event_level: "minor",
    chapter: {
      number: 31,
      title: "撕扇子作千金一笑 因麒麟伏白首双星",
      attribution: "caoxueqin",
    },
    location: { name: "怡红院", specific: "院中乘凉榻边" },
    summary: {
      short: "晴雯跌折扇股被宝玉责备，二人争执，袭人劝解反遭讥讽。晚间宝玉回心转意，纵晴雯撕扇取乐，道「千金难买一笑」。",
      meaning: [
        "宝玉不以主子自居的性情写照",
        "晴雯天真任性的性格展示",
      ],
    },
    participants: [
      { character_id: "character_qingwen", role: "主要人物" },
      { character_id: "character_jia_baoyu", role: "主要人物" },
    ],
    evidence: [
      {
        source_id: "source_ch31_tear_fan",
        quote: "晴雯果然接过来，嗤的一声，撕了两半，接着嗤嗤又听几声。宝玉在旁笑着说：「响的好，再撕响些！」",
        note: "第三十一回撕扇作千金一笑。",
      },
    ],
    interpretations: [
      {
        type: "character",
        title: "真性情的相互成全",
        content: "晴雯撕扇不是恃宠而骄，而是「爱物」之理的反用；宝玉纵之，正是「情不情」的体现。",
      },
    ],
    related_events: [],
    status: v(),
  },

  event_mend_robe_ch52: {
    id: "event_mend_robe_ch52",
    title: "勇晴雯病补雀金裘",
    event_level: "minor",
    chapter: {
      number: 52,
      title: "俏平儿情掩虾须镯 勇晴雯病补雀金裘",
      attribution: "caoxueqin",
    },
    location: { name: "怡红院", specific: "晴雯病榻前" },
    summary: {
      short: "宝玉的雀金裘烧破一个洞，织补匠人皆不识此料。病中的晴雯强撑起身，一夜挣命，用界线之法补好。",
      meaning: [
        "晴雯女红技艺冠绝群芳的证明",
        "以病躯挣命补裘，是她对宝玉的一片痴心",
      ],
    },
    participants: [
      { character_id: "character_qingwen", role: "主要人物" },
      { character_id: "character_jia_baoyu", role: "相关人物" },
    ],
    evidence: [
      {
        source_id: "source_ch52_mend_robe",
        quote: "晴雯道：「这是孔雀金线织的，如今咱们也拿孔雀金线就像界线似的界密了，只怕还可混得过去。」……晴雯道：「说不得，我挣命罢了。」",
        note: "第五十二回病补雀金裘。",
      },
    ],
    interpretations: [
      {
        type: "character",
        title: "以命相酬",
        content: "「说不得，我挣命罢了」——补裘之勇，正是晴雯全部痴情的浓缩。",
      },
    ],
    related_events: ["event_qingwen_expelled_ch77"],
    status: v(),
  },

  event_qingwen_expelled_ch77: {
    id: "event_qingwen_expelled_ch77",
    title: "晴雯被逐",
    event_level: "minor",
    chapter: {
      number: 77,
      title: "俏丫鬟抱屈夭风流 美优伶斩情归水月",
      attribution: "caoxueqin",
    },
    location: { name: "怡红院", specific: "晴雯卧房" },
    summary: {
      short: "抄检之后，王夫人亲至怡红院，将病重的晴雯从炕上拉下撵出。晴雯抱屈而死，宝玉作《芙蓉女儿诔》以祭。",
      meaning: [
        "抄检大观园悲剧的直接延续",
        "晴雯「抱屈」——「我虽生的比别人略好些，并没有私情勾引你，怎么一口死咬定了我是个小狐狸精」",
        "宝玉对清白女儿无力回天的痛感",
      ],
    },
    participants: [
      { character_id: "character_qingwen", role: "受害者" },
      { character_id: "character_wangfuren", role: "撵逐者" },
      { character_id: "character_jia_baoyu", role: "相关人物" },
    ],
    evidence: [
      {
        source_id: "source_ch77_qingwen_expelled",
        quote: "晴雯四五日水米不曾沾牙，懨懨弱息，如今现打炕上拉下来，蓬头垢面的，两个女人攙架起来去了。",
        note: "第七十七回晴雯被逐。",
      },
    ],
    interpretations: [
      {
        type: "character",
        title: "晴为黛影",
        content: "红学传统以「晴为黛影」，晴雯之死预示黛玉之亡；宝玉祭文《芙蓉女儿诔》实为「诔晴雯而哀黛玉」。",
      },
    ],
    related_events: ["event_chaojian_daguanyuan_ch74"],
    status: v(),
  },
};
