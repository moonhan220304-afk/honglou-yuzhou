#!/usr/bin/env node
/**
 * 海棠诗社题库种子脚本 —— 诗题(4) / 填字(20) / 飞花接句(10)
 *
 * 用法：
 *   node scripts/seed-poem-society.js [db路径]
 *   不传参默认 honglou-yuzhou/server/data/hlm.db
 *
 * 幂等：可重复执行。
 *   - 先把旧的三类占位题目（kind 为 poem_topic/fill/feihua 且不在新题库中的 active 题）置为 inactive（软删，不物理删除）。
 *   - 再按 (kind, title) 去重：已存在则更新内容/难度/主题/当期标记/时间，不存在则插入。
 *   - 仅保留一个 poem_topic 为当期（is_current=1）。
 *
 * 存储：node:sqlite（与 server/api-server.js 同库），零第三方依赖。
 */

const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = process.argv[2] || path.join(__dirname, "..", "server", "data", "hlm.db");
const now = Date.now();

/* ---------------- 数据（title/content/theme/difficulty/is_current） ----------------
 * 全部取自公开流传的经典诗词与《红楼梦》原书，出处已写入 content 字段。
 * difficulty: beginner=初级 / intermediate=中级 / advanced=高级
 */

/* 一、诗题（poem_topic）：本月 4 期，周更，按难度递进 初→中→中→高 */
const poemTopics = [
  {
    kind: "poem_topic",
    title: "咏荷",
    content:
      "本月第1期诗题（初级）：咏荷——写一首咏荷的诗，可白描荷叶荷花之姿，亦可托物言志。参考：周敦颐《爱莲说》「出淤泥而不染，濯清涟而不妖」；杨万里《晓出净慈寺送林子方》「接天莲叶无穷碧，映日荷花别样红」。体裁不限，格律不限。",
    theme: "咏物",
    difficulty: "beginner",
    is_current: 1,
  },
  {
    kind: "poem_topic",
    title: "咏月",
    content:
      "本月第2期诗题（中级）：咏月——月近中秋，写一首与月有关的诗，可状月、可寄情、可怀人。参考：李白《静夜思》「举头望明月，低头思故乡」；《红楼梦》第四十八回香菱三咏月。体裁不限，格律不限。",
    theme: "咏物",
    difficulty: "intermediate",
    is_current: 0,
  },
  {
    kind: "poem_topic",
    title: "思乡",
    content:
      "本月第3期诗题（中级）：思乡——中秋渐近，写一首思乡怀人之作。参考：王维《九月九日忆山东兄弟》「独在异乡为异客，每逢佳节倍思亲」；张九龄《望月怀远》「海上生明月，天涯共此时」。体裁不限，格律不限。",
    theme: "思乡",
    difficulty: "intermediate",
    is_current: 0,
  },
  {
    kind: "poem_topic",
    title: "咏菊",
    content:
      "本月第4期诗题（高级）：咏菊——重阳咏菊，咏物言志。参考：陶渊明《饮酒》「采菊东篱下，悠然见南山」；《红楼梦》第三十八回菊花诗十二题（忆菊、访菊、种菊、对菊、供菊、咏菊、画菊、问菊、簪菊、菊影、菊梦、残菊）。体裁不限，格律不限。",
    theme: "咏物",
    difficulty: "advanced",
    is_current: 0,
  },
];

/* 二、填字（fill）：20 题，全部出自《红楼梦》原文诗词，难度 初8/中7/高5 */
const fills = [
  { title: "世人都晓［　］好，惟有功名忘不了", theme: "好了歌", difficulty: "beginner", content: "填2字。出自《红楼梦》第一回《好了歌》。" },
  { title: "满纸荒唐言，一把［　］泪", theme: "开篇诗", difficulty: "beginner", content: "填2字。出自《红楼梦》第一回开篇诗。" },
  { title: "假作真时真亦假，无为有处［　］", theme: "太虚幻境联", difficulty: "beginner", content: "填3字。出自《红楼梦》太虚幻境牌坊对联。" },
  { title: "好风凭借力，送我上［　］", theme: "柳絮词", difficulty: "beginner", content: "填2字。出自《红楼梦》第七十回薛宝钗《临江仙·柳絮》。" },
  { title: "寒塘渡鹤影，冷月葬［　］", theme: "凹晶馆联句", difficulty: "beginner", content: "填2字。出自《红楼梦》第七十六回凹晶馆联句（史湘云、林黛玉）。" },
  { title: "玉带林中挂，金簪［　］", theme: "判词", difficulty: "beginner", content: "填3字。出自《红楼梦》第五回金陵十二钗判词。" },
  { title: "秋花惨淡秋草黄，耿耿秋灯［　］", theme: "秋窗风雨夕", difficulty: "beginner", content: "填3字。出自《红楼梦》第四十五回林黛玉《秋窗风雨夕》。" },
  { title: "一畦春韭绿，十里［　］", theme: "杏帘在望", difficulty: "beginner", content: "填3字。出自《红楼梦》第十八回林黛玉《杏帘在望》。" },
  { title: "偷来梨蕊［　］，借得梅花一缕魂", theme: "咏白海棠", difficulty: "intermediate", content: "填3字。出自《红楼梦》第三十七回林黛玉《咏白海棠》。" },
  { title: "淡极始知［　］，愁多焉得玉无痕", theme: "咏白海棠", difficulty: "intermediate", content: "填3字。出自《红楼梦》第三十七回薛宝钗《咏白海棠》。" },
  { title: "毫端蕴秀临霜写，口齿噙香［　］", theme: "咏菊", difficulty: "intermediate", content: "填3字。出自《红楼梦》第三十八回林黛玉《咏菊》。" },
  { title: "孤标傲世［　］，一样花开为底迟", theme: "问菊", difficulty: "intermediate", content: "填3字。出自《红楼梦》第三十八回林黛玉《问菊》。" },
  { title: "眼空蓄泪［　］，暗洒闲抛却为谁", theme: "题帕三绝", difficulty: "intermediate", content: "填3字。出自《红楼梦》第三十四回林黛玉《题帕三绝》。" },
  { title: "若将人泪［　］，泪自长流花自媚", theme: "桃花行", difficulty: "intermediate", content: "填3字。出自《红楼梦》第七十回林黛玉《桃花行》。" },
  { title: "半卷湘帘［　］，碾冰为土玉为盆", theme: "咏白海棠", difficulty: "intermediate", content: "填3字。出自《红楼梦》第三十七回林黛玉《咏白海棠》。" },
  { title: "玉在椟中求善价，钗于奁内［　］", theme: "中秋联句", difficulty: "advanced", content: "填3字。出自《红楼梦》第一回贾雨村中秋联句。" },
  { title: "秋阴捧出［　］，雨渍添来隔宿痕", theme: "咏白海棠", difficulty: "advanced", content: "填3字。出自《红楼梦》第三十七回史湘云《咏白海棠》其二。" },
  { title: "欲洁何曾洁，云空［　］", theme: "判词", difficulty: "advanced", content: "填3字。出自《红楼梦》第五回妙玉判词。" },
  { title: "无故寻愁觅恨，有时［　］", theme: "西江月", difficulty: "advanced", content: "填4字。出自《红楼梦》第三回《西江月》评宝玉。" },
  { title: "衔山抱水建来精，多少工夫［　］", theme: "大观园题咏", difficulty: "advanced", content: "填3字。出自《红楼梦》第十八回贾元春《题大观园》。" },
].map((f) => ({ kind: "fill", is_current: 0, ...f }));

/* 三、飞花接句（feihua）：10 条，常见诗词上句，难度 初4/中4/高2 */
const feihuas = [
  { title: "春眠不觉晓", theme: "春", difficulty: "beginner", content: "接下句。出处：孟浩然《春晓》。" },
  { title: "举头望明月", theme: "月", difficulty: "beginner", content: "接下句。出处：李白《静夜思》。" },
  { title: "欲穷千里目", theme: "登高", difficulty: "beginner", content: "接下句。出处：王之涣《登鹳雀楼》。" },
  { title: "海内存知己", theme: "送别", difficulty: "beginner", content: "接下句。出处：王勃《送杜少府之任蜀州》。" },
  { title: "会当凌绝顶", theme: "登高", difficulty: "intermediate", content: "接下句。出处：杜甫《望岳》。" },
  { title: "长风破浪会有时", theme: "励志", difficulty: "intermediate", content: "接下句。出处：李白《行路难·其一》。" },
  { title: "身无彩凤双飞翼", theme: "情", difficulty: "intermediate", content: "接下句。出处：李商隐《无题》。" },
  { title: "海上生明月", theme: "月", difficulty: "intermediate", content: "接下句。出处：张九龄《望月怀远》。" },
  { title: "抽刀断水水更流", theme: "愁", difficulty: "advanced", content: "接下句。出处：李白《宣州谢朓楼饯别校书叔云》。" },
  { title: "问渠那得清如许", theme: "哲理", difficulty: "advanced", content: "接下句。出处：朱熹《观书有感》。" },
].map((f) => ({ kind: "feihua", is_current: 0, ...f }));

const NEW = [...poemTopics, ...fills, ...feihuas];
const newKeys = new Set(NEW.map((t) => `${t.kind}\u0000${t.title}`));

/* ---------- 执行 ---------- */
const db = new DatabaseSync(dbPath);

db.exec("BEGIN");

try {
  /* 1) 软删旧占位题：三类中 active 且不在新题库里的，置 inactive */
  const oldActive = db
    .prepare(
      "SELECT id, kind, title FROM topics WHERE status='active' AND kind IN ('poem_topic','fill','feihua')",
    )
    .all();
  let deactivated = 0;
  for (const o of oldActive) {
    if (!newKeys.has(`${o.kind}\u0000${o.title}`)) {
      db.prepare("UPDATE topics SET status='inactive' WHERE id=?").run(o.id);
      deactivated++;
    }
  }

  /* 2) 当期诗题唯一：先把所有诗题 is_current 清零 */
  db.prepare("UPDATE topics SET is_current=0 WHERE kind='poem_topic'").run();

  /* 3) 按 (kind,title) upsert 新题，created_at 单调递减保证列表顺序 */
  let inserted = 0;
  let updated = 0;
  const upsertTopic = db.prepare(
    `UPDATE topics SET content=?, theme=?, difficulty=?, status='active', is_current=?, created_at=? WHERE id=?`,
  );
  const insertTopic = db.prepare(
    `INSERT INTO topics (kind,title,content,theme,difficulty,status,is_current,like_count,created_at)
     VALUES (?,?,?,?,?,'active',?,0,?)`,
  );

  NEW.forEach((t, i) => {
    const createdAt = now - i * 1000;
    const existing = db
      .prepare("SELECT id FROM topics WHERE kind=? AND title=?")
      .get(t.kind, t.title);
    if (existing) {
      upsertTopic.run(t.content, t.theme, t.difficulty, t.is_current, createdAt, existing.id);
      updated++;
    } else {
      insertTopic.run(t.kind, t.title, t.content, t.theme, t.difficulty, t.is_current, createdAt);
      inserted++;
    }
  });

  db.exec("COMMIT");

  const stats = db
    .prepare(
      "SELECT kind, COUNT(*) c FROM topics WHERE status='active' GROUP BY kind ORDER BY kind",
    )
    .all();
  const currentTopic = db
    .prepare("SELECT id,title FROM topics WHERE kind='poem_topic' AND is_current=1 AND status='active'")
    .get();

  console.log(`[seed-poem-society] 完成 → db=${dbPath}`);
  console.log(`  软删旧占位题 ${deactivated} 条；新增 ${inserted} 条；更新 ${updated} 条`);
  console.log(`  active 题库分布：${JSON.stringify(stats)}`);
  console.log(`  当期诗题：${currentTopic ? `#${currentTopic.id} ${currentTopic.title}` : "（无）"}`);
} catch (err) {
  db.exec("ROLLBACK");
  throw err;
} finally {
  db.close();
}
