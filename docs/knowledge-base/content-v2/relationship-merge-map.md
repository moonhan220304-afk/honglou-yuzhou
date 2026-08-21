# 关系合并映射表

> B类（异id双线）80对 + A类（同id双份）12对 + 特殊删除 1条
> 规则：保留信息更全的一条，type/nature/direction 归一，其余删除。

## B类（异 id 双线 → 合并为一条）

| # | 配对 | 保留 id | 删除 id | 归一 type | direction |
|---|------|---------|---------|-----------|-----------|
| 1 | fangguan ↔ liu_wuer | relationship_liu_wuer_fangguan | relationship_fangguan_liu_wuer | 好友（赠露之谊） | mutual |
| 2 | jia_baoyu ↔ jia_zheng | relationship_jiazheng_baoyu | relationship_jia_zheng_baoyu | 父子（严教与叛逆） | mutual |
| 3 | jia_baoyu ↔ xiren | relationship_xiren_jia_baoyu | relationship_jia_baoyu_xiren | 主仆（事实上的妾） | mutual |
| 4 | jia_baoyu ↔ jia_tanchun | relationship_jia_baoyu_jia_tanchun | relationship_jia_tanchun_jia_baoyu | 同父异母兄妹 | mutual |
| 5 | jia_baoyu ↔ qin_zhong | relationship_qinzhong_baoyu | relationship_jia_baoyu_qin_zhong | 挚友（少年知己） | mutual |
| 6 | jia_baoyu ↔ jiang_yuhan | relationship_jiang_yuhan_jia_baoyu | relationship_jia_baoyu_jiang_yuhan | 知己（互赠汗巾） | mutual |
| 7 | jia_baoyu ↔ liu_xianglian | relationship_liu_xianglian_jia_baoyu | relationship_jia_baoyu_liu_xianglian | 好友 | mutual |
| 8 | jia_huan ↔ zhao_yiniang | relationship_zhao_yiniang_jia_huan | relationship_jia_huan_zhao_yiniang | 母子（互相拖累） | mutual |
| 9 | jia_huan ↔ jia_tanchun | relationship_jia_huan_jia_tanchun | relationship_jia_tanchun_jia_huan | 同母姐弟 | mutual |
| 10 | jia_jing ↔ jia_zhen | relationship_jiazhen_jia_jing | relationship_jiajing_jia_zhen | 父子（弃养与被弃） | mutual |
| 11 | jia_lan ↔ li_wan | relationship_jialan_li_wan | relationship_liwan_jia_lan | 母子（课子与成才） | mutual |
| 12 | jia_lian ↔ wang_xifeng | relationship_jialian_wang_xifeng | relationship_wang_xifeng_jia_lian | 夫妻（琏凤体制） | mutual |
| 13 | jia_lian ↔ you_erjie | relationship_jialian_you_erjie | relationship_you_erjie_jia_lian | 偷娶之妾 | mutual |
| 14 | jia_lian ↔ jia_she | relationship_jiashe_jia_lian | relationship_jialian_jia_she | 父子（利用与轻慢） | mutual |
| 15 | jia_mu ↔ xue_baochai | relationship_jia_mu_xue_baochai | relationship_xue_baochai_jia_mu | 祖辈与客居小姐 | mutual |
| 16 | jia_mu ↔ wang_furen | relationship_jia_mu_wang_furen | relationship_wang_furen_jia_mu | 婆媳（权力暗战） | mutual |
| 17 | jia_mu ↔ wang_xifeng | relationship_jia_mu_wang_xifeng | relationship_wang_xifeng_jia_mu | 祖孙媳（宠臣同盟） | mutual |
| 18 | jia_mu ↔ jia_zheng | relationship_jiazheng_jia_mu | relationship_jia_mu_jia_zheng | 母子（孝道与宝玉之争） | mutual |
| 19 | jia_mu ↔ liu_laolao | relationship_liulaolao_jia_mu | relationship_jia_mu_liu_laolao | 主客（两个世界的老人） | mutual |
| 20 | jia_mu ↔ jia_she | relationship_jiashe_jia_mu | relationship_jia_mu_jia_she | 母子（怨怼的孝） | mutual |
| 21 | jia_qiang ↔ lingguan | relationship_lingguan_jia_qiang | relationship_jia_qiang_lingguan | 恋人 | mutual |
| 22 | jia_qiang ↔ ming_yan | relationship_mingyan_jia_qiang | relationship_jia_qiang_mingyan | 利用者与被利用者（闹学堂） | mutual |
| 23 | jia_qiaojie ↔ wang_xifeng | relationship_qiaojie_wang_xifeng | relationship_wang_xifeng_qiaojie | 母女 | mutual |
| 24 | jia_qiaojie ↔ liu_laolao | relationship_qiaojie_liu_laolao | relationship_liulaolao_jia_qiaojie | 恩人（命名与解救） | mutual |
| 25 | jia_qiaojie ↔ pinger | relationship_qiaojie_pinger | relationship_pinger_jia_qiaojie | 庇护者（护孤） | mutual |
| 26 | jia_rong ↔ jia_zhen | relationship_jiarong_jia_zhen | relationship_jiazhen_jia_rong | 父子（碾压与聚麀） | mutual |
| 27 | jia_rong ↔ qin_keqing | relationship_jiarong_qin_keqing | relationship_jia_rong_qin_keqing | 夫妻（名存实亡） | mutual |
| 28 | jia_she ↔ jia_yingchun | relationship_jiashe_jia_yingchun | relationship_yingchun_jia_she | 父女（抵债弃女） | one-way |
| 29 | jia_she ↔ yuanyang | relationship_jiashe_yuanyang | relationship_yuanyang_jia_she | 逼婚者与抗婚者 | one-way |
| 30 | jia_she ↔ jia_yucun | relationship_jiashe_jia_yucun | relationship_yucun_jia_she | 狼狈为奸（夺扇同盟） | mutual |
| 31 | jia_she ↔ xing_furen | relationship_jiashe_xing_furen | relationship_xing_furen_jia_she | 夫妻（懦妻与暴夫） | mutual |
| 32 | jia_tanchun ↔ wang_xifeng | relationship_jia_tanchun_wang_xifeng | relationship_wang_xifeng_jia_tanchun | 姑嫂（合作与戒备） | mutual |
| 33 | jia_tanchun ↔ zhao_yiniang | relationship_jia_tanchun_zhao_yiniang | relationship_zhao_yiniang_jia_tanchun | 生母女（不认的母女） | mutual |
| 34 | jia_tanchun ↔ xue_baochai | relationship_xue_baochai_jia_tanchun | relationship_jia_tanchun_xue_baochai | 表姐妹（理家搭档） | mutual |
| 35 | jia_tanchun ↔ jia_yingchun | relationship_yingchun_jia_tanchun | relationship_jia_tanchun_yingchun | 堂姐妹（保护与被保护） | mutual |
| 36 | jia_yuanchun ↔ jia_zheng | relationship_jiazheng_jia_yuanchun | relationship_yuanchun_jiafu_politics、relationship_yuanchun_jia_zheng | 父女（君臣之礼下的天伦） | mutual |
| 37 | jia_yucun ↔ zhen_shiyin | relationship_zhen_yucun | relationship_yucun_zhen_shiyin | 恩主与受恩者（知遇与负义） | mutual |
| 38 | jia_yucun ↔ jia_zheng | relationship_jiazheng_jia_yucun | relationship_yucun_jia_zheng | 政治同盟（受荐与反咬） | mutual |
| 39 | jia_yun ↔ xiaohong | relationship_xiaohong_jia_yun | relationship_jia_yun_xiaohong | 恋人（遗帕定情） | mutual |
| 40 | jia_zhen ↔ qin_keqing | relationship_jia_zhen_qin_keqing | relationship_jiazhen_qin_keqing | 公媳（乱伦暗线·隐写） | mutual |
| 41 | jia_zheng ↔ wang_furen | relationship_jiazheng_wang_furen | relationship_wang_furen_jia_zheng | 夫妻（相敬而疏） | mutual |
| 42 | jia_zheng ↔ zhao_yiniang | relationship_jiazheng_zhao_yiniang | relationship_zhao_yiniang_jia_zheng | 夫妾（相看两厌） | mutual |
| 43 | jiang_yuhan ↔ xiren | relationship_jiang_yuhan_xiren | relationship_xiren_jiang_yuhan | 夫妻（汗巾前定的姻缘） | mutual |
| 44 | jinchuan ↔ wang_furen | relationship_wang_furen_jinchuan | relationship_jinchuan_wang_furen | 主仆（驱逐与被驱逐） | mutual |
| 45 | lin_daiyu ↔ zijuan | relationship_zijuan_lin_daiyu | relationship_lin_daiyu_zijuan | 主仆（情同姐妹） | mutual |
| 46 | lin_daiyu ↔ xue_yima | relationship_xue_yima_lin_daiyu | relationship_lin_daiyu_xue_yima | 干亲（慈与算） | mutual |
| 47 | liu_laolao ↔ wang_xifeng | relationship_liulaolao_wang_xifeng | relationship_wang_xifeng_liu_laolao | 施舍与托孤（因果两端） | mutual |
| 48 | liu_xianglian ↔ you_sanjie | relationship_you_sanjie_liu_xianglian | relationship_liu_xianglian_you_sanjie | 定亲→悔婚（痴情与悔恨） | mutual |
| 49 | liu_xianglian ↔ xue_pan | relationship_xue_pan_liu_xianglian | relationship_liu_xianglian_xue_pan | 仇人→结义兄弟 | mutual |
| 50 | ma_daopo ↔ zhao_yiniang | relationship_ma_daopo_zhao_yiniang | relationship_zhao_yiniang_ma_daopo | 共谋（巫蛊交易） | mutual |
| 51 | miao_yu ↔ shi_xiangyun | relationship_miao_yu_shi_xiangyun | relationship_miaoyu_xiangyun | 诗友（凹晶馆联诗） | mutual |
| 52 | miao_yu ↔ xing_xiuyan | relationship_miaoyu_xingxiuyan | relationship_xing_xiuyan_miao_yu | 半师半友 | mutual |
| 53 | ouguan ↔ ruiguan | relationship_ouguan_ruiguan | relationship_ruiguan_ouguan | 恋人（补缺续情） | mutual |
| 54 | pan_youan ↔ siqi | relationship_siqi_panyouan | relationship_panyouan_siqi | 恋人（表姐弟私情） | mutual |
| 55 | pinger ↔ you_erjie | relationship_pinger_you_erjie | relationship_you_erjie_pinger | 怜护（施恩与受惠） | mutual |
| 56 | qin_keqing ↔ qin_zhong | relationship_qinzhong_qin_keqing | relationship_qin_zhong_qin_keqing | 养姐弟 | mutual |
| 57 | qin_ye ↔ qin_zhong | relationship_qin_ye_qin_zhong | relationship_qinzhong_qin_ye | 父子（寒门赌注） | mutual |
| 58 | qin_ye ↔ zhi_neng_er | relationship_qin_ye_zhi_neng_er | relationship_zhi_neng_er_qin_ye | 驱逐者与被驱逐者 | one-way |
| 59 | qingwen ↔ xiren | relationship_xiren_qingwen | relationship_qingwen_xiren | 同侪（贤与真的对照） | mutual |
| 60 | siqi ↔ yuanyang | relationship_yuanyang_siqi | relationship_siqi_yuanyang | 撞破与遮掩（守护与私情） | mutual |
| 61 | siqi ↔ wang_shanbao | relationship_siqi_wangshanbao | relationship_wang_shanbao_siqi | 祖孙（抄检自抄） | mutual |
| 62 | wang_furen ↔ xue_baochai | relationship_wang_furen_xue_baochai | relationship_xue_baochai_wang_furen | 姨母与外甥女（金玉同盟） | mutual |
| 63 | wang_furen ↔ xue_yima | relationship_xue_yima_wang_furen | relationship_wang_furen_xue_yima | 亲姊妹（金玉同盟） | mutual |
| 64 | wang_furen ↔ wang_xifeng | relationship_wang_xifeng_wang_furen | relationship_wang_furen_wang_xifeng | 姑侄（权力委托） | mutual |
| 65 | wang_furen ↔ xiren | relationship_wang_furen_xiren | relationship_xiren_wang_furen | 主仆同盟（赏识与进言） | mutual |
| 66 | wang_furen ↔ zhao_yiniang | relationship_zhao_yiniang_wang_furen | relationship_wang_furen_zhao_yiniang | 妻妾对立 | mutual |
| 67 | wang_xifeng ↔ you_erjie | relationship_you_erjie_wang_xifeng | relationship_wang_xifeng_you_erjie | 加害者与受害者（连环计） | one-way |
| 68 | xia_jingui ↔ xiangling | relationship_xiangling_xia_jingui | relationship_xia_jingui_xiangling | 迫害者与受害者（夺名借刀） | one-way |
| 69 | xia_jingui ↔ xue_pan | relationship_xue_pan_xia_jingui | relationship_xia_jingui_xue_pan | 夫妻（辖制与反噬） | mutual |
| 70 | xiangling ↔ zhen_shiyin | relationship_zhen_yinglian | relationship_xiangling_zhen_shiyin | 父女（失散之缘） | mutual |
| 71 | xiangling ↔ xue_pan | relationship_xiangling_xue_pan | relationship_xue_pan_xiangling | 强占者与受害者（妾与夫） | one-way |
| 72 | xing_furen ↔ xing_xiuyan | relationship_xing_furen_xing_xiuyan | relationship_xing_xiuyan_xing_furen | 姑侄（克扣与依附） | mutual |
| 73 | xing_xiuyan ↔ xue_ke | relationship_xue_ke_xing_xiuyan | relationship_xing_xiuyan_xue_ke | 未婚夫妻（忠厚配端雅） | mutual |
| 74 | xue_baochai ↔ xue_yima | relationship_xue_yima_xue_baochai | relationship_xue_baochai_xue_yima | 母女 | mutual |
| 75 | xue_baochai ↔ xue_pan | relationship_xue_pan_xue_baochai | relationship_xue_baochai_xue_pan | 兄妹（贤与浑的对照） | mutual |
| 76 | xue_baochai ↔ ying_er | relationship_ying_er_xue_baochai | relationship_xue_baochai_ying_er | 主仆 | mutual |
| 77 | xue_baoqin ↔ xue_ke | relationship_xue_ke_xue_baoqin | relationship_xue_baoqin_xue_ke | 胞兄妹（进京聘嫁） | mutual |
| 78 | xue_pan ↔ xue_yima | relationship_xue_yima_xue_pan | relationship_xue_pan_xue_yima | 母子（溺爱与拖累） | mutual |
| 79 | xueyan ↔ zijuan | relationship_xueyan_zijuan | relationship_zijuan_xueyan | 同侪（潇湘馆搭档） | mutual |
| 80 | you_erjie ↔ you_sanjie | relationship_you_erjie_you_sanjie | relationship_you_sanjie_you_erjie | 姐妹（护姐与托梦） | mutual |

## A类（同 id 存两份 → 保留一份）

| # | 配对 | 保留 id | 保留档 | 删除档 |
|---|------|---------|--------|--------|
| 1 | jia_baoyu ↔ lin_daiyu | relationship_lin_daiyu_jia_baoyu | character_jia_baoyu | character_lin_daiyu |
| 2 | jia_baoyu ↔ xue_baochai | relationship_xue_baochai_jia_baoyu | character_jia_baoyu | character_xue_baochai |
| 3 | jia_baoyu ↔ jia_mu | relationship_jia_mu_baoyu | character_jia_mu | character_jia_baoyu |
| 4 | jia_baoyu ↔ wang_furen | relationship_wang_furen_baoyu | character_wang_furen | character_jia_baoyu |
| 5 | jia_baoyu ↔ shi_xiangyun | relationship_jia_baoyu_shi_xiangyun | character_shi_xiangyun | character_jia_baoyu |
| 6 | jia_mu ↔ lin_daiyu | relationship_jia_mu_lin_daiyu | character_jia_mu | character_lin_daiyu |
| 7 | jia_mu ↔ shi_xiangyun | relationship_jia_mu_shi_xiangyun | character_shi_xiangyun | character_jia_mu |
| 8 | lin_daiyu ↔ xue_baochai | relationship_lin_daiyu_xue_baochai | character_xue_baochai | character_lin_daiyu |
| 9 | lin_daiyu ↔ wang_furen | relationship_wang_furen_lin_daiyu | character_wang_furen | character_lin_daiyu |
| 10 | lin_daiyu ↔ shi_xiangyun | relationship_lin_daiyu_shi_xiangyun | character_shi_xiangyun | character_lin_daiyu |
| 11 | qin_keqing ↔ qin_ye | relationship_qin_ye_qin_keqing | character_qin_ye | character_qin_keqing |
| 12 | shi_xiangyun ↔ xue_baochai | relationship_xue_baochai_shi_xiangyun | character_shi_xiangyun | character_xue_baochai |

## 特殊删除

| 配对 | 删除 id | 原因 |
|------|---------|------|
| jia_yuanchun ↔ jia_zheng | relationship_yuanchun_jiafu_politics | 实为「元春↔贾府」政治依附关系，误挂贾政；其描述信息并入元春人物档案，不作为独立关系 |

## 合并执行方式

1. 按表删除 drop 记录；
2. keep 记录：type→merged_type、direction→merged_direction、nature→merged_nature；
3. 把 drop 记录中独有（keep 中没有的）stages/evidence_events/impact 并入 keep；
4. C类措辞已包含在 merged_type 中一并归一。
