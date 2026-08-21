const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const characterImages: Record<string, string> = {
  character_baodan: `${base}/images/characters/character_baodan.png`,
  character_jia_baoyu: `${base}/images/characters/character_jia_baoyu.png`,
  character_jia_huan: `${base}/images/characters/character_jia_huan.png`,
  character_jia_jing: `${base}/images/characters/character_jia_jing.png`,
  character_jia_lan: `${base}/images/characters/character_jia_lan.png`,
  character_jia_lian: `${base}/images/characters/character_jia_lian.png`,
  character_jia_qiang: `${base}/images/characters/character_jia_qiang.png`,
  character_jia_qiaojie: `${base}/images/characters/character_jia_qiaojie.png`,
  character_jia_rong: `${base}/images/characters/character_jia_rong.png`,
  character_jia_rui: `${base}/images/characters/character_jia_rui.png`,
  character_jia_she: `${base}/images/characters/character_jia_she.png`,
  character_jia_tanchun: `${base}/images/characters/character_jia_tanchun.png`,
  character_jia_xichun: `${base}/images/characters/character_jia_xichun.png`,
  character_jia_yingchun: `${base}/images/characters/character_jia_yingchun.png`,
  character_jia_yuanchun: `${base}/images/characters/character_jia_yuanchun.png`,
  character_jia_yucun: `${base}/images/characters/character_jia_yucun.png`,
  character_jia_yun: `${base}/images/characters/character_jia_yun.png`,
  character_jia_zhen: `${base}/images/characters/character_jia_zhen.png`,
  character_jia_zheng: `${base}/images/characters/character_jia_zheng.png`,
  character_jiamu: `${base}/images/characters/character_jiamu.png`,
  character_jiang_yuhan: `${base}/images/characters/character_jiang_yuhan.png`,
  character_jiao_da: `${base}/images/characters/character_jiao_da.png`,
  character_jinchuan: `${base}/images/characters/character_jinchuan.png`,
  character_leng_zixing: `${base}/images/characters/character_leng_zixing.png`,
  character_li_momo: `${base}/images/characters/character_li_momo.png`,
  character_li_wan: `${base}/images/characters/character_li_wan.png`,
  character_lin_daiyu: `${base}/images/characters/character_lin_daiyu.png`,
  character_lin_ruhai: `${base}/images/characters/character_lin_ruhai.png`,
  character_liu_laolao: `${base}/images/characters/character_liu_laolao.png`,
  character_liu_xianglian: `${base}/images/characters/character_liu_xianglian.png`,
  character_ma_daopo: `${base}/images/characters/character_ma_daopo.png`,
  character_miao_yu: `${base}/images/characters/character_miao_yu.png`,
  character_ping_er: `${base}/images/characters/character_ping_er.png`,
  character_qin_keqing: `${base}/images/characters/character_qin_keqing.png`,
  character_qingwen: `${base}/images/characters/character_qingwen.png`,
  character_qiuwen: `${base}/images/characters/character_qiuwen.png`,
  character_sheyue: `${base}/images/characters/character_sheyue.png`,
  character_shi_xiangyun: `${base}/images/characters/character_shi_xiangyun.png`,
  character_wang_shanbao: `${base}/images/characters/character_wang_shanbao.png`,
  character_wang_xifeng: `${base}/images/characters/character_wang_xifeng.png`,
  character_wang_ziteng: `${base}/images/characters/character_wang_ziteng.png`,
  character_wangfuren: `${base}/images/characters/character_wangfuren.png`,
  character_xia_jingui: `${base}/images/characters/character_xia_jingui.png`,
  character_xiangling: `${base}/images/characters/character_xiangling.png`,
  character_xiren: `${base}/images/characters/character_xiren.png`,
  character_xue_baochai: `${base}/images/characters/character_xue_baochai.png`,
  character_xue_baoqin: `${base}/images/characters/character_xue_baoqin.png`,
  character_xue_ke: `${base}/images/characters/character_xue_ke.png`,
  character_xue_pan: `${base}/images/characters/character_xue_pan.png`,
  character_xue_yima: `${base}/images/characters/character_xue_yima.png`,
  character_yuanyang: `${base}/images/characters/character_yuanyang.png`,
  character_zhen_baoyu: `${base}/images/characters/character_zhen_baoyu.png`,
  character_zhen_shiyin: `${base}/images/characters/character_zhen_shiyin.png`,
  character_zijuan: `${base}/images/characters/character_zijuan.png`,
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
