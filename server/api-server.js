/**
 * 红楼宇宙 · 轻量数据服务（零依赖，纯 Node http + node:sqlite）
 * 功能：访问统计 / 内容反馈 / 管理后台 / 社区（注册·登录·邀请码·发帖·盖楼·审核·上传）
 *       / 观点点赞（问题页红学家观点，viewpoint_likes）/ 评论点赞（comment_likes）
 *       / 发帖引用红学家观点（posts.quote JSON 字段）
 * 存储：JSONL 追加写（track/feedback/health）+ SQLite（users/posts/comments）
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const PORT = process.env.PORT || 4000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
const ADMIN_KEY = process.env.ADMIN_KEY || "honglou-2026";
const SESSION_DAYS = 30;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ---------- SQLite ---------- */
const db = new DatabaseSync(path.join(DATA_DIR, "hlm.db"));
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS invite_codes (
  code TEXT PRIMARY KEY,
  note TEXT NOT NULL DEFAULT '',
  used_by INTEGER,
  created_at INTEGER NOT NULL,
  used_at INTEGER
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT '自由讨论',
  images TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  like_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER,
  reviewed_by INTEGER
);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  reply_to INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS likes (
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, post_id)
);
CREATE TABLE IF NOT EXISTS viewpoint_likes (
  user_id INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  viewpoint_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, question_id, viewpoint_id)
);
CREATE TABLE IF NOT EXISTS comment_likes (
  user_id INTEGER NOT NULL,
  comment_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, comment_id)
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  from_user_id INTEGER,
  post_id INTEGER,
  comment_id INTEGER,
  question_id TEXT,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  read INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE TABLE IF NOT EXISTS test_results (
  user_id INTEGER PRIMARY KEY,
  archetype_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_test_results_type ON test_results(archetype_id);
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  username TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_exp ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
`);
/* 迁移：posts 增加 question_id（问题页内嵌讨论区关联） */
const postCols = db.prepare("PRAGMA table_info(posts)").all().map((c) => c.name);
if (!postCols.includes("question_id")) {
  db.exec("ALTER TABLE posts ADD COLUMN question_id INTEGER");
}
/* 迁移：posts 增加 quote（引用的红学家观点 JSON，问题页发帖引用） */
if (!postCols.includes("quote")) {
  db.exec("ALTER TABLE posts ADD COLUMN quote TEXT");
}
/* 迁移：comments 增加 like_count（评论点赞计数） */
const commentCols = db.prepare("PRAGMA table_info(comments)").all().map((c) => c.name);
if (!commentCols.includes("like_count")) {
  db.exec("ALTER TABLE comments ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0");
}
db.exec("CREATE INDEX IF NOT EXISTS idx_posts_question ON posts(question_id, status, created_at DESC)");
/* 迁移：users 增加 avatar / signature（个人中心） */
const userCols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
if (!userCols.includes("avatar")) {
  db.exec("ALTER TABLE users ADD COLUMN avatar TEXT");
}
if (!userCols.includes("signature")) {
  db.exec("ALTER TABLE users ADD COLUMN signature TEXT");
}

/* ===== 第二阶段迁移：成长体系 / 关注 / 诗社 / AI 诗评 ===== */
if (!userCols.includes("points")) {
  db.exec("ALTER TABLE users ADD COLUMN points INTEGER NOT NULL DEFAULT 0");
}
if (!userCols.includes("last_checkin")) {
  db.exec("ALTER TABLE users ADD COLUMN last_checkin TEXT");
}
if (!userCols.includes("bg_image")) {
  db.exec("ALTER TABLE users ADD COLUMN bg_image TEXT");
}
if (!postCols.includes("type")) {
  db.exec("ALTER TABLE posts ADD COLUMN type TEXT NOT NULL DEFAULT 'post'");
}
if (!postCols.includes("topic_id")) {
  db.exec("ALTER TABLE posts ADD COLUMN topic_id INTEGER");
}
db.exec(`
CREATE TABLE IF NOT EXISTS points_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_points_log_user ON points_log(user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS follows (
  follower_id INTEGER NOT NULL,
  followee_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (follower_id, followee_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows(followee_id);
CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  theme TEXT,
  difficulty TEXT NOT NULL DEFAULT 'intermediate',
  status TEXT NOT NULL DEFAULT 'active',
  is_current INTEGER NOT NULL DEFAULT 0,
  official INTEGER NOT NULL DEFAULT 1,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_topics_kind ON topics(kind, status, created_at DESC);
CREATE TABLE IF NOT EXISTS ai_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  trigger_user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_post ON ai_reviews(post_id);
`);
/* 迁移：topics 增加 official（官方内容标记 1=官方 0=用户出题） */
const topicCols = db.prepare("PRAGMA table_info(topics)").all().map((c) => c.name);
if (!topicCols.includes("official")) {
  db.exec("ALTER TABLE topics ADD COLUMN official INTEGER NOT NULL DEFAULT 1");
}

/* 种子话题：首次启动无话题时预置（诗题/填字/飞花） */
const topicCount0 = db.prepare("SELECT COUNT(*) c FROM topics").get().c;
if (topicCount0 === 0) {
  const now0 = Date.now();
  const seedTopics = [
    { kind: "poem_topic", title: "咏月", content: "当期诗题：咏月——写一首与月有关的诗，体裁不限，格律不限。", theme: null, difficulty: "intermediate", is_current: 1 },
    { kind: "poem_topic", title: "咏梅", content: "往期诗题：咏梅（长期开放，随时可参与）。", theme: null, difficulty: "intermediate", is_current: 0 },
    { kind: "poem_topic", title: "咏雪", content: "往期诗题：咏雪（长期开放，随时可参与）。", theme: null, difficulty: "intermediate", is_current: 0 },
    { kind: "poem_topic", title: "咏菊", content: "往期诗题：咏菊（长期开放，随时可参与）。", theme: null, difficulty: "intermediate", is_current: 0 },
    { kind: "fill", title: "清风［　］客梦，素月［　］归舟", content: "考对仗与炼字：抄原句填上你的字，以评论参与。", theme: "对仗炼字", difficulty: "advanced", is_current: 0 },
    { kind: "fill", title: "［　］来风雨，［　］去夕阳", content: "填 2 字，考炼字。", theme: "炼字", difficulty: "beginner", is_current: 0 },
    { kind: "fill", title: "春［　］不觉晓，处处闻啼鸟", content: "填 1 字。", theme: "炼字", difficulty: "beginner", is_current: 0 },
    { kind: "feihua", title: "且借人间二两墨", content: "接下句，主题：墨 / 笔墨意境。", theme: "墨", difficulty: "intermediate", is_current: 0 },
    { kind: "feihua", title: "春风得意马蹄疾", content: "接下句，主题：春。", theme: "春", difficulty: "beginner", is_current: 0 },
    { kind: "feihua", title: "山重水复疑无路", content: "接下句，主题：行路。", theme: "行路", difficulty: "intermediate", is_current: 0 },
  ];
  const insTopic = db.prepare("INSERT INTO topics (kind, title, content, theme, difficulty, is_current, official, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)");
  for (const t of seedTopics) insTopic.run(t.kind, t.title, t.content, t.theme, t.difficulty, t.is_current, now0);
}

/* ===== 自动轮换：每周从内置题库把下一题设为当期（无需人工提醒） =====
 * 题库池：官方题目（诗题/填字/飞花），启动时补入缺失题目；
 * 每小时检查一次：若当期题已存在 ≥7 天，自动推进到池中下一题。 */
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TOPIC_POOL = [
  { kind: "poem_topic", title: "咏荷", content: "当期诗题：咏荷——写一首与荷有关的诗，可咏其形、其香、其格，体裁不限。", theme: "咏物", difficulty: "beginner" },
  { kind: "poem_topic", title: "思乡", content: "当期诗题：思乡——写一份对故土/亲人的念想，体裁不限。", theme: "思乡", difficulty: "intermediate" },
  { kind: "poem_topic", title: "送别", content: "当期诗题：送别——长亭、折柳、劝酒，皆可入诗，体裁不限。", theme: "送别", difficulty: "intermediate" },
  { kind: "poem_topic", title: "春雨", content: "当期诗题：春雨——听雨、看雨、喜雨、愁雨，自选角度，体裁不限。", theme: "咏物", difficulty: "beginner" },
  { kind: "poem_topic", title: "秋夜", content: "当期诗题：秋夜——月色、虫声、孤灯，写一个秋夜的瞬间，体裁不限。", theme: "咏怀", difficulty: "intermediate" },
  { kind: "poem_topic", title: "咏竹", content: "当期诗题：咏竹——写竹之风骨或竹下情景，体裁不限。", theme: "咏物", difficulty: "advanced" },
  { kind: "poem_topic", title: "渔舟", content: "当期诗题：渔舟——江上渔火、钓竿蓑衣，写渔家之趣或隐逸之心，体裁不限。", theme: "咏怀", difficulty: "intermediate" },
  { kind: "poem_topic", title: "赏花", content: "当期诗题：赏花——海棠、牡丹、杏花皆可，写赏花时的所见所感，体裁不限。", theme: "咏物", difficulty: "beginner" },
  { kind: "poem_topic", title: "怀古", content: "当期诗题：怀古——凭吊一处古迹、一位古人，体裁不限。", theme: "怀古", difficulty: "advanced" },
  { kind: "poem_topic", title: "冬日", content: "当期诗题：冬日——围炉、踏雪、呵手，写一个冬日场景，体裁不限。", theme: "咏怀", difficulty: "intermediate" },
  { kind: "fill", title: "世人都晓［　］好，惟有功名忘不了", content: "好了歌首句，填 1 字。", theme: "好了歌", difficulty: "beginner" },
  { kind: "fill", title: "满纸荒唐言，一把［　］泪", content: "开篇诗，填 1 字。", theme: "开篇诗", difficulty: "beginner" },
  { kind: "fill", title: "假作真时真亦假，无为有处［　］", content: "太虚幻境联，填 1 字。", theme: "太虚幻境联", difficulty: "beginner" },
  { kind: "fill", title: "好风凭借力，送我上［　］", content: "薛宝钗柳絮词，填 2 字。", theme: "柳絮词", difficulty: "beginner" },
  { kind: "fill", title: "寒塘渡鹤影，冷月葬［　］", content: "凹晶馆联句（史湘云句），填 2 字。", theme: "凹晶馆联句", difficulty: "beginner" },
  { kind: "fill", title: "玉带林中挂，金簪［　］", content: "金陵十二钗判词，填 2 字。", theme: "判词", difficulty: "beginner" },
  { kind: "fill", title: "秋花惨淡秋草黄，耿耿秋灯［　］", content: "黛玉《秋窗风雨夕》，填 2 字。", theme: "秋窗风雨夕", difficulty: "beginner" },
  { kind: "fill", title: "一畦春韭绿，十里［　］", content: "杏帘在望（稻香村），填 2 字。", theme: "杏帘在望", difficulty: "beginner" },
  { kind: "fill", title: "偷来梨蕊［　］，借得梅花一缕魂", content: "黛玉咏白海棠，填 3 字。", theme: "咏白海棠", difficulty: "intermediate" },
  { kind: "fill", title: "淡极始知［　］，愁多焉得玉无痕", content: "宝钗咏白海棠，填 3 字。", theme: "咏白海棠", difficulty: "intermediate" },
  { kind: "fill", title: "毫端蕴秀临霜写，口齿噙香［　］", content: "黛玉咏菊，填 3 字。", theme: "咏菊", difficulty: "intermediate" },
  { kind: "fill", title: "孤标傲世［　］，一样花开为底迟", content: "黛玉问菊，填 4 字。", theme: "问菊", difficulty: "intermediate" },
  { kind: "fill", title: "眼空蓄泪［　］，暗洒闲抛却为谁", content: "黛玉题帕三绝，填 3 字。", theme: "题帕三绝", difficulty: "intermediate" },
  { kind: "fill", title: "若将人泪［　］，泪自长流花自媚", content: "黛玉桃花行，填 3 字。", theme: "桃花行", difficulty: "intermediate" },
  { kind: "fill", title: "半卷湘帘［　］，碾冰为土玉为盆", content: "湘云咏白海棠，填 3 字。", theme: "咏白海棠", difficulty: "intermediate" },
  { kind: "fill", title: "玉在椟中求善价，钗于奁内［　］", content: "贾雨村中秋联句，填 3 字。", theme: "中秋联句", difficulty: "advanced" },
  { kind: "fill", title: "秋阴捧出［　］，雨渍添来隔宿痕", content: "湘云咏白海棠，填 3 字。", theme: "咏白海棠", difficulty: "advanced" },
  { kind: "fill", title: "欲洁何曾洁，云空［　］", content: "妙玉判词，填 3 字。", theme: "判词", difficulty: "advanced" },
  { kind: "fill", title: "无故寻愁觅恨，有时［　］", content: "宝玉西江月，填 4 字。", theme: "西江月", difficulty: "advanced" },
  { kind: "fill", title: "衔山抱水建来精，多少工夫［　］", content: "大观园题咏，填 3 字。", theme: "大观园题咏", difficulty: "advanced" },
  { kind: "feihua", title: "春眠不觉晓", content: "接下句，主题：春。", theme: "春", difficulty: "beginner" },
  { kind: "feihua", title: "举头望明月", content: "接下句，主题：月。", theme: "月", difficulty: "beginner" },
  { kind: "feihua", title: "欲穷千里目", content: "接下句，主题：登高。", theme: "登高", difficulty: "beginner" },
  { kind: "feihua", title: "海内存知己", content: "接下句，主题：送别。", theme: "送别", difficulty: "beginner" },
  { kind: "feihua", title: "会当凌绝顶", content: "接下句，主题：登高。", theme: "登高", difficulty: "intermediate" },
  { kind: "feihua", title: "长风破浪会有时", content: "接下句，主题：励志。", theme: "励志", difficulty: "intermediate" },
  { kind: "feihua", title: "身无彩凤双飞翼", content: "接下句，主题：情。", theme: "情", difficulty: "intermediate" },
  { kind: "feihua", title: "海上生明月", content: "接下句，主题：月。", theme: "月", difficulty: "intermediate" },
  { kind: "feihua", title: "抽刀断水水更流", content: "接下句，主题：愁。", theme: "愁", difficulty: "advanced" },
  { kind: "feihua", title: "问渠那得清如许", content: "接下句，主题：哲理。", theme: "哲理", difficulty: "advanced" },
  { kind: "feihua", title: "白日依山尽", content: "接下句，主题：登高。", theme: "登高", difficulty: "beginner" },
  { kind: "feihua", title: "独在异乡为异客", content: "接下句，主题：思乡。", theme: "思乡", difficulty: "intermediate" },
  { kind: "feihua", title: "落霞与孤鹜齐飞", content: "接下句，主题：秋景。", theme: "秋景", difficulty: "advanced" },
];
function seedTopicPool() {
  const ins = db.prepare("INSERT OR IGNORE INTO topics (kind, title, content, theme, difficulty, is_current, official, created_at) VALUES (?, ?, ?, ?, ?, 0, 1, ?)");
  for (const t of TOPIC_POOL) {
    const exists = db.prepare("SELECT id FROM topics WHERE kind = ? AND title = ?").get(t.kind, t.title);
    if (!exists) ins.run(t.kind, t.title, t.content, t.theme, t.difficulty, Date.now());
  }
}
function rotateCurrentTopics() {
  const now = Date.now();
  for (const kind of ["poem_topic", "fill", "feihua"]) {
    const cur = db.prepare("SELECT * FROM topics WHERE kind = ? AND is_current = 1 AND status = 'active'").get(kind);
    if (cur && now - cur.created_at < WEEK_MS) continue; // 当期未满一周，不轮换
    // 找池中顺序里"下一题"：从未当过当期（created_at 最小优先）→ 否则取最旧的
    const candidates = db.prepare(
      "SELECT * FROM topics WHERE kind = ? AND status = 'active' AND official = 1 ORDER BY created_at ASC, id ASC"
    ).all(kind);
    if (candidates.length === 0) continue;
    const next = cur
      ? candidates.find((c) => c.id !== cur.id && c.id > cur.id) || candidates[0]
      : candidates[0];
    db.prepare("UPDATE topics SET is_current = 0 WHERE kind = ?").run(kind);
    db.prepare("UPDATE topics SET is_current = 1 WHERE id = ?").run(next.id);
    if (cur) {
      // 把上一期题目的 created_at 置为现在，保证"往期"排序自然、且池中循环有依据
      db.prepare("UPDATE topics SET created_at = ? WHERE id = ?").run(now, cur.id);
    }
    console.log(`[rotate] ${kind} 当期切换到 #${next.id} ${next.title}`);
  }
}
seedTopicPool();
rotateCurrentTopics();
setInterval(rotateCurrentTopics, 60 * 60 * 1000);

/* 引导：首个用户注册将成为管理员；用户表为空时预置一个初始邀请码 */
const BOOTSTRAP_CODE = `HLM-${crypto.randomBytes(3).toString("hex").toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
const nUsers0 = db.prepare("SELECT COUNT(*) c FROM users").get().c;
if (nUsers0 === 0) {
  db.prepare("INSERT OR IGNORE INTO invite_codes (code, note, created_at) VALUES (?, '初始管理员', ?)")
    .run(BOOTSTRAP_CODE, Date.now());
  console.log(`[bootstrap] 首个用户（将成为管理员）的注册邀请码: ${BOOTSTRAP_CODE}`);
}

/* ---------- 敏感词（先发后审的兜底标记） ---------- */
const SENSITIVE_WORDS = [
  "加微信", "加我微信", "代开发票", "办贷款", "赌博", "博彩", "刷单",
  "诈骗", "传销", "裸聊", "色情", "出售枪支", "迷药", "假币",
];

/* ---------- JSONL 工具 ---------- */
function appendLine(file, obj) {
  fs.appendFileSync(path.join(DATA_DIR, file), JSON.stringify(obj) + "\n");
}

function readLines(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  return fs
    .readFileSync(p, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function dayOf(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function send(res, code, obj, extra = {}) {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extra,
  });
  res.end(JSON.stringify(obj));
}

function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      body += c;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

/* ---------- 认证 ---------- */
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return `${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const calc = crypto.scryptSync(password, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(calc, "hex"), Buffer.from(hash, "hex"));
}

function makeSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  const now = Date.now();
  db.prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(token, userId, now, now + SESSION_DAYS * 86400000);
  return token;
}

function sessionUser(req) {
  const cookie = (req.headers.cookie || "").split(";").map((c) => c.trim());
  const pair = cookie.find((c) => c.startsWith("hlm_session="));
  if (!pair) return null;
  const token = pair.slice("hlm_session=".length);
  const s = db.prepare(
    "SELECT s.user_id, u.username, u.role, u.status, u.avatar, u.signature, u.bg_image, u.created_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?",
  ).get(token, Date.now());
  if (!s) return null;
  if (s.status !== "active") return null;
  return { id: s.user_id, username: s.username, role: s.role, avatar: s.avatar, signature: s.signature, bg_image: s.bg_image, created_at: s.created_at };
}

function needAuth(req, res) {
  const u = sessionUser(req);
  if (!u) {
    send(res, 401, { ok: false, msg: "请先登录" });
    return null;
  }
  return u;
}

function needAdmin(req, res) {
  const u = needAuth(req, res);
  if (!u) return null;
  if (u.role !== "admin") {
    send(res, 403, { ok: false, msg: "需要管理员权限" });
    return null;
  }
  return u;
}

function sensitiveHit(text) {
  const t = text || "";
  return SENSITIVE_WORDS.find((w) => t.includes(w)) || null;
}

/* ---------- 通知工具 ---------- */
/** 给某用户写入一条站内通知 */
function notify(userId, type, fromUserId, payload) {
  if (!userId) return;
  db.prepare(
    "INSERT INTO notifications (user_id, type, from_user_id, post_id, comment_id, question_id, title, body, read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)",
  ).run(
    userId,
    type,
    fromUserId ?? null,
    payload.post_id ?? null,
    payload.comment_id ?? null,
    payload.question_id ?? null,
    String(payload.title || "").slice(0, 120),
    String(payload.body || "").slice(0, 300),
    Date.now(),
  );
}

/** 某问题上参与过的用户（发过帖/评论过），排除指定用户；用于"有人在该问题下盖楼"通知 */
function questionParticipants(qid, excludeUserId) {
  if (!qid) return [];
  const rows = db.prepare(
    "SELECT DISTINCT author_id FROM posts WHERE question_id = ? AND status != 'removed' UNION SELECT DISTINCT c.author_id FROM comments c JOIN posts p ON p.id = c.post_id WHERE p.question_id = ? AND c.status != 'removed'",
  ).all(qid, qid);
  return rows.map((r) => r.author_id).filter((id) => id !== excludeUserId);
}

/** 人格测试统计：站内总测人数 + 各类型人数 */
function testStats() {
  const total = db.prepare("SELECT COUNT(*) c FROM test_results").get().c;
  const byType = db.prepare(
    "SELECT archetype_id, character_id, COUNT(*) c FROM test_results GROUP BY archetype_id, character_id ORDER BY c DESC",
  ).all();
  return { total, byType };
}

/* ---------- 敏感词/数据工具 ---------- */
function postView(p, viewer) {
  const isOwner = viewer && p.author_id === viewer.id;
  const isAdmin = viewer && viewer.role === "admin";
  if (p.status === "removed" && !isAdmin) return null;
  if (!isOwner && !isAdmin && p.status !== "approved") return null;
  let quote = null;
  if (p.quote) {
    try {
      quote = JSON.parse(p.quote);
    } catch {
      quote = null;
    }
  }
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    tag: p.tag,
    images: JSON.parse(p.images || "[]"),
    status: p.status,
    like_count: p.like_count,
    view_count: p.view_count,
    question_id: p.question_id ?? null,
    quote,
    author: { id: p.author_id, username: p.author_username },
    created_at: p.created_at,
  };
}

function commentView(c) {
  return {
    id: c.id,
    post_id: c.post_id,
    content: c.content,
    reply_to: c.reply_to,
    floor: c.floor,
    like_count: c.like_count ?? 0,
    author: { id: c.author_id, username: c.author_username },
    created_at: c.created_at,
  };
}

/** 评论点赞状态表：comment_id -> { count, likedByViewer } */
function commentLikesMap(commentIds, viewerId) {
  const map = {};
  if (commentIds.length === 0) return map;
  const marks = commentIds.map(() => "?").join(",");
  for (const row of db.prepare(
    `SELECT comment_id, COUNT(*) c FROM comment_likes WHERE comment_id IN (${marks}) GROUP BY comment_id`,
  ).all(...commentIds)) {
    map[row.comment_id] = { count: row.c, liked: false };
  }
  for (const id of commentIds) if (!map[id]) map[id] = { count: 0, liked: false };
  if (viewerId) {
    for (const row of db.prepare(
      `SELECT comment_id FROM comment_likes WHERE comment_id IN (${marks}) AND user_id = ?`,
    ).all(...commentIds, viewerId)) {
      if (map[row.comment_id]) map[row.comment_id].liked = true;
    }
  }
  return map;
}

/* ---------- 静态工具 ---------- */
const PAGE_HEAD = `<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>红楼宇宙 · 管理后台</title><style>
body{font-family:-apple-system,"PingFang SC",sans-serif;max-width:960px;margin:24px auto;padding:0 16px;color:#333}
h1{font-size:20px}h2{font-size:16px;margin-top:28px;border-left:3px solid #A63834;padding-left:8px}
.metrics{display:flex;gap:16px;flex-wrap:wrap}.metric{border:1px solid #ddd;border-radius:12px;padding:16px 22px;min-width:110px}
.metric b{font-size:24px;color:#A63834;display:block}
table{border-collapse:collapse;width:100%;font-size:13px;margin-top:8px}
td,th{border:1px solid #e0e0e0;padding:6px 8px;text-align:left;vertical-align:top}
th{background:#f5f1ea}.ok{color:#2e7d32}.warn{color:#c62828}
.tab{display:inline-block;padding:6px 14px;margin:4px 6px 0 0;border-radius:8px;background:#f5f1ea;text-decoration:none;color:#333;font-size:13px}
.tab.on{background:#A63834;color:#fff}
.btn{border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;color:#fff}
.btn-g{background:#2e7d32}.btn-r{background:#c62828}.btn-o{background:#e67e22}
.quiet{color:#999;font-size:12px}
</style></head><body>`;
const PAGE_FOOT = `</body></html>`;

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* 操作日志：记录登录/发帖/审核/封禁等关键动作，供后台按用户/时间定位问题 */
function logAudit(uid, uname, action, target, detail) {
  try {
    db.prepare("INSERT INTO audit_logs (user_id, username, action, target, detail, created_at) VALUES (?,?,?,?,?,?)")
      .run(uid ?? null, String(uname ?? "").slice(0, 50), String(action), String(target ?? "").slice(0, 120), String(detail ?? "").slice(0, 500), Date.now());
  } catch {}
}

function adminNav(active) {
  const tabs = [
    ["overview", "概览"],
    ["posts", "帖子审核"],
    ["comments", "评论审核"],
    ["users", "用户"],
    ["invites", "邀请码"],
    ["logs", "操作日志"],
  ];
  return tabs
    .map(([k, label]) => `<a class="tab ${active === k ? "on" : ""}" href="?view=${k}">${label}</a>`)
    .join("");
}

function adminOverviewHtml(me) {
  const tracks = readLines("track.jsonl");
  const now = Date.now();
  const today = dayOf(now);
  const byDay = {};
  for (const t of tracks) {
    const d = dayOf(t.ts);
    byDay[d] = byDay[d] || { pv: 0, ips: new Set() };
    byDay[d].pv++;
    byDay[d].ips.add(t.ip);
  }
  const weekDays = [];
  for (let i = 6; i >= 0; i--) weekDays.push(dayOf(now - i * 86400000));
  const week = { pv: 0, uv: 0 };
  for (const d of weekDays) if (byDay[d]) {
    week.pv += byDay[d].pv;
    week.uv += byDay[d].ips.size;
  }
  const nUsers = db.prepare("SELECT COUNT(*) c FROM users").get().c;
  const nPosts = db.prepare("SELECT COUNT(*) c FROM posts").get().c;
  const pending = db.prepare("SELECT COUNT(*) c FROM posts WHERE status='pending'").get().c;
  const nComments = db.prepare("SELECT COUNT(*) c FROM comments").get().c;
  const cPending = db.prepare("SELECT COUNT(*) c FROM comments WHERE status='pending'").get().c;
  const nInvites = db.prepare("SELECT COUNT(*) c FROM invite_codes").get().c;
  const usedInvites = db.prepare("SELECT COUNT(*) c FROM invite_codes WHERE used_at IS NOT NULL").get().c;
  const mem = process.memoryUsage();
  const memMB = Math.round((mem.rss / 1024 / 1024) * 10) / 10;
  const dbsize = Math.round(fs.statSync(path.join(DATA_DIR, "hlm.db")).size / 1024);
  const rows = weekDays.map((d) => {
    const b = byDay[d];
    return `<tr><td>${d}</td><td>${b?.pv || 0}</td><td>${b?.ips?.size || 0}</td></tr>`;
  }).join("");
  return `<p class="quiet">登录：${esc(me.username)}（管理员）· <a href="/logout">退出</a></p>
  <div class="metrics">
    <div class="metric"><b>${byDay[today]?.pv || 0}</b>今日 PV</div>
    <div class="metric"><b>${byDay[today]?.ips.size || 0}</b>今日 UV</div>
    <div class="metric"><b>${week.pv}</b>近7天 PV</div>
    <div class="metric"><b>${nUsers}</b>用户</div>
    <div class="metric"><b>${pending}</b>待审帖子</div>
    <div class="metric"><b>${cPending}</b>待审评论</div>
    <div class="metric"><b>${usedInvites}/${nInvites}</b>邀请码已用</div>
    <div class="metric"><b>${memMB}MB</b>进程内存</div>
    <div class="metric"><b>${dbsize}KB</b>数据库</div>
  </div>
  <h2>近 7 天访问</h2><table><tr><th>日期</th><th>PV</th><th>UV</th></tr>${rows}</table>`;
}

function moderationWords() {
  const map = {};
  for (const m of readLines("moderation.jsonl")) {
    if (m && m.id) map[`${m.kind}:${m.id}`] = m.word;
  }
  return map;
}

const STATUS_LABEL = { pending: "待审核", approved: "已发布", rejected: "已驳回", removed: "已删除" };

function adminPostsHtml() {
  const mods = moderationWords();
  const rows = db.prepare(
    `SELECT p.*, u.username author_username FROM posts p JOIN users u ON u.id = p.author_id ORDER BY p.created_at DESC LIMIT 100`,
  ).all().map((p) => {
    const statusColor = p.status === "pending" ? "warn" : p.status === "approved" ? "ok" : "";
    const why = p.status === "pending"
      ? (mods[`post:${p.id}`] ? ` 敏感词「${esc(mods[`post:${p.id}`])}」` : "")
      : p.reviewed_by === 0 ? "（自动通过）" : "";
    const actions = p.status === "pending"
      ? `<button class="btn btn-g" onclick="review(${p.id},'approved')">通过</button>
         <button class="btn btn-r" onclick="review(${p.id},'rejected')">驳回</button>`
      : `<button class="btn btn-r" onclick="review(${p.id},'removed')">下架</button>`;
    return `<tr><td>${p.id}</td><td><b>${esc(p.title)}</b><br><span class="quiet">${esc(p.tag)} · ${esc(p.author_username)} · ${new Date(p.created_at).toLocaleString("zh-CN", { hour12: false })}</span></td>
    <td class="${statusColor}">${STATUS_LABEL[p.status] ?? p.status}${why}</td><td>${esc(p.content).slice(0, 120)}</td><td>${actions}</td></tr>`;
  }).join("");
  return `<h2>帖子（近 100 条，未命中敏感词的内容已自动通过）</h2>
  <table><tr><th>ID</th><th>标题 / 作者 / 时间</th><th>状态</th><th>内容摘要</th><th>操作</th></tr>${rows || '<tr><td colspan="5">暂无</td></tr>'}</table>
  <script>async function review(id, action){ if(!confirm('确认执行 '+action+'？'))return; await fetch('api/admin/posts/'+id+'/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})}); location.reload(); }</script>`;
}

function adminCommentsHtml() {
  const mods = moderationWords();
  const rows = db.prepare(
    `SELECT c.*, u.username author_username, p.title post_title FROM comments c JOIN users u ON u.id = c.author_id JOIN posts p ON p.id = c.post_id ORDER BY c.created_at DESC LIMIT 100`,
  ).all().map((c) => {
    const why = c.status === "pending"
      ? (mods[`comment:${c.id}`] ? ` 敏感词「${esc(mods[`comment:${c.id}`])}」` : "")
      : "";
    const actions = c.status === "pending"
      ? `<button class="btn btn-g" onclick="review(${c.id},'approved')">通过</button>
         <button class="btn btn-r" onclick="review(${c.id},'rejected')">驳回</button>`
      : `<button class="btn btn-r" onclick="review(${c.id},'removed')">删除</button>`;
    return `<tr><td>${c.id}</td><td>${esc(c.author_username)} · ${esc(c.post_title).slice(0, 30)}<br><span class="quiet">${new Date(c.created_at).toLocaleString("zh-CN", { hour12: false })}</span></td>
    <td class="${c.status === "pending" ? "warn" : c.status === "approved" ? "ok" : ""}">${STATUS_LABEL[c.status] ?? c.status}${why}</td><td>${esc(c.content).slice(0, 100)}</td><td>${actions}</td></tr>`;
  }).join("");
  return `<h2>评论（近 100 条，未命中敏感词的内容已自动通过）</h2>
  <table><tr><th>ID</th><th>作者 / 帖子 / 时间</th><th>状态</th><th>内容</th><th>操作</th></tr>${rows || '<tr><td colspan="5">暂无</td></tr>'}</table>
  <script>async function review(id, action){ if(!confirm('确认执行 '+action+'？'))return; await fetch('api/admin/comments/'+id+'/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})}); location.reload(); }</script>`;
}

function adminUsersHtml() {
  const rows = db.prepare(
    `SELECT u.*, (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id) nposts, (SELECT COUNT(*) FROM comments c WHERE c.author_id = u.id) ncomments FROM users u ORDER BY u.created_at DESC`,
  ).all().map((u) => {
    const viewLink = `<a href="?view=user&id=${u.id}" class="btn btn-o" style="text-decoration:none;padding:2px 8px;font-size:12px">查看内容</a>`;
    const act = u.role === "admin"
      ? `${viewLink} <span class="quiet">管理员</span>`
      : `${viewLink} ${u.status === "active"
        ? `<button class="btn btn-r" onclick="setStatus(${u.id},'banned')">封禁</button>`
        : `<button class="btn btn-g" onclick="setStatus(${u.id},'active')">解封</button>`}`;
    return `<tr><td>${u.id}</td><td>${esc(u.username)}</td><td>${u.nposts}</td><td>${u.ncomments}</td>
    <td>${u.status === "active" ? '<span class="ok">正常</span>' : '<span class="warn">封禁</span>'}</td>
    <td>${new Date(u.created_at).toLocaleString("zh-CN", { hour12: false })}</td><td>${act}</td></tr>`;
  }).join("");
  return `<h2>用户</h2>
  <table><tr><th>ID</th><th>用户名</th><th>帖子</th><th>评论</th><th>状态</th><th>注册时间</th><th>操作</th></tr>${rows}</table>
  <script>async function setStatus(id, status){ if(!confirm('确认？'))return; await fetch('api/admin/users/'+id+'/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})}); location.reload(); }</script>`;
}

function adminInvitesHtml() {
  const rows = db.prepare(
    `SELECT ic.*, u.username used_by_username FROM invite_codes ic LEFT JOIN users u ON u.id = ic.used_by ORDER BY ic.created_at DESC LIMIT 100`,
  ).all().map((c) =>
    `<tr><td><b>${esc(c.code)}</b></td><td>${esc(c.note)}</td>
     <td>${c.used_at ? `${esc(c.used_by_username || "")} · ${new Date(c.used_at).toLocaleString("zh-CN", { hour12: false })}` : '<span class="ok">未使用</span>'}</td>
     <td>${new Date(c.created_at).toLocaleString("zh-CN", { hour12: false })}</td></tr>`,
  ).join("");
  return `<h2>邀请码</h2>
  <form method="post" action="api/admin/invites" style="margin-bottom:12px">
    <input type="number" name="count" value="1" min="1" max="20" style="width:70px"> 个
    <input type="text" name="note" placeholder="备注（给谁用，可选）" style="padding:4px 8px">
    <button class="btn btn-g" style="border:0;padding:6px 14px" type="submit">生成</button>
  </form>
  <table><tr><th>邀请码</th><th>备注</th><th>状态</th><th>生成时间</th></tr>${rows}</table>`;
}

function adminLogsHtml() {
  const rows = db.prepare("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 300").all().map((l) =>
    `<tr><td>${new Date(l.created_at).toLocaleString("zh-CN", { hour12: false })}</td>
     <td>${esc(l.username)}</td><td><b>${esc(l.action)}</b></td>
     <td>${esc(l.target)}</td><td>${esc(l.detail)}</td></tr>`,
  ).join("");
  return `<h2>操作日志</h2>
  <p class="quiet">记录最近 300 条：登录/注册/发帖/评论/审核/封禁/生成邀请码等。用于按用户/时间定位问题。</p>
  <table><tr><th>时间</th><th>用户</th><th>动作</th><th>对象</th><th>详情</th></tr>${rows || '<tr><td colspan="5" class="quiet">暂无日志</td></tr>'}</table>`;
}

function adminUserContentHtml(uid) {
  const u = db.prepare("SELECT * FROM users WHERE id = ?").get(uid);
  if (!u) return `<h2>用户不存在</h2><p><a href="?view=users">← 返回用户列表</a></p>`;
  const nPosts = db.prepare("SELECT COUNT(*) c FROM posts WHERE author_id=?").get(uid).c;
  const nComments = db.prepare("SELECT COUNT(*) c FROM comments WHERE author_id=?").get(uid).c;
  const posts = db.prepare(
    "SELECT id, title, content, type, status, created_at FROM posts WHERE author_id = ? ORDER BY created_at DESC LIMIT 100",
  ).all(uid).map((p) =>
    `<tr><td>${p.id}</td><td>${esc(p.title || p.content.slice(0, 30))}</td><td>${esc(p.content.slice(0, 120))}</td>
     <td>${esc(p.type)}</td><td>${STATUS_LABEL[p.status] || p.status}</td>
     <td>${new Date(p.created_at).toLocaleString("zh-CN", { hour12: false })}</td>
     <td><button class="btn btn-r" onclick="review(${p.id},'remove')">下架</button></td></tr>`,
  ).join("");
  const comments = db.prepare(
    "SELECT c.id, c.content, c.status, c.created_at FROM comments c WHERE c.author_id = ? ORDER BY c.created_at DESC LIMIT 100",
  ).all(uid).map((c) =>
    `<tr><td>${c.id}</td><td>${esc(c.content.slice(0, 120))}</td><td>${STATUS_LABEL[c.status] || c.status}</td>
     <td>${new Date(c.created_at).toLocaleString("zh-CN", { hour12: false })}</td>
     <td><button class="btn btn-r" onclick="reviewComment(${c.id},'remove')">下架</button></td></tr>`,
  ).join("");
  const tests = db.prepare(
    "SELECT archetype_id, character_id, updated_at FROM test_results WHERE user_id = ? ORDER BY updated_at DESC",
  ).all(uid).map((t) =>
    `<tr><td>${esc(t.archetype_id)}</td><td>${esc(t.character_id)}</td><td>${new Date(t.updated_at).toLocaleString("zh-CN", { hour12: false })}</td></tr>`,
  ).join("");
  return `<h2>用户内容：${esc(u.username)}（ID ${u.id}）</h2>
  <p class="quiet"><a href="?view=users">← 返回用户列表</a> · 角色：${u.role} · 状态：${u.status}</p>
  <h3>帖子（${nPosts}）</h3>
  <table><tr><th>ID</th><th>标题</th><th>内容</th><th>类型</th><th>状态</th><th>时间</th><th>操作</th></tr>${posts || '<tr><td colspan="7" class="quiet">无帖子</td></tr>'}</table>
  <h3>评论（${nComments}）</h3>
  <table><tr><th>ID</th><th>内容</th><th>状态</th><th>时间</th><th>操作</th></tr>${comments || '<tr><td colspan="5" class="quiet">无评论</td></tr>'}</table>
  <h3>测试记录</h3>
  <table><tr><th>测试</th><th>角色</th><th>时间</th></tr>${tests || '<tr><td colspan="3" class="quiet">无测试记录</td></tr>'}</table>
  <script>async function review(id, action){ if(!confirm('确认下架帖子 #'+id+'？'))return; await fetch('api/admin/posts/'+id+'/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})}); location.reload(); }
  async function reviewComment(id, action){ if(!confirm('确认下架评论 #'+id+'？'))return; await fetch('api/admin/comments/'+id+'/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})}); location.reload(); }</script>`;
}

/* ---------- HTTP 服务 ---------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";

  if (req.method === "OPTIONS") return send(res, 204, {});

  try {
    /* ===== 原有：统计 / 反馈 / 后台密钥 ===== */
    if (url.pathname === "/api/track" && req.method === "POST") {
      const body = await readBody(req, 10_000);
      const p = JSON.parse(body || "{}");
      appendLine("track.jsonl", { ts: Date.now(), ip, page: p.page || "/", ref: p.ref || "", ua: (req.headers["user-agent"] || "").slice(0, 200) });
      return send(res, 200, { ok: true });
    }

    if (url.pathname === "/api/feedback" && req.method === "POST") {
      const body = await readBody(req, 10_000);
      const f = JSON.parse(body || "{}");
      if (!f.note || !f.note.trim()) return send(res, 400, { ok: false, msg: "反馈内容不能为空" });
      appendLine("feedback.jsonl", { ts: Date.now(), ip, page: f.page || "", type: f.type || "other", refId: f.refId || "", title: f.title || "", note: f.note.trim().slice(0, 2000), correction: (f.correction || "").trim().slice(0, 2000), status: "new" });
      return send(res, 200, { ok: true });
    }

    if (url.pathname === "/api/stats") {
      const key = url.searchParams.get("key");
      if (key !== ADMIN_KEY) return send(res, 401, { ok: false });
      const tracks = readLines("track.jsonl");
      const feedbacks = readLines("feedback.jsonl").reverse();
      const now = Date.now();
      const today = dayOf(now);
      const weekDays = [];
      for (let i = 6; i >= 0; i--) weekDays.push(dayOf(now - i * 86400000));
      const byDay = {};
      for (const t of tracks) {
        const d = dayOf(t.ts);
        byDay[d] = byDay[d] || { pv: 0, ips: new Set() };
        byDay[d].pv++;
        byDay[d].ips.add(t.ip);
      }
      const week = { pv: 0, uv: 0 };
      for (const d of weekDays) if (byDay[d]) { week.pv += byDay[d].pv; week.uv += byDay[d].ips.size; }
      return send(res, 200, { today: { pv: byDay[today]?.pv || 0, uv: byDay[today]?.ips.size || 0 }, week, total: { pv: tracks.length, uv: new Set(tracks.map((t) => t.ip)).size }, feedbacks: feedbacks.slice(0, 200) });
    }

    /* ===== 认证 ===== */
    if (url.pathname === "/api/register" && req.method === "POST") {
      const body = await readBody(req, 10_000);
      const { username, password, invite_code } = JSON.parse(body || "{}");
      const uname = String(username || "").trim();
      if (!/^[\w\u4e00-\u9fa5-]{2,20}$/.test(uname)) return send(res, 400, { ok: false, msg: "用户名需 2-20 位（中英文/数字/下划线/短横线）" });
      if (String(password || "").length < 6) return send(res, 400, { ok: false, msg: "密码至少 6 位" });
      const code = String(invite_code || "").trim().toUpperCase();
      const inv = db.prepare("SELECT * FROM invite_codes WHERE code = ?").get(code);
      if (!inv) return send(res, 400, { ok: false, msg: "邀请码无效" });
      if (inv.used_at) return send(res, 400, { ok: false, msg: "邀请码已被使用（先到先得，每个码只能用一次）" });
      const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(uname);
      if (exists) return send(res, 400, { ok: false, msg: "该用户名已被注册" });
      const nUsers = db.prepare("SELECT COUNT(*) c FROM users").get().c;
      const role = nUsers === 0 ? "admin" : "user";
      const info = db.prepare("INSERT INTO users (username, pass_hash, role, status, created_at) VALUES (?, ?, ?, 'active', ?)")
        .run(uname, hashPassword(password), role, Date.now());
      db.prepare("UPDATE invite_codes SET used_by = ?, used_at = ? WHERE code = ?").run(info.lastInsertRowid, Date.now(), code);
      logAudit(Number(info.lastInsertRowid), uname, "注册", `邀请码 ${code}`, `新用户注册（角色 ${role}）`);
      const token = makeSession(Number(info.lastInsertRowid));
      res.writeHead(200, { "Content-Type": "application/json", "Set-Cookie": `hlm_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}` });
      return res.end(JSON.stringify({ ok: true, user: { id: Number(info.lastInsertRowid), username: uname, role }, isFirst: role === "admin" }));
    }

    if (url.pathname === "/api/login" && req.method === "POST") {
      const body = await readBody(req, 10_000);
      const { username, password } = JSON.parse(body || "{}");
      const u = db.prepare("SELECT * FROM users WHERE username = ?").get(String(username || "").trim());
      if (!u || !verifyPassword(String(password || ""), u.pass_hash)) {
        logAudit(null, String(username || "").slice(0, 50), "登录失败", "登录", "用户名或密码错误");
        return send(res, 401, { ok: false, msg: "用户名或密码错误" });
      }
      if (u.status !== "active") return send(res, 403, { ok: false, msg: "账号已被封禁" });
      const token = makeSession(u.id);
      logAudit(u.id, u.username, "登录", "登录", "登录成功");
      res.writeHead(200, { "Content-Type": "application/json", "Set-Cookie": `hlm_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}` });
      return res.end(JSON.stringify({ ok: true, user: { id: u.id, username: u.username, role: u.role } }));
    }

    if (url.pathname === "/logout" || url.pathname === "/api/logout") {
      const cookie = (req.headers.cookie || "").split(";").map((c) => c.trim());
      const pair = cookie.find((c) => c.startsWith("hlm_session="));
      if (pair) db.prepare("DELETE FROM sessions WHERE token = ?").run(pair.slice("hlm_session=".length));
      res.writeHead(200, { "Content-Type": "application/json", "Set-Cookie": "hlm_session=; HttpOnly; Path=/; Max-Age=0" });
      return res.end(JSON.stringify({ ok: true }));
    }

    if (url.pathname === "/api/me") {
      const u = sessionUser(req);
      if (!u) return send(res, 200, { ok: true, user: null });
      return send(res, 200, { ok: true, user: meWithStats(u) });
    }

    if (url.pathname === "/api/profile" && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const body = await readBody(req, 10_000);
      const { avatar, signature, bg_image } = JSON.parse(body || "{}");
      const sets = [];
      const args = [];
      if (typeof signature === "string") {
        const sig = signature.trim().slice(0, 120);
        sets.push("signature = ?");
        args.push(sig);
      }
      if (typeof avatar === "string") {
        if (!avatar || avatar.startsWith("/uploads/")) {
          sets.push("avatar = ?");
          args.push(avatar || null);
        } else {
          return send(res, 400, { ok: false, msg: "头像必须是站内上传的图片" });
        }
      }
      if (typeof bg_image === "string") {
        if (!bg_image || bg_image.startsWith("/uploads/")) {
          sets.push("bg_image = ?");
          args.push(bg_image || null);
        } else {
          return send(res, 400, { ok: false, msg: "背景图必须是站内上传的图片" });
        }
      }
      if (sets.length === 0) return send(res, 400, { ok: false, msg: "没有可更新的内容" });
      db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).run(...args, u.id);
      const fresh = db.prepare("SELECT username, role, avatar, signature, bg_image, created_at FROM users WHERE id = ?").get(u.id);
      return send(res, 200, { ok: true, user: { id: u.id, ...fresh } });
    }

    /* ===== 帖子 ===== */
    if (url.pathname === "/api/posts" && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const body = await readBody(req, 100_000);
      const { title, content, tag, images, question_id, quote, type, topic_id } = JSON.parse(body || "{}");
      const t = String(title || "").trim();
      const c = String(content || "").trim();
      if (!t && !c) return send(res, 400, { ok: false, msg: "标题和正文不能为空" });
      if (t.length > 80) return send(res, 400, { ok: false, msg: "标题最多 80 字" });
      if (c.length > 20000) return send(res, 400, { ok: false, msg: "正文最多 20000 字" });
      const tagName = String(tag || "自由讨论").trim().slice(0, 20);
      const imgs = Array.isArray(images) ? images.filter((x) => typeof x === "string" && x.startsWith("/uploads/")).slice(0, 9) : [];
      const qid = String(question_id ?? "").trim().slice(0, 100) || null;
      const postType = ["poem", "answer", "dynamic", "longform", "post"].includes(String(type)) ? String(type) : "post";
      const topicId = Number(topic_id) || null;
      if (topicId) {
        const tp = db.prepare("SELECT id FROM topics WHERE id = ? AND status = 'active'").get(topicId);
        if (!tp) return send(res, 400, { ok: false, msg: "话题不存在" });
      }
      let quoteJson = null;
      if (quote && typeof quote === "object") {
        const clean = {
          question_title: String(quote.question_title || "").slice(0, 120),
          viewpoint_title: String(quote.viewpoint_title || "").slice(0, 120),
          source: String(quote.source || "").slice(0, 120),
          summary: String(quote.summary || "").slice(0, 1000),
        };
        if (clean.viewpoint_title) quoteJson = JSON.stringify(clean);
      }
      const hit = sensitiveHit(t + c);
      /* 自动审核：未命中敏感词直接通过；命中才进人工复核 */
      const status = hit ? "pending" : "approved";
      const info = db.prepare("INSERT INTO posts (author_id, title, content, tag, images, status, question_id, quote, type, topic_id, created_at, reviewed_at, reviewed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(u.id, t, c, tagName, JSON.stringify(imgs), status, qid, quoteJson, postType, topicId, Date.now(), hit ? null : Date.now(), hit ? null : 0);
      if (hit) appendLine("moderation.jsonl", { ts: Date.now(), kind: "post", id: Number(info.lastInsertRowid), word: hit, user: u.username });
      logAudit(u.id, u.username, "发布", `帖子 #${Number(info.lastInsertRowid)} ${t.slice(0, 30)}`, hit ? "命中敏感词，待人工审核" : "自动审核通过");
      /* 积分：发帖/发动态 +10 */
      grantPoints(u.id, 10, "post", `post:${Number(info.lastInsertRowid)}`);
      /* 通知：该问题下的其他参与者"有新人盖楼" */
      if (qid) {
        for (const uid of questionParticipants(qid, u.id)) {
          notify(uid, "new_post", u.id, {
            post_id: Number(info.lastInsertRowid),
            question_id: qid,
            title: `${u.username} 在「${qid}」下发起了新讨论`,
            body: t,
          });
        }
      }
      return send(res, 200, {
        ok: true,
        id: Number(info.lastInsertRowid),
        hit,
        status,
        msg: hit ? "内容命中敏感词，已转人工复核" : "已自动通过审核并发布",
      });
    }

    if (url.pathname === "/api/posts" && req.method === "GET") {      const viewer = sessionUser(req);
      const tag = url.searchParams.get("tag");
      const qid = url.searchParams.get("question_id");
      const mine = url.searchParams.get("mine") === "1";
      const includeMine = url.searchParams.get("include_mine") === "1";
      const sort = url.searchParams.get("sort") || "new";
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const kw = (url.searchParams.get("q") || "").trim();
      const per = 20;
      const conds = [];
      const args = [];
      if (mine) {
        if (!viewer) return send(res, 401, { ok: false, msg: "请先登录" });
        conds.push("p.author_id = ? AND p.status != 'removed'");
        args.push(viewer.id);
      } else if (includeMine && viewer) {
        conds.push("(p.status = 'approved' OR (p.author_id = ? AND p.status != 'removed'))");
        args.push(viewer.id);
      } else if (viewer && viewer.role === "admin") {
        /* 管理员列表可见待审/驳回，但已删除(removed)帖子不再出现在社区列表（后台审核页另查） */
        conds.push("p.status != 'removed'");
      } else {
        conds.push("p.status = 'approved'");
      }
      if (tag && tag !== "全部") {
        conds.push("p.tag = ?");
        args.push(tag);
      }
      if (qid) {
        conds.push("p.question_id = ?");
        args.push(qid);
      }
      if (kw) {
        const like = `%${String(kw).replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
        conds.push(
          "(p.title LIKE ? ESCAPE '\\' OR p.content LIKE ? ESCAPE '\\' OR u.username LIKE ? ESCAPE '\\')",
        );
        args.push(like, like, like);
      }
      const where = conds.join(" AND ");
      const order = sort === "hot" ? "p.like_count DESC, p.view_count DESC, p.created_at DESC" : "p.created_at DESC";
      const rows = db.prepare(
        `SELECT p.*, u.username author_username FROM posts p JOIN users u ON u.id = p.author_id WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
      ).all(...args, per, (page - 1) * per);
      const total = db.prepare(`SELECT COUNT(*) c FROM posts p JOIN users u ON u.id = p.author_id WHERE ${where}`).get(...args).c;
      const tags = db.prepare("SELECT DISTINCT tag FROM posts WHERE status='approved' ORDER BY tag").all().map((r) => r.tag);
      return send(res, 200, { ok: true, posts: rows.map((p) => postView(p, viewer)).filter(Boolean), total, page, tags });
    }

    const postMatch = url.pathname.match(/^\/api\/posts\/(\d+)$/);
    const likeMatch = url.pathname.match(/^\/api\/posts\/(\d+)\/like$/);
    const commentMatch = url.pathname.match(/^\/api\/posts\/(\d+)\/comment$/);
    const commentDeleteMatch = url.pathname.match(/^\/api\/posts\/(\d+)\/comments\/(\d+)$/);
    if (postMatch && req.method === "GET") {
      const viewer = sessionUser(req);
      const p = db.prepare("SELECT p.*, u.username author_username FROM posts p JOIN users u ON u.id = p.author_id WHERE p.id = ?").get(Number(postMatch[1]));
      if (!p) return send(res, 404, { ok: false });
      const view = postView(p, viewer);
      if (!view) return send(res, 404, { ok: false, msg: "帖子不存在或未过审" });
      db.prepare("UPDATE posts SET view_count = view_count + 1 WHERE id = ?").run(p.id);
      const floorRows = db.prepare(
        `SELECT c.*, u.username author_username FROM comments c JOIN users u ON u.id = c.author_id WHERE c.post_id = ? AND c.status = 'approved' ORDER BY c.created_at ASC`,
      ).all(p.id);
      const floors = floorRows.map((c, i) => ({ ...commentView(c), floor: i + 1 }));
      const cLikes = commentLikesMap(floorRows.map((c) => c.id), viewer?.id);
      for (const f of floors) {
        const lk = cLikes[f.id];
        f.liked = lk ? lk.liked : false;
      }
      const liked = viewer ? !!db.prepare("SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?").get(viewer.id, p.id) : false;
      const reviews = db.prepare(
        `SELECT a.id, a.post_id, a.trigger_user_id, a.content, a.created_at, u.username AS trigger_name
         FROM ai_reviews a JOIN users u ON u.id = a.trigger_user_id WHERE a.post_id = ?`
      ).all(p.id);
      return send(res, 200, { ok: true, post: view, comments: floors, liked, reviews });
    }

    /* 删除帖子：作者本人或管理员（逻辑删除 status=removed，评论一并移除） */
    if (postMatch && req.method === "DELETE") {
      const u = needAuth(req, res);
      if (!u) return;
      const pid = Number(postMatch[1]);
      const p = db.prepare("SELECT author_id FROM posts WHERE id = ?").get(pid);
      if (!p) return send(res, 404, { ok: false, msg: "帖子不存在" });
      if (p.author_id !== u.id && u.role !== "admin") {
        return send(res, 403, { ok: false, msg: "只能删除自己发布的帖子" });
      }
      db.prepare("UPDATE posts SET status = 'removed' WHERE id = ?").run(pid);
      db.prepare("UPDATE comments SET status = 'removed' WHERE post_id = ?").run(pid);
      return send(res, 200, { ok: true });
    }

    /* 删除评论：作者本人或管理员 */
    if (commentDeleteMatch && req.method === "DELETE") {
      const u = needAuth(req, res);
      if (!u) return;
      const pid = Number(commentDeleteMatch[1]);
      const cid = Number(commentDeleteMatch[2]);
      const c = db.prepare("SELECT author_id FROM comments WHERE id = ? AND post_id = ?").get(cid, pid);
      if (!c) return send(res, 404, { ok: false, msg: "评论不存在" });
      if (c.author_id !== u.id && u.role !== "admin") {
        return send(res, 403, { ok: false, msg: "只能删除自己的评论" });
      }
      db.prepare("UPDATE comments SET status = 'removed' WHERE id = ?").run(cid);
      return send(res, 200, { ok: true });
    }

    if (likeMatch && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const pid = Number(likeMatch[1]);
      const exists = db.prepare("SELECT 1 FROM posts WHERE id = ? AND status = 'approved'").get(pid);
      if (!exists) return send(res, 404, { ok: false, msg: "帖子不存在或尚未过审" });
      const had = db.prepare("SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?").get(u.id, pid);
      if (had) {
        db.prepare("DELETE FROM likes WHERE user_id = ? AND post_id = ?").run(u.id, pid);
        db.prepare("UPDATE posts SET like_count = MAX(0, like_count - 1) WHERE id = ?").run(pid);
        return send(res, 200, { ok: true, liked: false });
      }
      db.prepare("INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, ?)").run(u.id, pid, Date.now());
      db.prepare("UPDATE posts SET like_count = like_count + 1 WHERE id = ?").run(pid);
      /* 被点赞：给作者 +2 积分（作者自己点赞不记） */
      const postAuthor = db.prepare("SELECT author_id FROM posts WHERE id = ?").get(pid);
      if (postAuthor && postAuthor.author_id !== u.id) {
        grantPoints(postAuthor.author_id, 2, "like", `post:${pid}`);
      }
      return send(res, 200, { ok: true, liked: true });
    }

    /* ===== 观点点赞（红学家观点，问题页） ===== */
    const viewpointLikeMatch = url.pathname.match(/^\/api\/viewpoints\/([^/]+)\/([^/]+)\/like$/);
    if (viewpointLikeMatch && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const qid = decodeURIComponent(viewpointLikeMatch[1]).slice(0, 120);
      const vid = decodeURIComponent(viewpointLikeMatch[2]).slice(0, 120);
      if (!qid || !vid) return send(res, 400, { ok: false, msg: "参数错误" });
      const had = db.prepare("SELECT 1 FROM viewpoint_likes WHERE user_id = ? AND question_id = ? AND viewpoint_id = ?").get(u.id, qid, vid);
      if (had) {
        db.prepare("DELETE FROM viewpoint_likes WHERE user_id = ? AND question_id = ? AND viewpoint_id = ?").run(u.id, qid, vid);
      } else {
        db.prepare("INSERT INTO viewpoint_likes (user_id, question_id, viewpoint_id, created_at) VALUES (?, ?, ?, ?)").run(u.id, qid, vid, Date.now());
      }
      const count = db.prepare("SELECT COUNT(*) c FROM viewpoint_likes WHERE question_id = ? AND viewpoint_id = ?").get(qid, vid).c;
      return send(res, 200, { ok: true, liked: !had, count });
    }

    /* 观点点赞数查询（问题页按赞排序） */
    const viewpointQueryMatch = url.pathname.match(/^\/api\/viewpoints\/([^/]+)$/);
    if (viewpointQueryMatch && req.method === "GET") {
      const viewer = sessionUser(req);
      const qid = decodeURIComponent(viewpointQueryMatch[1]).slice(0, 120);
      if (!qid) return send(res, 400, { ok: false, msg: "参数错误" });
      const rows = db.prepare(
        "SELECT viewpoint_id, COUNT(*) c FROM viewpoint_likes WHERE question_id = ? GROUP BY viewpoint_id",
      ).all(qid);
      const map = {};
      for (const r of rows) map[r.viewpoint_id] = { count: r.c, liked: false };
      if (viewer) {
        const mine = db.prepare(
          "SELECT viewpoint_id FROM viewpoint_likes WHERE question_id = ? AND user_id = ?",
        ).all(qid, viewer.id);
        for (const r of mine) if (map[r.viewpoint_id]) map[r.viewpoint_id].liked = true;
      }
      return send(res, 200, { ok: true, likes: map });
    }

    /* ===== 评论点赞 ===== */
    const commentLikeMatch = url.pathname.match(/^\/api\/posts\/(\d+)\/comments\/(\d+)\/like$/);
    if (commentLikeMatch && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const pid = Number(commentLikeMatch[1]);
      const cid = Number(commentLikeMatch[2]);
      const c = db.prepare("SELECT id, post_id FROM comments WHERE id = ? AND post_id = ? AND status = 'approved'").get(cid, pid);
      if (!c) return send(res, 404, { ok: false, msg: "评论不存在或尚未过审" });
      const had = db.prepare("SELECT 1 FROM comment_likes WHERE user_id = ? AND comment_id = ?").get(u.id, cid);
      if (had) {
        db.prepare("DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?").run(u.id, cid);
        db.prepare("UPDATE comments SET like_count = MAX(0, like_count - 1) WHERE id = ?").run(cid);
      } else {
        db.prepare("INSERT INTO comment_likes (user_id, comment_id, created_at) VALUES (?, ?, ?)").run(u.id, cid, Date.now());
        db.prepare("UPDATE comments SET like_count = like_count + 1 WHERE id = ?").run(cid);
      }
      const count = db.prepare("SELECT like_count c FROM comments WHERE id = ?").get(cid).c;
      return send(res, 200, { ok: true, liked: !had, count });
    }

    if (commentMatch && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const pid = Number(commentMatch[1]);
      const exists = db.prepare("SELECT id, author_id, title, question_id FROM posts WHERE id = ? AND status = 'approved'").get(pid);
      if (!exists) return send(res, 404, { ok: false, msg: "帖子不存在或尚未过审" });
      const body = await readBody(req, 10_000);
      const { content, reply_to } = JSON.parse(body || "{}");
      const c = String(content || "").trim();
      if (!c) return send(res, 400, { ok: false, msg: "评论内容不能为空" });
      if (c.length > 2000) return send(res, 400, { ok: false, msg: "评论最多 2000 字" });
      let rt = null;
      if (reply_to) {
        const ref = db.prepare("SELECT id FROM comments WHERE id = ? AND post_id = ?").get(Number(reply_to), pid);
        if (!ref) return send(res, 400, { ok: false, msg: "引用的楼层不存在" });
        rt = ref.id;
      }
      const hit = sensitiveHit(c);
      /* 自动审核：未命中敏感词直接通过；命中才进人工复核 */
      const status = hit ? "pending" : "approved";
      const info = db.prepare("INSERT INTO comments (post_id, author_id, content, reply_to, status, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .run(pid, u.id, c, rt, status, Date.now());
      if (hit) appendLine("moderation.jsonl", { ts: Date.now(), kind: "comment", id: Number(info.lastInsertRowid), word: hit, user: u.username });
      logAudit(u.id, u.username, "评论", `帖子 #${pid} 楼层 #${Number(info.lastInsertRowid)}`, hit ? "命中敏感词，待人工审核" : "自动审核通过");
      /* 通知：回复我的帖子（主楼评论）→ 通知帖子作者；回复我的楼层 → 通知该楼层作者 */
      if (rt) {
        const parent = db.prepare("SELECT author_id FROM comments WHERE id = ?").get(rt);
        if (parent && parent.author_id !== u.id) {
          notify(parent.author_id, "reply_comment", u.id, {
            post_id: pid,
            comment_id: rt,
            question_id: exists.question_id ?? null,
            title: `${u.username} 回复了你的楼层`,
            body: c.slice(0, 80),
          });
        }
      } else if (exists.author_id !== u.id) {
        notify(exists.author_id, "reply_post", u.id, {
          post_id: pid,
          question_id: exists.question_id ?? null,
          title: `${u.username} 评论了你的帖子「${exists.title}」`,
          body: c.slice(0, 80),
        });
      }
      /* 积分：发评论 +3 */
      grantPoints(u.id, 3, "comment", `post:${pid}`);
      return send(res, 200, {
        ok: true,
        id: Number(info.lastInsertRowid),
        hit,
        status,
        msg: hit ? "评论命中敏感词，已转人工复核" : "评论已发布",
      });
    }

    /* ===== 通知 ===== */
    if (url.pathname === "/api/notifications" && req.method === "GET") {
      const u = needAuth(req, res);
      if (!u) return;
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const per = 20;
      const rows = db.prepare(
        `SELECT n.*, u.username from_username FROM notifications n LEFT JOIN users u ON u.id = n.from_user_id WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
      ).all(u.id, per, (page - 1) * per);
      const unread = db.prepare("SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND read = 0").get(u.id).c;
      return send(res, 200, {
        ok: true,
        unread,
        notifications: rows.map((n) => ({
          id: n.id,
          type: n.type,
          from: n.from_username ? { id: n.from_user_id, username: n.from_username } : null,
          post_id: n.post_id,
          comment_id: n.comment_id,
          question_id: n.question_id,
          title: n.title,
          body: n.body,
          read: !!n.read,
          created_at: n.created_at,
        })),
      });
    }

    /* 未读数量（轮询用） */
    if (url.pathname === "/api/notifications/unread" && req.method === "GET") {
      const u = needAuth(req, res);
      if (!u) return send(res, 401, { ok: false, msg: "请先登录" });
      const unread = db.prepare("SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND read = 0").get(u.id).c;
      return send(res, 200, { ok: true, unread });
    }

    /* 标记已读：单条（body {id}）或全部（body {all:true}） */
    if (url.pathname === "/api/notifications/read" && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const body = await readBody(req, 10_000);
      const { id, all } = JSON.parse(body || "{}");
      if (all) {
        db.prepare("UPDATE notifications SET read = 1 WHERE user_id = ?").run(u.id);
      } else if (id) {
        db.prepare("UPDATE notifications SET read = 1 WHERE user_id = ? AND id = ?").run(u.id, Number(id));
      } else {
        return send(res, 400, { ok: false, msg: "参数错误" });
      }
      return send(res, 200, { ok: true });
    }

    /* ===== 人格测试结果统计 ===== */
    /* 提交测试结果（登录用户，每人保留最新一条） */
    if (url.pathname === "/api/test/result" && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const body = await readBody(req, 10_000);
      const { archetype_id, character_id } = JSON.parse(body || "{}");
      const a = String(archetype_id || "").trim().slice(0, 60);
      const c = String(character_id || "").trim().slice(0, 60);
      if (!a || !c) return send(res, 400, { ok: false, msg: "参数错误" });
      const now = Date.now();
      db.prepare(
        `INSERT INTO test_results (user_id, archetype_id, character_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET archetype_id = excluded.archetype_id, character_id = excluded.character_id, updated_at = excluded.updated_at`,
      ).run(u.id, a, c, now, now);
      const stats = testStats();
      return send(res, 200, { ok: true, stats });
    }

    /* 统计（公开）：总测人数 + 各类型人数 */
    if (url.pathname === "/api/test/stats" && req.method === "GET") {
      return send(res, 200, { ok: true, stats: testStats() });
    }

    /* 我的测试结果（登录） */
    if (url.pathname === "/api/test/result" && req.method === "GET") {
      const u = sessionUser(req);
      if (!u) return send(res, 200, { ok: true, result: null });
      const r = db.prepare("SELECT archetype_id, character_id, updated_at FROM test_results WHERE user_id = ?").get(u.id);
      return send(res, 200, {
        ok: true,
        result: r ? { archetype_id: r.archetype_id, character_id: r.character_id, updated_at: r.updated_at } : null,
        stats: testStats(),
      });
    }

    /* ===== 上传 ===== */
    if (url.pathname === "/api/upload" && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const ctype = (req.headers["content-type"] || "").toLowerCase();
      if (!ctype.startsWith("image/")) return send(res, 400, { ok: false, msg: "仅支持图片上传" });
      const chunks = [];
      let size = 0;
      await new Promise((resolve, reject) => {
        req.on("data", (c) => {
          size += c.length;
          if (size > MAX_UPLOAD_BYTES) {
            reject(new Error("too large"));
            req.destroy();
            return;
          }
          chunks.push(c);
        });
        req.on("end", resolve);
        req.on("error", reject);
      });
      if (size > MAX_UPLOAD_BYTES) return send(res, 400, { ok: false, msg: "图片超过 5MB 限制" });
      const extMap = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
      const ext = extMap[ctype] || "jpg";
      const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.concat(chunks));
      return send(res, 200, { ok: true, url: `/uploads/${name}` });
    }

    /* ===== 管理 API ===== */
    const adminReviewMatch = url.pathname.match(/^\/api\/admin\/posts\/(\d+)\/review$/);
    if (adminReviewMatch && req.method === "POST") {
      const u = needAdmin(req, res);
      if (!u) return;
      const body = await readBody(req, 10_000);
      const { action } = JSON.parse(body || "{}");
      if (!["approved", "rejected", "removed"].includes(action)) return send(res, 400, { ok: false });
      db.prepare("UPDATE posts SET status = ?, reviewed_at = ?, reviewed_by = ? WHERE id = ?").run(action, Date.now(), u.id, Number(adminReviewMatch[1]));
      const ptitle = db.prepare("SELECT title FROM posts WHERE id = ?").get(Number(adminReviewMatch[1]));
      logAudit(u.id, u.username, "审核帖子", `帖子 #${adminReviewMatch[1]} ${String(ptitle?.title || "").slice(0, 30)} → ${action}`, "");
      return send(res, 200, { ok: true });
    }

    const adminCommentMatch = url.pathname.match(/^\/api\/admin\/comments\/(\d+)\/review$/);
    if (adminCommentMatch && req.method === "POST") {
      const u = needAdmin(req, res);
      if (!u) return;
      const body = await readBody(req, 10_000);
      const { action } = JSON.parse(body || "{}");
      if (!["approved", "rejected", "removed"].includes(action)) return send(res, 400, { ok: false });
      db.prepare("UPDATE comments SET status = ? WHERE id = ?").run(action, Number(adminCommentMatch[1]));
      logAudit(u.id, u.username, "审核评论", `楼层 #${adminCommentMatch[1]} → ${action}`, "");
      return send(res, 200, { ok: true });
    }

    const adminUserMatch = url.pathname.match(/^\/api\/admin\/users\/(\d+)\/status$/);
    if (adminUserMatch && req.method === "POST") {
      const u = needAdmin(req, res);
      if (!u) return;
      const body = await readBody(req, 10_000);
      const { status } = JSON.parse(body || "{}");
      if (!["active", "banned"].includes(status)) return send(res, 400, { ok: false });
      const target = db.prepare("SELECT role, username FROM users WHERE id = ?").get(Number(adminUserMatch[1]));
      if (!target) return send(res, 404, { ok: false });
      if (target.role === "admin") return send(res, 400, { ok: false, msg: "不能封禁管理员" });
      db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, Number(adminUserMatch[1]));
      logAudit(u.id, u.username, status === "banned" ? "封禁用户" : "解封用户", `用户 #${adminUserMatch[1]} ${target.username}`, "");
      return send(res, 200, { ok: true });
    }

    if (url.pathname === "/api/admin/invites" && req.method === "POST") {
      const u = needAdmin(req, res);
      if (!u) return;
      const body = await readBody(req, 10_000);
      let count = 1;
      let note = "";
      try {
        const parsed = JSON.parse(body);
        count = Math.min(20, Math.max(1, Number(parsed.count) || 1));
        note = String(parsed.note || "").slice(0, 50);
      } catch {
        const params = new URLSearchParams(body);
        count = Math.min(20, Math.max(1, Number(params.get("count")) || 1));
        note = String(params.get("note") || "").slice(0, 50);
      }
      const codes = [];
      for (let i = 0; i < count; i++) {
        const code = `HLM-${crypto.randomBytes(3).toString("hex").toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        db.prepare("INSERT INTO invite_codes (code, note, created_at) VALUES (?, ?, ?)").run(code, note, Date.now());
        logAudit(u.id, u.username, "生成邀请码", code, note ? `备注：${note}` : "");
        codes.push(code);
      }
      if (req.headers["content-type"]?.includes("application/json")) {
        return send(res, 200, { ok: true, codes });
      }
      res.writeHead(302, { Location: "?view=invites" });
      return res.end();
    }

    /* ===== 第二阶段：首页流 / 成长体系 / 关注 / 诗社 / AI 诗评 ===== */

    /* 首页今日热议 / 聊一聊三档：tab=hot|new|following（社区帖+动态+诗作混合流） */
    if (url.pathname === "/api/feed" && req.method === "GET") {
      const viewer = sessionUser(req);
      const tab = url.searchParams.get("tab") || "hot";
      const per = Math.min(30, Number(url.searchParams.get("per")) || 12);
      const conds = ["p.status = 'approved'"];
      const args = [];
      if (tab === "mine") {
        if (!viewer) return send(res, 200, { ok: true, tab, items: [] });
        conds.length = 0;
        conds.push("p.status != 'removed'", "p.author_id = ?");
        args.push(viewer.id);
      }
      if (tab === "following") {
        if (!viewer) return send(res, 200, { ok: true, tab, items: [] });
        conds.push("p.author_id IN (SELECT followee_id FROM follows WHERE follower_id = ?)");
        args.push(viewer.id);
      }
      const order =
        tab === "mine" ? "p.created_at DESC" :
        tab === "new" ? "p.created_at DESC" :
        tab === "following" ? "p.created_at DESC" :
        "(p.like_count * 3 + p.view_count / 5) DESC, p.created_at DESC";
      const rows = db.prepare(
        `SELECT p.id, p.author_id, p.title, p.content, p.tag, p.type, p.topic_id, p.like_count, p.view_count, p.created_at,
                u.username AS author_name, u.avatar AS author_avatar, u.points AS author_points
         FROM posts p JOIN users u ON u.id = p.author_id
         WHERE ${conds.join(" AND ")} ORDER BY ${order} LIMIT ?`
      ).all(...args, per);
      return send(res, 200, {
        ok: true,
        tab,
        items: rows.map((r) => ({
          id: r.id, title: r.title, content: r.content, tag: r.tag, type: r.type,
          topic_id: r.topic_id, like_count: r.like_count, view_count: r.view_count, created_at: r.created_at,
          author: { id: r.author_id, username: r.author_name, avatar: r.author_avatar, points: r.author_points },
        })),
      });
    }

    /* 诗社题目列表：kind=poem_topic|fill|feihua&difficulty= */
    if (url.pathname === "/api/topics" && req.method === "GET") {
      const kind = url.searchParams.get("kind") || "poem_topic";
      const difficulty = url.searchParams.get("difficulty") || "all";
      const conds = ["t.status = 'active'", "t.kind = ?"];
      const args = [kind];
      if (difficulty !== "all") {
        conds.push("t.difficulty = ?");
        args.push(difficulty);
      }
      const rows = db.prepare(
        `SELECT t.id, t.kind, t.title, t.content, t.theme, t.difficulty, t.is_current, t.official, t.like_count, t.created_at,
                (SELECT COUNT(*) FROM posts p WHERE p.topic_id = t.id AND p.status = 'approved') AS join_count
         FROM topics t WHERE ${conds.join(" AND ")} ORDER BY t.is_current DESC, t.created_at DESC`
      ).all(...args);
      return send(res, 200, { ok: true, items: rows });
    }

    /* 用户出题：登录用户可提交诗题/填字/飞花（官方=0，不抢占当期） */
    if (url.pathname === "/api/topics" && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const body = await readBody(req, 10_000);
      const { kind, title, content, theme, difficulty } = JSON.parse(body || "{}");
      const k = String(kind || "");
      if (!["poem_topic", "fill", "feihua"].includes(k)) return send(res, 400, { ok: false, msg: "题目类型无效" });
      const t = String(title || "").trim();
      if (!t) return send(res, 400, { ok: false, msg: "请填写题目内容" });
      if (t.length > 80) return send(res, 400, { ok: false, msg: "题目最多 80 字" });
      const c = String(content || "").trim().slice(0, 500);
      const th = String(theme || "").trim().slice(0, 20) || null;
      const df = ["beginner", "intermediate", "advanced"].includes(difficulty) ? difficulty : "intermediate";
      const dup = db.prepare("SELECT id FROM topics WHERE kind = ? AND title = ?").get(k, t);
      if (dup) return send(res, 400, { ok: false, msg: "这道题已经有人出过了" });
      const info = db.prepare(
        "INSERT INTO topics (kind, title, content, theme, difficulty, status, is_current, official, created_at) VALUES (?, ?, ?, ?, ?, 'active', 0, 0, ?)"
      ).run(k, t, c, th, df, Date.now());
      logAudit(u.id, u.username, "用户出题", `${k}:${t.slice(0, 30)}`, `官方=0，等待运营挑选`);
      return send(res, 200, { ok: true, id: Number(info.lastInsertRowid) });
    }

    /* 话题详情（诗题/填字/飞花的作品流） */
    const topicMatch = url.pathname.match(/^\/api\/topics\/(\d+)$/);
    if (topicMatch && req.method === "GET") {
      const t = db.prepare("SELECT * FROM topics WHERE id = ? AND status = 'active'").get(Number(topicMatch[1]));
      if (!t) return send(res, 404, { ok: false, msg: "话题不存在" });
      const posts = db.prepare(
        `SELECT p.id, p.author_id, p.title, p.content, p.type, p.like_count, p.created_at,
                u.username AS author_name, u.avatar AS author_avatar
         FROM posts p JOIN users u ON u.id = p.author_id
         WHERE p.topic_id = ? AND p.status = 'approved' ORDER BY p.like_count DESC, p.created_at DESC LIMIT 50`
      ).all(t.id);
      return send(res, 200, {
        ok: true,
        topic: t,
        items: posts.map((r) => ({
          id: r.id, title: r.title, content: r.content, type: r.type, like_count: r.like_count, created_at: r.created_at,
          author: { id: r.author_id, username: r.author_name, avatar: r.author_avatar },
        })),
      });
    }

    /* @诗评：评论区触发 AI 评诗（每用户每日 3 次额度） */
    if (url.pathname === "/api/ai/review" && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const body = await readBody(req, 10_000);
      const { post_id } = JSON.parse(body || "{}");
      const pid = Number(post_id);
      const post = db.prepare("SELECT * FROM posts WHERE id = ? AND status = 'approved'").get(pid);
      if (!post) return send(res, 404, { ok: false, msg: "作品不存在" });
      const todayStart = new Date(`${dayOf(Date.now())}T00:00:00`).getTime();
      const used = db.prepare("SELECT COUNT(*) c FROM ai_reviews WHERE trigger_user_id = ? AND created_at >= ?").get(u.id, todayStart).c;
      if (used >= 3) return send(res, 400, { ok: false, msg: "今日 @诗评 额度已用完（3 次），明日再来" });
      const existed = db.prepare("SELECT * FROM ai_reviews WHERE post_id = ?").get(pid);
      if (existed) return send(res, 200, { ok: true, review: existed, reused: true });
      const review = composeAiReview(post);
      const info = db.prepare("INSERT INTO ai_reviews (post_id, trigger_user_id, content, created_at) VALUES (?, ?, ?, ?)")
        .run(pid, u.id, review, Date.now());
      return send(res, 200, {
        ok: true,
        review: { id: Number(info.lastInsertRowid), post_id: pid, trigger_user_id: u.id, content: review, created_at: Date.now() },
      });
    }

    /* 每日签到 */
    if (url.pathname === "/api/checkin" && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const today = dayOf(Date.now());
      const row = db.prepare("SELECT last_checkin FROM users WHERE id = ?").get(u.id);
      if (row && row.last_checkin === today) return send(res, 200, { ok: false, msg: "今天已签到，明天再来" });
      db.prepare("UPDATE users SET last_checkin = ? WHERE id = ?").run(today, u.id);
      grantPoints(u.id, 5, "checkin", today);
      return send(res, 200, { ok: true, delta: 5 });
    }

    /* 我的积分明细 */
    if (url.pathname === "/api/points" && req.method === "GET") {
      const u = needAuth(req, res);
      if (!u) return;
      const logs = db.prepare("SELECT id, delta, reason, ref, created_at FROM points_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(u.id);
      const me = meWithStats(u);
      return send(res, 200, { ok: true, points: me.points, level: me.level, level_name: me.level_name, logs });
    }

    /* 关注 / 取关 */
    if (url.pathname === "/api/follow" && req.method === "POST") {
      const u = needAuth(req, res);
      if (!u) return;
      const body = await readBody(req, 10_000);
      const { user_id, action } = JSON.parse(body || "{}");
      const uid = Number(user_id);
      if (!uid || uid === u.id) return send(res, 400, { ok: false, msg: "参数错误" });
      const target = db.prepare("SELECT id FROM users WHERE id = ?").get(uid);
      if (!target) return send(res, 404, { ok: false, msg: "用户不存在" });
      if (action === "unfollow") {
        db.prepare("DELETE FROM follows WHERE follower_id = ? AND followee_id = ?").run(u.id, uid);
      } else {
        db.prepare("INSERT OR IGNORE INTO follows (follower_id, followee_id, created_at) VALUES (?, ?, ?)").run(u.id, uid, Date.now());
      }
      return send(res, 200, { ok: true });
    }

    /* 用户的关注列表 */
    if (url.pathname === "/api/follows" && req.method === "GET") {
      const uid = Number(url.searchParams.get("user_id")) || 0;
      const rows = db.prepare(
        "SELECT u.id, u.username, u.avatar, u.points FROM follows f JOIN users u ON u.id = f.followee_id WHERE f.follower_id = ? ORDER BY f.created_at DESC"
      ).all(uid);
      return send(res, 200, { ok: true, items: rows });
    }

    /* 用户公开主页（个人空间对外视图） */
    const userMatch = url.pathname.match(/^\/api\/users\/(\d+)$/);
    if (userMatch && req.method === "GET") {
      const uid = Number(userMatch[1]);
      const row = db.prepare("SELECT id, username, avatar, signature, bg_image, points, created_at, role FROM users WHERE id = ? AND status = 'active'").get(uid);
      if (!row) return send(res, 404, { ok: false, msg: "用户不存在" });
      const posts = db.prepare(
        "SELECT id, title, content, type, like_count, created_at FROM posts WHERE author_id = ? AND status = 'approved' ORDER BY created_at DESC LIMIT 50"
      ).all(uid);
      const followers = db.prepare("SELECT COUNT(*) c FROM follows WHERE followee_id = ?").get(uid).c;
      const following = db.prepare("SELECT COUNT(*) c FROM follows WHERE follower_id = ?").get(uid).c;
      const lv = levelOf(row.points);
      return send(res, 200, {
        ok: true,
        user: { id: row.id, username: row.username, avatar: row.avatar, signature: row.signature, bg_image: row.bg_image, points: row.points, level: lv, level_name: LEVEL_NAMES[lv - 1] || "元老", followers, following, created_at: row.created_at },
        items: posts,
      });
    }

    if (url.pathname === "/api/admin/health") {
      const u = needAdmin(req, res);
      if (!u) return;
      const mem = process.memoryUsage();
      const st = fs.statfsSync("/");
      return send(res, 200, {
        ok: true,
        memRSS_MB: Math.round(mem.rss / 1024 / 1024),
        memTotal_MB: Math.round(osTotalMemMB()),
        diskFree_GB: Math.round((st.bavail * st.bsize) / 1024 / 1024 / 1024),
        dbSize_KB: Math.round(fs.statSync(path.join(DATA_DIR, "hlm.db")).size / 1024),
        uptime_s: Math.round(process.uptime()),
      });
    }

    /* ===== 管理后台页面 ===== */
    if (url.pathname === "/admin" || url.pathname === "/admin/" || url.pathname === "/api/admin" || url.pathname === "/api/admin/") {
      const keyOk = url.searchParams.get("key") === ADMIN_KEY;
      const me = sessionUser(req);
      if (!me || me.role !== "admin") {
        if (keyOk) {
          res.writeHead(302, { Location: "?view=overview" });
          return res.end();
        }
        res.writeHead(401, { "Content-Type": "text/html; charset=utf-8" });
        return res.end("<h1>401</h1><p>需要管理员登录：<a href='/honglou-yuzhou/login/?next=%2Fadmin'>去登录</a></p>");
      }
      const view = url.searchParams.get("view") || "overview";
      let content = adminOverviewHtml(me);
      if (view === "posts") content = adminPostsHtml();
      if (view === "comments") content = adminCommentsHtml();
      if (view === "users") content = adminUsersHtml();
      if (view === "invites") content = adminInvitesHtml();
      if (view === "logs") content = adminLogsHtml();
      if (view === "user") content = adminUserContentHtml(Number(url.searchParams.get("id")) || 0);
      return res.end(`${PAGE_HEAD}${adminNav(view)}${content}${PAGE_FOOT}`);
    }
  } catch (e) {
    if (!res.headersSent) return send(res, 500, { ok: false, msg: e.message });
    return;
  }

  if (!res.headersSent) send(res, 404, { ok: false });
});

function osTotalMemMB() {
  try {
    const total = require("os").totalmem();
    return total / 1024 / 1024;
  } catch {
    return 0;
  }
}

/* ---------- 每小时健康日志（内存水位监测） ---------- */
setInterval(() => {
  try {
    const mem = process.memoryUsage();
    const st = fs.statfsSync("/");
    appendLine("health.log", {
      ts: Date.now(),
      memRSS_MB: Math.round(mem.rss / 1024 / 1024),
      diskFree_GB: Math.round((st.bavail * st.bsize) / 1024 / 1024 / 1024),
    });
  } catch {}
}, 3600_000);

/* ===== 第二阶段工具：积分 / 等级 / AI 诗评 ===== */
const LEVEL_NAMES = ["懵懂", "试才", "通灵", "元老"];
const LEVEL_THRESHOLDS = [0, 200, 600, 1500];
function levelOf(points) {
  let lv = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) lv = i + 1;
  }
  return lv;
}
function grantPoints(userId, delta, reason, ref) {
  db.prepare("INSERT INTO points_log (user_id, delta, reason, ref, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(userId, delta, reason, ref || null, Date.now());
  db.prepare("UPDATE users SET points = points + ? WHERE id = ?").run(delta, userId);
}
function meWithStats(u) {
  const row = db.prepare("SELECT points, last_checkin FROM users WHERE id = ?").get(u.id);
  const points = row ? row.points : 0;
  const followers = db.prepare("SELECT COUNT(*) c FROM follows WHERE followee_id = ?").get(u.id).c;
  const following = db.prepare("SELECT COUNT(*) c FROM follows WHERE follower_id = ?").get(u.id).c;
  const lv = levelOf(points);
  return { ...u, points, level: lv, level_name: LEVEL_NAMES[lv - 1] || "元老", followers, following };
}
function hashOf(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}
/* 本地 AI 诗评（默认兜底；接入外部大模型时替换为 API 调用） */
function composeAiReview(post) {
  const text = `${post.title || ""} ${post.content || ""}`;
  const lines = String(post.content || "")
    .split(/[\n，。！？；、]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const notes = [];
  /* 押韵粗查（末字韵母分组） */
  const lastChars = lines.map((l) => l.slice(-1)).filter(Boolean);
  if (lastChars.length >= 2) {
    const rhymeGroups = ["ang", "an", "ao", "eng", "en", "ian", "iao", "iang", "ing", "in", "ong", "ong", "ou", "uan", "uang", "uo", "un", "ui", "a", "e", "i", "o", "u"];
    const endings = lastChars.map((ch) => {
      for (const g of rhymeGroups) {
        if (ch.endsWith(g)) return g;
        if (g.slice(-1) === ch.slice(-1)) return g.slice(-1);
      }
      return ch.slice(-1);
    });
    const uniq = new Set(endings);
    if (uniq.size <= Math.max(1, endings.length - 1)) notes.push("末字押韵合辙，读来顺口");
    else notes.push("末字韵脚若能统一，音律更佳");
  } else {
    notes.push("句短意赅，胜在留白");
  }
  if (text.includes("［") || text.includes("[")) {
    notes.push("对仗上建议前后句词性相对（名词对名词、动词对动词）");
  } else if (lines.length >= 2 && lines[0].length === lines[1].length) {
    notes.push("句式齐整，对仗基础好，可再于炼字上求险");
  } else {
    notes.push("句子长短有致，重在气脉连贯");
  }
  if (text.length < 24) notes.push("篇幅虽短，贵在言有尽而意无穷");
  const opens = ["意境清新", "用词不俗", "别有意趣", "情致动人", "颇具巧思", "气象开阔"];
  const pick = opens[(hashOf(text) >>> 0) % opens.length];
  return `${pick}。${notes.join("；")}。整体不俗，若再于格律上打磨，可入诗刊。`;
}

/* ---------- 演示测试统计种子（仅首次、仅空库时插入） ---------- */
function seedDemoTestResults() {
  const c = db.prepare("SELECT COUNT(*) c FROM test_results").get().c;
  if (c > 0) return;
  const demo = [
    [1001, "daiyu", "character_lin_daiyu"],
    [1002, "daiyu", "character_lin_daiyu"],
    [1003, "daiyu", "character_lin_daiyu"],
    [1004, "daiyu", "character_lin_daiyu"],
    [1005, "daiyu", "character_lin_daiyu"],
    [1006, "daiyu", "character_lin_daiyu"],
    [1007, "daiyu", "character_lin_daiyu"],
    [1008, "daiyu", "character_lin_daiyu"],
    [1009, "baochai", "character_xue_baochai"],
    [1010, "baochai", "character_xue_baochai"],
    [1011, "baochai", "character_xue_baochai"],
    [1012, "baochai", "character_xue_baochai"],
    [1013, "baochai", "character_xue_baochai"],
    [1014, "baochai", "character_xue_baochai"],
    [1015, "fengjie", "character_wang_xifeng"],
    [1016, "fengjie", "character_wang_xifeng"],
    [1017, "fengjie", "character_wang_xifeng"],
    [1018, "fengjie", "character_wang_xifeng"],
    [1019, "fengjie", "character_wang_xifeng"],
    [1020, "baoyu", "character_jia_baoyu"],
    [1021, "baoyu", "character_jia_baoyu"],
    [1022, "baoyu", "character_jia_baoyu"],
    [1023, "baoyu", "character_jia_baoyu"],
    [1024, "xiangyun", "character_shi_xiangyun"],
    [1025, "xiangyun", "character_shi_xiangyun"],
    [1026, "xiangyun", "character_shi_xiangyun"],
    [1027, "tanchun", "character_jia_tanchun"],
    [1028, "tanchun", "character_jia_tanchun"],
    [1029, "jiamu", "character_jia_mu"],
    [1030, "miaoyu", "character_miao_yu"],
    [1031, "liwan", "character_li_wan"],
    [1032, "qingwen", "character_qingwen"],
  ];
  const now = Date.now();
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO test_results (user_id, archetype_id, character_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
  );
  for (const [uid, aid, cid] of demo) stmt.run(uid, aid, cid, now, now);
}

/* ---------- 演示用户 + 帖子种子（让他人主页 / 关注按钮有真实对象可看） ---------- */
function seedDemoUsers() {
  const c = db.prepare("SELECT COUNT(*) c FROM users").get().c;
  if (c > 1) return;
  const now = Date.now();
  const demoUsers = [
    {
      username: "蘅芜君",
      signature: "任是无情也动人",
      posts: [
        { title: "宝钗的「冷香丸」到底隐喻什么？", content: "「冷香丸」的配方取四季花蕊、四水之霜露，实则是宝钗「藏愚守拙、随分从时」性格的物化。她以「冷」制「热毒」，正对应她压抑真情、以礼自持的处世之道。", tag: "人物讨论" },
        { title: "「金玉良缘」是不是宝钗的本意？", content: "宝钗对金玉之说一向「总远着宝玉」，她何尝愿意被「金锁」捆绑一生？与其说宝钗要嫁宝玉，不如说是家族利益把她推到了那个位置。", tag: "观点争鸣" },
      ],
    },
    {
      username: "枕霞旧友",
      signature: "是真名士自风流",
      posts: [
        { title: "湘云醉卧芍药裀——大观园里最洒脱的一幕", content: "湘云醉眠石凳，四面芍药花飞了一身，满头脸衣襟上皆是红香散乱。这一幕是全书写「天真烂漫」的极致，也是「任情率性」与「礼教」对比最鲜明的一笔。", tag: "人物讨论" },
      ],
    },
  ];
  const insUser = db.prepare("INSERT INTO users (username, pass_hash, role, status, created_at, signature, points) VALUES (?, ?, 'user', 'active', ?, ?, ?)");
  const insPost = db.prepare("INSERT INTO posts (author_id, title, content, tag, images, status, type, created_at) VALUES (?, ?, ?, ?, '[]', 'approved', 'post', ?)");
  for (const u of demoUsers) {
    if (db.prepare("SELECT id FROM users WHERE username = ?").get(u.username)) continue;
    const info = insUser.run(u.username, hashPassword("Test12345"), now, u.signature, 20);
    const uid = Number(info.lastInsertRowid);
    for (const p of u.posts) insPost.run(uid, p.title, p.content, p.tag, now);
  }
}

server.listen(PORT, () => {
  // 演示用：首次启动且无测试结果时，播种一批测试统计（让「站内同好统计」有数据可显）
  try {
    seedDemoTestResults();
    seedDemoUsers();
  } catch {}
  console.log(`honglou-yuzhou api listening on :${PORT}`);
});
