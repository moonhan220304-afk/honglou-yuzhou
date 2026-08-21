import type {
  Character,
  Event,
  Relationship,
  Source,
  Viewpoint,
  Chapter,
} from "@/lib/types";
import { characters as mockCharacters } from "@/lib/mock/characters";
import { events as mockEvents } from "@/lib/mock/events";
import { relationships as mockRelationships } from "@/lib/mock/relationships";
import { sources as mockSources, chapters as mockChapters } from "@/lib/mock/sources";

import c_lin_daiyu from "../../docs/knowledge-base/content/characters/character_lin_daiyu.json";
import c_xue_baochai from "../../docs/knowledge-base/content/characters/character_xue_baochai.json";
import c_jia_yuanchun from "../../docs/knowledge-base/content/characters/character_jia_yuanchun.json";
import c_jia_tanchun from "../../docs/knowledge-base/content/characters/character_jia_tanchun.json";
import c_shi_xiangyun from "../../docs/knowledge-base/content/characters/character_shi_xiangyun.json";
import c_miao_yu from "../../docs/knowledge-base/content/characters/character_miao_yu.json";
import c_jia_yingchun from "../../docs/knowledge-base/content/characters/character_jia_yingchun.json";
import c_jia_xichun from "../../docs/knowledge-base/content/characters/character_jia_xichun.json";
import c_wang_xifeng from "../../docs/knowledge-base/content/characters/character_wang_xifeng.json";
import c_li_wan from "../../docs/knowledge-base/content/characters/character_li_wan.json";
import c_jia_qiaojie from "../../docs/knowledge-base/content/characters/character_jia_qiaojie.json";
import c_qin_keqing from "../../docs/knowledge-base/content/characters/character_qin_keqing.json";
import chaptersData from "../../docs/knowledge-base/content/chapters.json";
import questionsRaw from "../../docs/knowledge-base/content-v2/questions.json";
import locationsRaw from "../../docs/knowledge-base/content-v2/locations.json";
import poemsRaw from "../../docs/knowledge-base/content-v2/poems.json";
import characterAgesRaw from "../../docs/knowledge-base/content-v2/character-ages.json";

/* ---------- v2 人物档案（覆盖层，含刘姥姥/平儿等新人物） ---------- */
import v2_jia_baoyu from "../../docs/knowledge-base/content-v2/characters/character_jia_baoyu.json";
import v2_jia_mu from "../../docs/knowledge-base/content-v2/characters/character_jia_mu.json";
import v2_jia_qiaojie from "../../docs/knowledge-base/content-v2/characters/character_jia_qiaojie.json";
import v2_jia_tanchun from "../../docs/knowledge-base/content-v2/characters/character_jia_tanchun.json";
import v2_jia_xichun from "../../docs/knowledge-base/content-v2/characters/character_jia_xichun.json";
import v2_jia_yingchun from "../../docs/knowledge-base/content-v2/characters/character_jia_yingchun.json";
import v2_jia_yuanchun from "../../docs/knowledge-base/content-v2/characters/character_jia_yuanchun.json";
import v2_li_wan from "../../docs/knowledge-base/content-v2/characters/character_li_wan.json";
import v2_lin_daiyu from "../../docs/knowledge-base/content-v2/characters/character_lin_daiyu.json";
import v2_liu_laolao from "../../docs/knowledge-base/content-v2/characters/character_liu_laolao.json";
import v2_miao_yu from "../../docs/knowledge-base/content-v2/characters/character_miao_yu.json";
import v2_pinger from "../../docs/knowledge-base/content-v2/characters/character_pinger.json";
import v2_qin_keqing from "../../docs/knowledge-base/content-v2/characters/character_qin_keqing.json";
import v2_qingwen from "../../docs/knowledge-base/content-v2/characters/character_qingwen.json";
import v2_shi_xiangyun from "../../docs/knowledge-base/content-v2/characters/character_shi_xiangyun.json";
import v2_wang_furen from "../../docs/knowledge-base/content-v2/characters/character_wang_furen.json";
import v2_wang_xifeng from "../../docs/knowledge-base/content-v2/characters/character_wang_xifeng.json";
import v2_xiren from "../../docs/knowledge-base/content-v2/characters/character_xiren.json";
import v2_xue_baochai from "../../docs/knowledge-base/content-v2/characters/character_xue_baochai.json";
import v2_zijuan from "../../docs/knowledge-base/content-v2/characters/character_zijuan.json";
import v2_beijing_wang from "../../docs/knowledge-base/content-v2/characters/character_beijing_wang.json";
import v2_jia_huan from "../../docs/knowledge-base/content-v2/characters/character_jia_huan.json";
import v2_jia_jing from "../../docs/knowledge-base/content-v2/characters/character_jia_jing.json";
import v2_jia_lan from "../../docs/knowledge-base/content-v2/characters/character_jia_lan.json";
import v2_jia_lian from "../../docs/knowledge-base/content-v2/characters/character_jia_lian.json";
import v2_jia_rong from "../../docs/knowledge-base/content-v2/characters/character_jia_rong.json";
import v2_jia_rui from "../../docs/knowledge-base/content-v2/characters/character_jia_rui.json";
import v2_jia_she from "../../docs/knowledge-base/content-v2/characters/character_jia_she.json";
import v2_jia_yucun from "../../docs/knowledge-base/content-v2/characters/character_jia_yucun.json";
import v2_jia_yun from "../../docs/knowledge-base/content-v2/characters/character_jia_yun.json";
import v2_jia_zhen from "../../docs/knowledge-base/content-v2/characters/character_jia_zhen.json";
import v2_jia_zheng from "../../docs/knowledge-base/content-v2/characters/character_jia_zheng.json";
import v2_jiang_yuhan from "../../docs/knowledge-base/content-v2/characters/character_jiang_yuhan.json";
import v2_jiao_da from "../../docs/knowledge-base/content-v2/characters/character_jiao_da.json";
import v2_jinchuan from "../../docs/knowledge-base/content-v2/characters/character_jinchuan.json";
import v2_lin_ruhai from "../../docs/knowledge-base/content-v2/characters/character_lin_ruhai.json";
import v2_lingguan from "../../docs/knowledge-base/content-v2/characters/character_lingguan.json";
import v2_ma_daopo from "../../docs/knowledge-base/content-v2/characters/character_ma_daopo.json";
import v2_qin_ye from "../../docs/knowledge-base/content-v2/characters/character_qin_ye.json";
import v2_qin_zhong from "../../docs/knowledge-base/content-v2/characters/character_qin_zhong.json";
import v2_sheyue from "../../docs/knowledge-base/content-v2/characters/character_sheyue.json";
import v2_xiangling from "../../docs/knowledge-base/content-v2/characters/character_xiangling.json";
import v2_xiaohong from "../../docs/knowledge-base/content-v2/characters/character_xiaohong.json";
import v2_xing_furen from "../../docs/knowledge-base/content-v2/characters/character_xing_furen.json";
import v2_xue_pan from "../../docs/knowledge-base/content-v2/characters/character_xue_pan.json";
import v2_xue_yima from "../../docs/knowledge-base/content-v2/characters/character_xue_yima.json";
import v2_xueyan from "../../docs/knowledge-base/content-v2/characters/character_xueyan.json";
import v2_ying_er from "../../docs/knowledge-base/content-v2/characters/character_ying_er.json";
import v2_you_shi from "../../docs/knowledge-base/content-v2/characters/character_you_shi.json";
import v2_yuanyang from "../../docs/knowledge-base/content-v2/characters/character_yuanyang.json";
import v2_zhao_yiniang from "../../docs/knowledge-base/content-v2/characters/character_zhao_yiniang.json";
import v2_zhen_baoyu from "../../docs/knowledge-base/content-v2/characters/character_zhen_baoyu.json";
import v2_zhen_shiyin from "../../docs/knowledge-base/content-v2/characters/character_zhen_shiyin.json";
import v2_zhi_neng_er from "../../docs/knowledge-base/content-v2/characters/character_zhi_neng_er.json";
import v2_caixia from "../../docs/knowledge-base/content-v2/characters/character_caixia.json";
import v2_chunyan from "../../docs/knowledge-base/content-v2/characters/character_chunyan.json";
import v2_fangguan from "../../docs/knowledge-base/content-v2/characters/character_fangguan.json";
import v2_jia_qiang from "../../docs/knowledge-base/content-v2/characters/character_jia_qiang.json";
import v2_jinghuan_xianzi from "../../docs/knowledge-base/content-v2/characters/character_jinghuan_xianzi.json";
import v2_leng_zixing from "../../docs/knowledge-base/content-v2/characters/character_leng_zixing.json";
import v2_liu_wuer from "../../docs/knowledge-base/content-v2/characters/character_liu_wuer.json";
import v2_liu_xianglian from "../../docs/knowledge-base/content-v2/characters/character_liu_xianglian.json";
import v2_ming_yan from "../../docs/knowledge-base/content-v2/characters/character_ming_yan.json";
import v2_pan_youan from "../../docs/knowledge-base/content-v2/characters/character_pan_youan.json";
import v2_qiuwen from "../../docs/knowledge-base/content-v2/characters/character_qiuwen.json";
import v2_sha_dajie from "../../docs/knowledge-base/content-v2/characters/character_sha_dajie.json";
import v2_siqi from "../../docs/knowledge-base/content-v2/characters/character_siqi.json";
import v2_wang_shanbao from "../../docs/knowledge-base/content-v2/characters/character_wang_shanbao.json";
import v2_xia_jingui from "../../docs/knowledge-base/content-v2/characters/character_xia_jingui.json";
import v2_xing_xiuyan from "../../docs/knowledge-base/content-v2/characters/character_xing_xiuyan.json";
import v2_xue_baoqin from "../../docs/knowledge-base/content-v2/characters/character_xue_baoqin.json";
import v2_xue_ke from "../../docs/knowledge-base/content-v2/characters/character_xue_ke.json";
import v2_you_erjie from "../../docs/knowledge-base/content-v2/characters/character_you_erjie.json";
import v2_you_sanjie from "../../docs/knowledge-base/content-v2/characters/character_you_sanjie.json";
import v2_baodan from "../../docs/knowledge-base/content-v2/characters/character_baodan.json";
import v2_dengguniang from "../../docs/knowledge-base/content-v2/characters/character_dengguniang.json";
import v2_li_momo from "../../docs/knowledge-base/content-v2/characters/character_li_momo.json";
import v2_ouguan from "../../docs/knowledge-base/content-v2/characters/character_ouguan.json";
import v2_ruiguan from "../../docs/knowledge-base/content-v2/characters/character_ruiguan.json";
import v2_wang_ziteng from "../../docs/knowledge-base/content-v2/characters/character_wang_ziteng.json";

interface ContentFile {
  character: Character;
  events?: Event[];
  relationships?: Relationship[];
  sources?: Source[];
  viewpoints?: Viewpoint[];
  questions?: RawCharQuestion[];
  poems?: RawCharPoem[];
}

/** 人物档案内嵌的问题（与 questions.json 不同：更聚焦该人物） */
interface RawCharQuestion {
  id: string;
  title: string;
  slug?: string;
  question_type?: string;
  importance_weight?: number;
  heat_weight?: number;
  neutral_overview?: string;
  viewpoint_ids?: string[];
  fact_type?: string;
  viewpoints?: {
    id: string;
    title: string;
    summary?: string;
    evidence?: string[];
    fact_type?: string;
  }[];
}

/** 人物档案内嵌的诗词 */
interface RawCharPoem {
  id: string;
  title: string;
  work_type?: string;
  chapter_number?: number | null;
  summary?: string;
  symbolic_notes?: string;
  fact_type?: string;
}

/** 内容侧 id 与既有档案 id 的归一化映射 */
const ID_NORMALIZE: Record<string, string> = {
  character_jia_mu: "character_jiamu",
  character_wang_furen: "character_wangfuren",
  character_xi_feng: "character_wang_xifeng",
  character_pinger: "character_ping_er",
  character_liu_laolao: "character_liu_laolao",
  character_jia_baoyu: "character_jia_baoyu",
  character_lin_daiyu: "character_lin_daiyu",
  character_xue_baochai: "character_xue_baochai",
  character_jiahuan: "character_jia_huan",
  character_tan_chun: "character_jia_tanchun",
  character_jin_chuan: "character_jinchuan",
  character_ling_guan: "character_lingguan",
  character_miaoyu: "character_miao_yu",
  character_qing_wen: "character_qingwen",
  character_xiang_ling: "character_xiangling",
  character_you_er_jie: "character_you_erjie",
  character_yu_chuan: "character_yuchuan",
  character_yuan_yang: "character_yuanyang",
  character_zhi_nenger: "character_zhi_neng_er",
  character_zhaoyiniang: "character_zhao_yiniang",
  character_ruhua: "character_ru_hua",
  character_baner: "character_ban_er",
  character_you_furen: "character_you_shi",
  character_wang_shanbao_jia: "character_wang_shanbao",
  character_zhang_daoshi: "character_zhang_dao_shi",
  character_ruixiang: "character_ruizhu",
  character_yu_yang: "character_yuanyang",
  character_xuanzhen: "character_xuanzhen_daoists",
  character_bodao_daoren: "character_lame_daoist",
  character_fang_guan: "character_fangguan",
  character_jing_huan: "character_jinghuan_xianzi",
  character_qiu_wen: "character_qiuwen",
  character_si_qi: "character_siqi",
  character_xia_jin_gui: "character_xia_jingui",
  character_bao_qin: "character_xue_baoqin",
  character_baochan: "character_baodan",
  character_ou_guan: "character_ouguan",
};

export 
function normalizeId(id: string): string {
  return ID_NORMALIZE[id] ?? id;
}

const contentFiles: ContentFile[] = [
  c_lin_daiyu,
  c_xue_baochai,
  c_jia_yuanchun,
  c_jia_tanchun,
  c_shi_xiangyun,
  c_miao_yu,
  c_jia_yingchun,
  c_jia_xichun,
  c_wang_xifeng,
  c_li_wan,
  c_jia_qiaojie,
  c_qin_keqing,
] as unknown as ContentFile[];

/** v2 档案文件（最后加载，作为最高优先级覆盖层） */
const v2Files: ContentFile[] = [
  v2_jia_baoyu,
  v2_jia_mu,
  v2_jia_qiaojie,
  v2_jia_tanchun,
  v2_jia_xichun,
  v2_jia_yingchun,
  v2_jia_yuanchun,
  v2_li_wan,
  v2_lin_daiyu,
  v2_liu_laolao,
  v2_miao_yu,
  v2_pinger,
  v2_qin_keqing,
  v2_qingwen,
  v2_shi_xiangyun,
  v2_wang_furen,
  v2_wang_xifeng,
  v2_xiren,
  v2_xue_baochai,
  v2_zijuan,
  v2_beijing_wang,
  v2_jia_huan,
  v2_jia_jing,
  v2_jia_lan,
  v2_jia_lian,
  v2_jia_rong,
  v2_jia_rui,
  v2_jia_she,
  v2_jia_yucun,
  v2_jia_yun,
  v2_jia_zhen,
  v2_jia_zheng,
  v2_jiang_yuhan,
  v2_jiao_da,
  v2_jinchuan,
  v2_lin_ruhai,
  v2_lingguan,
  v2_ma_daopo,
  v2_qin_ye,
  v2_qin_zhong,
  v2_sheyue,
  v2_xiangling,
  v2_xiaohong,
  v2_xing_furen,
  v2_xue_pan,
  v2_xue_yima,
  v2_xueyan,
  v2_ying_er,
  v2_you_shi,
  v2_yuanyang,
  v2_zhao_yiniang,
  v2_zhen_baoyu,
  v2_zhen_shiyin,
  v2_zhi_neng_er,
  v2_caixia,
  v2_chunyan,
  v2_fangguan,
  v2_jia_qiang,
  v2_jinghuan_xianzi,
  v2_leng_zixing,
  v2_liu_wuer,
  v2_liu_xianglian,
  v2_ming_yan,
  v2_pan_youan,
  v2_qiuwen,
  v2_sha_dajie,
  v2_siqi,
  v2_wang_shanbao,
  v2_xia_jingui,
  v2_xing_xiuyan,
  v2_xue_baoqin,
  v2_xue_ke,
  v2_you_erjie,
  v2_you_sanjie,
  v2_baodan,
  v2_dengguniang,
  v2_li_momo,
  v2_ouguan,
  v2_ruiguan,
  v2_wang_ziteng,
] as unknown as ContentFile[];

/** 数据文本清洗：数据库生成时把续书作者代码写进了文案（如"（第97-98回，gaoe）"），
 *  统一转为中文；枚举字段（attribution 等）保持原值供逻辑判断。 */
function cleanText(s: string): string {
  return s
    .replace(/attribution=gaoe/g, "续书")
    .replace(/attribution=caoxueqin/g, "前八十回")
    .replace(/gaoe/g, "高鹗续书")
    .replace(/caoxueqin/g, "曹雪芹");
}

const CLEAN_EXCLUDE = new Set(["attribution", "fact_type", "review", "embedding_status"]);

function deepClean(value: unknown): unknown {
  if (typeof value === "string") return cleanText(value);
  if (Array.isArray(value)) return value.map(deepClean);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = CLEAN_EXCLUDE.has(k) ? v : deepClean(v);
    }
    return out;
  }
  return value;
}

const allContentFiles = [...contentFiles, ...v2Files].map(
  (f) => deepClean(f) as ContentFile,
);

/** 被引用但无独立档案的人物 → 显示名映射 */
const REF_NAMES: Record<string, string> = {
  character_jia_zheng: "贾政",
  character_wang_furen: "王夫人",
  character_jia_mu: "贾母",
  character_xueyan: "雪雁",
  character_sun_shaozu: "孙绍祖",
  character_jia_huan: "贾环",
  character_jia_lan: "贾兰",
  character_jia_she: "贾赦",
  character_xing_furen: "邢夫人",
  character_zhao_yiniang: "赵姨娘",
  character_xue_yima: "薛姨妈",
  character_jia_lian: "贾琏",
  character_ping_er: "平儿",
  character_jia_zhen: "贾珍",
  character_you_shi: "尤氏",
  character_you_erjie: "尤二姐",
  character_liu_laolao: "刘姥姥",
  character_jia_rong: "贾蓉",
  character_jia_rui: "贾瑞",
  character_bao_qin: "薛宝琴",
  character_xiang_ling: "香菱",
  character_xia_jin_gui: "夏金桂",
  character_ying_chun_ma: "迎春乳母",
  character_wang_shanbao: "王善保家的",
  character_lao_ni: "老尼",
  character_xiao_hong: "小红",
  character_qiu_tong: "秋桐",
  character_ying_er: "莺儿",
  character_she_yue: "麝月",
  character_qiu_wen: "秋纹",
  character_yuanyang: "鸳鸯",
  character_si_qi: "司棋",
  character_ru_hua: "入画",
  character_cui_lv: "翠缕",
  character_xing_xiuyan: "邢岫烟",
  character_wang_ren: "王仁",
  character_ban_er: "板儿",
  character_qing_er: "青儿",
  character_zhang_dao_shi: "张道士",
  character_sha_dajie: "傻大姐",
  character_bo_ming: "薄命司",
  character_baozhu: "宝珠",
  character_dou_guan: "豆官",
  character_duoguniang: "多姑娘",
  character_fang_guan: "芳官",
  character_feng_shi: "封氏",
  character_feng_su: "封肃",
  character_feng_yuan: "冯渊",
  character_he_san: "何三",
  character_huo_qi: "霍启",
  character_jia_dairu: "贾代儒",
  character_jia_jun: "贾菌",
  character_jia_min: "贾敏",
  character_jia_qiang: "贾蔷",
  character_jia_zhu: "贾珠",
  character_jiao_xing: "娇杏",
  character_jin_rong: "金荣",
  character_jin_wenxiang: "金文翔",
  character_jing_huan: "警幻仙姑",
  character_jingxu: "净虚",
  character_lai_mama: "赖嬷嬷",
  character_lame_daoist: "跛足道人",
  character_leng_zixing: "冷子兴",
  character_li_gui: "李贵",
  character_li_qi: "李绮",
  character_lin_zhixiao: "林之孝",
  character_liu_xianglian: "柳湘莲",
  character_men_zi: "门子",
  character_ming_yan: "茗烟",
  character_ni_er: "倪二",
  character_ning_guo_gong: "宁国公",
  character_ou_guan: "藕官",
  character_ruizhu: "瑞珠",
  character_shidaizi: "石呆子",
  character_wang_gouer: "王狗儿",
  character_wei_ruolan: "卫若兰",
  character_xuanzhen_daoists: "玄真观道士",
  character_yuchuan: "玉钏",
  character_zhang_youshi: "张友士",
  character_zhen_yingjia: "甄应嘉",
  character_zhongshun_wang: "忠顺王",
  character_zhou_rui: "周瑞",
  character_baochan: "宝蟾",
  character_he_pozi: "何婆子",
  character_lianhua_er: "莲花儿",
  character_liu_jia: "柳嫂子",
  character_wu_jinxiao: "乌进孝",
  character_duo_hunchong: "多浑虫",
  character_qianxue: "茜雪",
  character_diguan: "菂官",
};

export function referencedName(id: string): string | undefined {
  return REF_NAMES[id];
}

/** 合并后的人物（content 覆盖 mock） */
export const characters: Record<string, Character> = {
  ...mockCharacters,
};

/** 合并后的事件 */
export const events: Record<string, Event> = {
  ...mockEvents,
};

/** 合并后的关系 */
export const relationships: Record<string, Relationship> = {
  ...mockRelationships,
};

/** 合并后的证据源 */
export const sources: Record<string, Source> = {
  ...mockSources,
};

/** 观点（按人物归档） */
export const viewpointsByCharacter: Record<string, Viewpoint[]> = {};

const contentRelationships: Record<string, Relationship> = {};
const contentSources: Record<string, Source> = {};
const seenRelationshipIds = new Set<string>();
const referencedSourceIds = new Set<string>();

for (const file of allContentFiles) {
  const c = file.character;
  const cid = normalizeId(c.id);
  if (cid !== c.id) {
    c.id = cid;
    c.timeline = (c.timeline ?? []).map((t) => ({
      ...t,
      event_id: t.event_id.startsWith("event_") ? t.event_id : t.event_id,
    }));
    c.sources = (c.sources ?? []).map((s) => ({ ...s }));
  }
  c.related_characters = (c.related_characters ?? []).map((rc) => ({
    ...rc,
    character_id: normalizeId(rc.character_id),
  }));
  characters[cid] = c;

  for (const e of file.events ?? []) {
    e.participants = (e.participants ?? []).map((p) => ({
      ...p,
      character_id: normalizeId(p.character_id),
    }));
    e.evidence = e.evidence ?? [];
    e.interpretations = e.interpretations ?? [];
    e.related_events = e.related_events ?? [];
    e.summary = { short: e.summary?.short ?? e.title, meaning: e.summary?.meaning ?? [] };
    for (const ev of e.evidence) referencedSourceIds.add(normalizeId(ev.source_id));
    events[e.id] = e;
  }

  for (const r of file.relationships ?? []) {
    r.from = normalizeId(r.from);
    r.to = normalizeId(r.to);
    r.stages = r.stages ?? [];
    r.evidence_events = r.evidence_events ?? [];
    r.nature = r.nature ?? [];
    r.impact = r.impact ?? "";
    contentRelationships[r.id] = r;
  }

  for (const s of file.sources ?? []) {
    contentSources[s.id] = s;
    referencedSourceIds.add(s.id);
  }

  if (file.viewpoints?.length) {
    viewpointsByCharacter[cid] = file.viewpoints;
  }
}

// 关系合并：content 覆盖 mock
for (const [id, r] of Object.entries(contentRelationships)) {
  relationships[id] = r;
}

/* ---------- 同对关系去重（数据层合并完成前的界面保底） ----------
 * 同一对人物（不分方向）的多条记录合并为一条：
 *  - 保留证据/阶段最全者（含 id、summary、impact、direction）；
 *  - type 取最具体（最长）者——数据层归一措辞前的唯一线标签；
 *  - 其余记录的 stages/evidence 去重合入，stage 重新编号。 */
function dedupeRelationships(rels: Record<string, Relationship>): void {
  const byPair = new Map<string, Relationship[]>();
  for (const r of Object.values(rels)) {
    const key = [r.from, r.to].sort().join("\u0001");
    const arr = byPair.get(key);
    if (arr) arr.push(r);
    else byPair.set(key, [r]);
  }
  const richness = (r: Relationship) =>
    (r.evidence_events?.length ?? 0) * 10 + (r.stages?.length ?? 0) * 5 + (r.summary?.length ?? 0);

  for (const group of byPair.values()) {
    if (group.length < 2) continue;
    group.sort((a, b) => richness(b) - richness(a));
    const keep = group[0];
    keep.type = group.reduce((best, r) => (r.type.length > best.length ? r.type : best), keep.type);
    const seenStages = new Set(keep.stages.map((s) => s.title));
    const seenEvents = new Set(keep.evidence_events.map((e) => e.event_id));
    for (const r of group.slice(1)) {
      for (const s of r.stages ?? []) {
        if (!seenStages.has(s.title)) {
          keep.stages.push(s);
          seenStages.add(s.title);
        }
      }
      for (const e of r.evidence_events ?? []) {
        if (!seenEvents.has(e.event_id)) {
          keep.evidence_events.push(e);
          seenEvents.add(e.event_id);
        }
      }
      if (!keep.summary && r.summary) keep.summary = r.summary;
      if ((keep.impact?.length ?? 0) < (r.impact?.length ?? 0)) keep.impact = r.impact;
      delete rels[r.id];
    }
    keep.stages = keep.stages.map((s, i) => ({ ...s, stage: i + 1 }));
  }
}
dedupeRelationships(relationships);

// source 合并：content 覆盖 mock
for (const [id, s] of Object.entries(contentSources)) {
  sources[id] = s;
}

/* ---------- 贾政：v2 已补全档案，此处仅保留来源（人工核对） ---------- */
sources["source_ch02_jiazheng"] = {
  id: "source_ch02_jiazheng",
  type: "original_text",
  title: "第二回——冷子兴演说荣国府（贾政出身）",
  chapter_number: 2,
  description: "冷子兴向贾雨村演说荣国府，交代贾政自幼酷喜读书、为人端方正直。",
  author: null,
  year: null,
  authority: "通行本原文",
  controversial: false,
  verification: "通行本第二回，已核对。",
  status: { review: "verified", confidence: 100, updated_at: "2026-08-14T00:00:00Z" },
};

// 兜底：被引用但无定义的 source，从事件证据生成
const seenSources = new Set(Object.keys(sources));for (const sid of referencedSourceIds) {
  if (seenSources.has(sid)) continue;
  sources[sid] = {
    id: sid,
    type: "original_text",
    title: sid,
    chapter_number: null,
    description: "引用来源（自动补录，待内容侧补全 source 记录）",
    author: null,
    year: null,
    authority: "通行本原文",
    controversial: false,
    verification: "由事件证据引用自动补录",
    status: {
      review: "pending",
      confidence: 80,
      updated_at: "2026-08-10T00:00:00Z",
    },
  };
}

// 章节合并：content 120 回覆盖 mock
export const chapters: Record<number, Chapter> = {};
const chapterList = (
  Array.isArray(chaptersData) ? chaptersData : chaptersData.chapters
) as Chapter[];
for (const ch of chapterList) {
  chapters[ch.number] = ch;
}
for (const [n, ch] of Object.entries(mockChapters)) {
  if (!chapters[Number(n)]) chapters[Number(n)] = ch;
}

export const allViewpoints: Viewpoint[] = Object.values(viewpointsByCharacter).flat();

/* ---------- v2 数据：问题 / 地点 / 诗词 ---------- */

import type {
  Question,
  Location,
  KbPoem,
} from "@/lib/types";

interface QuestionsFile {
  questions: Question[];
  meta?: unknown;
}
interface LocationsFile {
  locations: Location[];
  meta?: unknown;
}
interface PoemsFile {
  poems: KbPoem[];
  meta?: unknown;
}

const qFile = questionsRaw as unknown as QuestionsFile;
const lFile = locationsRaw as unknown as LocationsFile;
const pFile = poemsRaw as unknown as PoemsFile;

/** 问题中心：questions.json + 人物档案内嵌问题（后者补全人物视角） */
const globalQuestions: Question[] = (deepClean(qFile.questions ?? []) as Question[]).map((q) => ({
  ...q,
  related_character_ids: (q.related_character_ids ?? []).map(normalizeId),
}));
const seenQuestionIds = new Set(globalQuestions.map((q) => q.id));
const charQuestions: Question[] = [];
for (const file of allContentFiles.slice(contentFiles.length)) {
  const c = file.character;
  const cid = normalizeId(c.id);
  for (const rq of file.questions ?? []) {
    if (!rq.id || seenQuestionIds.has(rq.id)) continue;
    seenQuestionIds.add(rq.id);
    charQuestions.push({
      id: rq.id,
      slug: rq.slug ?? rq.id,
      title: rq.title,
      short_summary: rq.neutral_overview ?? "",
      neutral_overview: rq.neutral_overview ?? "",
      question_type: rq.question_type ?? "character_focus",
      importance_weight: rq.importance_weight ?? 50,
      heat_weight: rq.heat_weight ?? 50,
      related_character_ids: [cid],
      related_event_ids: [],
      related_chapter_ids: [],
      related_location_ids: [],
      viewpoints: (rq.viewpoints ?? []).map((v) => ({
        id: v.id,
        title: v.title,
        summary: "",
        argument_body: [
          v.summary,
          v.evidence?.length ? `证据线索：${v.evidence.join("；")}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        stance_type: "",
        fact_type: v.fact_type ?? "text_inference",
        confidence: 60,
        source_ids: [],
      })),
      evidence: [],
      status: c.status,
    });
  }
}
export const questions: Question[] = [...globalQuestions, ...charQuestions].sort(
  (a, b) => (b.heat_weight ?? 0) - (a.heat_weight ?? 0),
);

/** 热门问题 TOP N */
export function topQuestions(n = 4): Question[] {
  return questions.slice(0, n);
}

/** 某人物相关的问题 */
export function questionsOfCharacter(characterId: string): Question[] {
  return questions.filter((q) => q.related_character_ids?.includes(characterId));
}

/** 全部地点（19 个大观园地点） */
export const locations: Location[] = (deepClean(lFile.locations ?? []) as Location[]).map((l) => ({
  ...l,
  resident_character_ids: (l.resident_character_ids ?? []).map(normalizeId),
}));

/** 诗词库：poems.json + 人物档案内嵌诗词（dedupe by id） */
const globalPoems: KbPoem[] = (deepClean(pFile.poems ?? []) as KbPoem[]).map((p) => ({
  ...p,
  author_character_id: normalizeId(p.author_character_id),
}));
const seenPoemIds = new Set(globalPoems.map((p) => p.id));
const charPoems: KbPoem[] = [];
for (const file of allContentFiles.slice(contentFiles.length)) {
  const c = file.character;
  const cid = normalizeId(c.id);
  for (const rp of file.poems ?? []) {
    if (!rp.id || seenPoemIds.has(rp.id)) continue;
    seenPoemIds.add(rp.id);
    charPoems.push({
      id: rp.id,
      title: rp.title,
      work_type: rp.work_type ?? "诗词",
      author_character_id: cid,
      chapter_id: rp.chapter_number ?? null,
      summary: rp.summary ?? "",
      quote_short: "",
      symbolic_notes: rp.symbolic_notes,
      source_id: undefined,
      status: c.status,
    });
  }
}
export const kbPoems: KbPoem[] = [...globalPoems, ...charPoems];

/** 某人物诗词 */
export function poemsOfCharacter(characterId: string): KbPoem[] {
  return kbPoems.filter((p) => p.author_character_id === characterId);
}

/** 地点详情（首页热区用：潇湘馆/怡红院/蘅芜苑） */
export function getLocation(id: string): Location | undefined {
  return locations.find((l) => l.id === id);
}

/* ---------- 人物年龄考（character-ages.json） ---------- */
interface AgeFile {
  ages: {
    character_id: string;
    name?: string;
    text_anchors?: { chapter?: number | null; evidence?: string; age?: string }[];
    key_stage?: unknown;
  }[];
}

const ageFile = characterAgesRaw as unknown as AgeFile;

/** 人物年龄锚点（character_id → 原文锚点列表） */
export const characterAges: Record<string, AgeFile["ages"][number]> = {};
for (const a of (deepClean(ageFile.ages ?? []) as AgeFile["ages"])) {
  characterAges[normalizeId(a.character_id)] = a;
}

/** 某人物年龄锚点 */
export function agesOfCharacter(characterId: string) {
  return characterAges[characterId];
}
