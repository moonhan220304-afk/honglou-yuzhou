import { characters, relationships } from "@/lib/data";

/** 视口 1200 × 820 */
export const VIEW_W = 1200;
export const VIEW_H = 820;

/** 居所分区（背景雾色区域 + 水印名） */
export const ZONES: {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}[] = [
  { id: "rongguofu", name: "荣国府", x: 360, y: 28, w: 470, h: 150 },
  { id: "xiaoxiangguan", name: "潇湘馆", x: 250, y: 230, w: 310, h: 190 },
  { id: "yihongyuan", name: "怡红院", x: 620, y: 230, w: 330, h: 200 },
  { id: "hengwuyuan", name: "蘅芜苑", x: 890, y: 110, w: 230, h: 170 },
  { id: "longcuian", name: "栊翠庵", x: 120, y: 120, w: 200, h: 160 },
  { id: "qiushuangzhai", name: "秋爽斋", x: 980, y: 290, w: 190, h: 150 },
  { id: "daoxiangcun", name: "稻香村", x: 540, y: 560, w: 250, h: 160 },
  { id: "fengjie", name: "凤姐院", x: 830, y: 520, w: 260, h: 180 },
  { id: "ningguofu", name: "东府", x: 90, y: 480, w: 200, h: 170 },
];

/** 人物坐标（手写布局，按居所分组） */
export const NODE_POS: Record<string, [number, number]> = {
  character_jiamu: [590, 100],
  character_wangfuren: [766, 128],
  character_lin_daiyu: [410, 320],
  character_zijuan: [292, 360],
  character_jia_baoyu: [700, 330],
  character_xiren: [806, 288],
  character_qingwen: [900, 398],
  character_xue_baochai: [984, 190],
  character_miao_yu: [206, 200],
  character_jia_tanchun: [1058, 352],
  character_shi_xiangyun: [1106, 556],
  character_jia_yingchun: [150, 470],
  character_jia_xichun: [300, 540],
  character_jia_yuanchun: [420, 62],
  character_wang_xifeng: [856, 570],
  character_jia_qiaojie: [972, 646],
  character_li_wan: [620, 620],
  character_qin_keqing: [172, 560],
  character_jia_zheng: [680, 142],
  character_jia_she: [470, 148],
  character_xing_furen: [540, 172],
  character_zhao_yiniang: [628, 172],
  character_jia_huan: [820, 160],
  character_sheyue: [640, 404],
  character_ying_er: [1080, 172],
  character_xue_pan: [940, 240],
  character_xiangling: [1010, 262],
  character_xue_yima: [890, 250],
  character_lingguan: [1052, 124],
  character_xueyan: [348, 240],
  character_jia_lan: [544, 680],
  character_jia_lian: [842, 660],
  character_xiaohong: [1090, 612],
  character_ping_er: [912, 624],
  character_jia_zhen: [236, 620],
  character_you_shi: [112, 648],
  character_jia_rong: [262, 540],
  character_jia_jing: [102, 510],
  character_jiao_da: [250, 708],
  character_qin_ye: [34, 520],
  character_qin_zhong: [34, 590],
  character_zhen_shiyin: [66, 64],
  character_jia_yucun: [1110, 60],
  character_lin_ruhai: [62, 392],
  character_zhen_baoyu: [1112, 770],
  character_jinchuan: [856, 205],
  character_yuanyang: [560, 208],
  character_zhi_neng_er: [64, 180],
  character_jiang_yuhan: [1120, 320],
  character_jia_rui: [338, 486],
  character_jia_yun: [430, 668],
  character_beijing_wang: [1120, 700],
  character_ma_daopo: [370, 540],
};

/** 关系类型 → 颜色 */
export const TYPE_COLOR: Record<string, string> = {
  情缘: "#A63834",
  姻缘: "#B23A36",
  祖孙: "#B08A4F",
  母子: "#B08A4F",
  兄妹: "#B08A4F",
  表亲: "#B08A4F",
  主仆: "#8A9A9B",
  对照: "#7B6B8E",
  知己: "#9C6B8E",
};

export function typeColor(type: string): string {
  for (const [k, v] of Object.entries(TYPE_COLOR)) {
    if (type.includes(k)) return v;
  }
  return "#A9A29A";
}

/** 边（仅包含有坐标的两个人物） */
export function graphEdges() {
  return Object.values(relationships)
    .map((r) => ({ rel: r, a: NODE_POS[r.from], b: NODE_POS[r.to] }))
    .filter((e) => e.a && e.b);
}

export function graphNodes() {
  return Object.values(characters)
    .map((c) => ({ c, pos: NODE_POS[c.id] }))
    .filter((n) => n.pos);
}
