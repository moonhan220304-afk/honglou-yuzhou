export interface JourneyStation {
  event_id: string;
  guide?: string;
}

export interface Journey {
  id: string;
  title: string;
  tagline: string;
  description: string;
  cover_character_id?: string;
  stations: JourneyStation[];
}

export const journeys: Journey[] = [
  {
    id: "baodai_romance",
    title: "宝黛情缘",
    tagline: "木石前盟 · 还泪之约",
    description:
      "从初见那一刻的似曾相识，到最后的泪尽而逝——沿着宝黛之情的完整轨迹前行。这条路线能让你看见：一份超越了礼法、却终被礼法吞没的爱情，是如何一步步走向终局的。",
    cover_character_id: "character_lin_daiyu",
    stations: [
      { event_id: "event_daiyu_enters_jia", guide: "故事从这里开始——一个孤女走进了荣国府。" },
      { event_id: "event_read_west_chamber", guide: "两年之后，春日的桃花树下，两颗心第一次靠拢。" },
      { event_id: "event_bury_flowers_ch27", guide: "一夜闭门羹，让黛玉的悲感喷薄而出。花落，人亡，她早已预感到了结局。" },
      { event_id: "event_heartfelt_words_ch32", guide: "「你放心」三个字，是这段感情唯一一次被正面确认。" },
      { event_id: "event_gift_handkerchief_ch34", guide: "两条旧手帕，三首诗——以心传心，至深至痛。" },
      { event_id: "event_zijuan_tests_yu_ch57", guide: "一个丫鬟的试探，把生死之恋逼到了明面上。" },
      { event_id: "event_burn_manuscripts_ch97", guide: "后四十回（续书）：洞房花烛夜，潇湘馆焚稿。" },
      { event_id: "event_daiyu_death_ch98", guide: "后四十回（续书）：绛珠仙草泪尽，魂归离恨天。" },
    ],
  },
  {
    id: "xifeng_rise_fall",
    title: "凤姐的权与劫",
    tagline: "机关算尽太聪明",
    description:
      "她一出场就笑声先到，把整个荣国府握在掌心里。但权力是双刃的——协理宁国府的风光、铁槛寺的银子、尤二姐的性命，一步步把她推向了「反算了卿卿性命」的结局。",
    cover_character_id: "character_wang_xifeng",
    stations: [
      { event_id: "event_xifeng_debut_ch3", guide: "未见其人，先闻其声——凤姐的登场就是一场表演。" },
      { event_id: "event_xifeng_co_manage_ch13", guide: "秦可卿之死给了她第一个舞台：协理宁国府。" },
      { event_id: "event_xifeng_iron_threshold_ch15", guide: "铁槛寺里三千两银子，买断了一条人命。" },
      { event_id: "event_xifeng_youerjie_ch69", guide: "借刀杀人——她把情敌尤二姐逼上了绝路。" },
      { event_id: "event_chaojian_daguanyuan_ch74", guide: "抄检大观园，她是那把被借用的刀。" },
    ],
  },
  {
    id: "chaojian_night",
    title: "抄检大观园之夜",
    tagline: "大观园的最后一夜",
    description:
      "一个绣春囊，一夜之间抄检全园。这是大观园由盛转衰的转折点：探春的耳光、惜春的决绝、宝钗的离场、晴雯的抱屈——群芳凋零，自此开始。",
    cover_character_id: "character_jia_tanchun",
    stations: [
      { event_id: "event_tanchun_slap_ch74", guide: "「我的东西倒许你们搜阅；要想搜我的丫头，这却不能。」" },
      { event_id: "event_baochai_house_search_ch74", guide: "抄检次日，宝钗搬离了大观园——体面人的无声抗议。" },
      { event_id: "event_xichun_ruhua_ch74", guide: "「善恶生死，父子不能有所勖助」——惜春撵走入画，也断了自己的尘缘。" },
      { event_id: "event_qingwen_expelled_ch77", guide: "病得只剩一口气的晴雯，被从炕上拖走。" },
    ],
  },
  {
    id: "twelve_beauties_fate",
    title: "十二钗的命运",
    tagline: "千红一哭，万艳同悲",
    description:
      "省亲的荣光、诗社的笑语、联诗的月色——然后依次凋零：迎春误嫁、元妃薨逝、探春远嫁、妙玉遭劫、巧姐获救。沿这条路线走完，你会明白「薄命司」三个字的分量。",
    cover_character_id: "character_jia_yuanchun",
    stations: [
      { event_id: "event_yuanchun_homecoming_ch18", guide: "烈火烹油、鲜花着锦之盛——元妃省亲。" },
      { event_id: "event_golden_words_ch45", guide: "钗黛交心：大观园里最温柔的时刻之一。" },
      { event_id: "event_xiangyun_drunk_ch62", guide: "湘云醉卧芍药裀——大观园最美的画面之一。" },
      { event_id: "event_yingchun_marry_ch79", guide: "「中山狼，无情兽」——迎春误嫁，踏上不归路。" },
      { event_id: "event_yuanchun_death_ch95", guide: "后四十回（续书）：元妃薨逝，贾府失去最大的靠山。" },
      { event_id: "event_tanchun_marry_ch100", guide: "后四十回（续书）：探春远嫁海疆——「分骨肉」。" },
      { event_id: "event_miaoyu_kidnapped_ch112", guide: "后四十回（续书）：「到头来，依旧是风尘肮脏违心愿」——妙玉遭劫。" },
      { event_id: "event_qiaojie_rescued_ch119", guide: "后四十回（续书）：巧姐获救于刘姥姥——全书中唯一的暖色收束。" },
    ],
  },
];
