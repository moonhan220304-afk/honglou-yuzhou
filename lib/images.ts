const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const characterImages: Record<string, string> = {
  character_baodan: `${base}/images/characters/character_baodan.webp`,
  character_jia_baoyu: `${base}/images/characters/character_jia_baoyu.webp`,
  character_jia_huan: `${base}/images/characters/character_jia_huan.webp`,
  character_jia_jing: `${base}/images/characters/character_jia_jing.webp`,
  character_jia_lan: `${base}/images/characters/character_jia_lan.webp`,
  character_jia_lian: `${base}/images/characters/character_jia_lian.webp`,
  character_jia_qiang: `${base}/images/characters/character_jia_qiang.webp`,
  character_jia_qiaojie: `${base}/images/characters/character_jia_qiaojie.webp`,
  character_jia_rong: `${base}/images/characters/character_jia_rong.webp`,
  character_jia_rui: `${base}/images/characters/character_jia_rui.webp`,
  character_jia_she: `${base}/images/characters/character_jia_she.webp`,
  character_jia_tanchun: `${base}/images/characters/character_jia_tanchun.webp`,
  character_jia_xichun: `${base}/images/characters/character_jia_xichun.webp`,
  character_jia_yingchun: `${base}/images/characters/character_jia_yingchun.webp`,
  character_jia_yuanchun: `${base}/images/characters/character_jia_yuanchun.webp`,
  character_jia_yucun: `${base}/images/characters/character_jia_yucun.webp`,
  character_jia_yun: `${base}/images/characters/character_jia_yun.webp`,
  character_jia_zhen: `${base}/images/characters/character_jia_zhen.webp`,
  character_jia_zheng: `${base}/images/characters/character_jia_zheng.webp`,
  character_jiamu: `${base}/images/characters/character_jiamu.webp`,
  character_jiang_yuhan: `${base}/images/characters/character_jiang_yuhan.webp`,
  character_jiao_da: `${base}/images/characters/character_jiao_da.webp`,
  character_jinchuan: `${base}/images/characters/character_jinchuan.webp`,
  character_leng_zixing: `${base}/images/characters/character_leng_zixing.webp`,
  character_li_momo: `${base}/images/characters/character_li_momo.webp`,
  character_li_wan: `${base}/images/characters/character_li_wan.webp`,
  character_lin_daiyu: `${base}/images/characters/character_lin_daiyu.webp`,
  character_lin_ruhai: `${base}/images/characters/character_lin_ruhai.webp`,
  character_liu_laolao: `${base}/images/characters/character_liu_laolao.webp`,
  character_liu_xianglian: `${base}/images/characters/character_liu_xianglian.webp`,
  character_ma_daopo: `${base}/images/characters/character_ma_daopo.webp`,
  character_miao_yu: `${base}/images/characters/character_miao_yu.webp`,
  character_ping_er: `${base}/images/characters/character_ping_er.webp`,
  character_qin_keqing: `${base}/images/characters/character_qin_keqing.webp`,
  character_qingwen: `${base}/images/characters/character_qingwen.webp`,
  character_qiuwen: `${base}/images/characters/character_qiuwen.webp`,
  character_sheyue: `${base}/images/characters/character_sheyue.webp`,
  character_shi_xiangyun: `${base}/images/characters/character_shi_xiangyun.webp`,
  character_wang_shanbao: `${base}/images/characters/character_wang_shanbao.webp`,
  character_wang_xifeng: `${base}/images/characters/character_wang_xifeng.webp`,
  character_wang_ziteng: `${base}/images/characters/character_wang_ziteng.webp`,
  character_wangfuren: `${base}/images/characters/character_wangfuren.webp`,
  character_xia_jingui: `${base}/images/characters/character_xia_jingui.webp`,
  character_xiangling: `${base}/images/characters/character_xiangling.webp`,
  character_xiren: `${base}/images/characters/character_xiren.webp`,
  character_xue_baochai: `${base}/images/characters/character_xue_baochai.webp`,
  character_xue_baoqin: `${base}/images/characters/character_xue_baoqin.webp`,
  character_xue_ke: `${base}/images/characters/character_xue_ke.webp`,
  character_xue_pan: `${base}/images/characters/character_xue_pan.webp`,
  character_xue_yima: `${base}/images/characters/character_xue_yima.webp`,
  character_yuanyang: `${base}/images/characters/character_yuanyang.webp`,
  character_zhen_baoyu: `${base}/images/characters/character_zhen_baoyu.webp`,
  character_zhen_shiyin: `${base}/images/characters/character_zhen_shiyin.webp`,
  character_zijuan: `${base}/images/characters/character_zijuan.webp`,
};

export const sceneImages: Record<string, string> = {
  poem_zanghuayin: `${base}/images/scenes/scene_zanghua.png`,
  poem_baochai_bohaitang: `${base}/images/scenes/scene_haitang_poetry_club.png`,
  poem_daiyu_bohaitang: `${base}/images/scenes/scene_haitang_poetry_club.png`,
  event_read_west_chamber: `${base}/images/scenes/scene_read_west_chamber.png`,
  event_daguanyuan: `${base}/images/scenes/scene_daguanyuan.png`,
};

export const heroImage = `${base}/images/hero/codex-garden-4k.jpg`;
export const heroImageFallback = `${base}/images/hero/hero-garden.jpg`;

/** 诗词配图：按约定路径 public/images/poems/{id}.jpg 查找（GPT/人工生成后放入即自动生效，无需改代码） */
export function poemImage(id: string): string | undefined {
  return `${base}/images/poems/${id}.jpg`;
}

export function characterImage(id: string): string | undefined {
  return characterImages[id];
}
