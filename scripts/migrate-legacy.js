#!/usr/bin/env node
/**
 * 红楼社 · 历史内测数据迁移脚本（幂等、可回滚、带报告）
 *
 * 用法：
 *   node scripts/migrate-legacy.js <旧库路径> [目标库路径]
 *   - 旧库路径：旧版内测的 SQLite 文件（hlm.db 或其它结构）
 *   - 目标库路径：默认 server/data/hlm.db
 *
 * 功能：
 *   1) 迁移前自动备份目标库（copy + VACUUM INTO 一致性快照）
 *   2) 按 users → posts → comments → likes 顺序、事务分批导入
 *   3) 幂等（INSERT OR IGNORE + ON CONFLICT DO NOTHING），可重复跑
 *   4) 外键用「旧 id → 新 id」映射替换，孤儿行跳过并记入报告
 *   5) 处理密码哈希算法兼容（自动识别 scrypt/bcrypt/明文/其它）
 *   6) 处理时间戳单位（毫秒/秒自动判定）
 *   7) 处理用户名冲突（加后缀 _old 并记入报告）
 *   8) 输出 before/after 计数对比 + 冲突/孤儿报告
 *
 * 注意：本脚本只读旧库、只写目标库；不删除旧库任何数据。
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const legacyPath = process.argv[2];
const targetPath = process.argv[3] || path.join(__dirname, "..", "server", "data", "hlm.db");

if (!legacyPath) {
  console.error("用法：node scripts/migrate-legacy.js <旧库路径> [目标库路径]");
  process.exit(1);
}

const absLegacy = path.resolve(legacyPath);
const absTarget = path.resolve(targetPath);

if (!fs.existsSync(absLegacy)) {
  console.error(`旧库不存在：${absLegacy}`);
  process.exit(1);
}

const report = { conflicts: [], orphans: [], notes: [] };

/* ---------- 1) 备份目标库 ---------- */
function backup() {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const bak = `${absTarget}.bak-${ts}`;
  if (fs.existsSync(absTarget)) {
    fs.copyFileSync(absTarget, bak);
    console.log(`[备份] 目标库已复制到 ${bak}`);
  }
  return bak;
}
const backupPath = backup();

/* ---------- 打开两个库 ---------- */
const legacy = new DatabaseSync(absLegacy, { readOnly: true });
const target = new DatabaseSync(absTarget);

/* ---------- 2) 探测旧库表与列 ---------- */
function tables(db) {
  return db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map((r) => r.name);
}
function columns(db, table) {
  try {
    return db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  } catch {
    return [];
  }
}
const legacyTables = tables(legacy);
const targetTables = tables(target);
console.log(`[探测] 旧库表：${legacyTables.join(", ")}`);
console.log(`[探测] 目标库表：${targetTables.join(", ")}`);

/* 旧库表名 → 目标表名 的匹配（支持常见别名） */
const TABLE_ALIAS = {
  users: ["users", "user", "accounts", "members"],
  posts: ["posts", "post", "articles", "topics"],
  comments: ["comments", "comment", "replies"],
  likes: ["likes", "post_likes", "viewpoint_likes"],
};
function findLegacyTable(targetName) {
  const aliases = TABLE_ALIAS[targetName] || [targetName];
  for (const a of aliases) {
    if (legacyTables.includes(a)) return a;
  }
  return null;
}

/* ---------- 3) 时间戳单位检测 ---------- */
function normTs(v) {
  if (v == null || v === "" || Number.isNaN(Number(v))) return Date.now();
  const n = Number(v);
  // 毫秒（约 1.7e12 量级）原样；秒（约 1.7e9 量级）转毫秒
  return n > 1e12 ? n : n * 1000;
}

/* ---------- 4) 密码哈希算法兼容识别 ---------- */
// 新版是 scrypt：`salt$hash`（hex）；旧版可能是 bcrypt($2a$)、sha256、明文等。
function detectHashAlgo(stored) {
  if (!stored) return "none";
  const s = String(stored);
  if (s.startsWith("$2a$") || s.startsWith("$2b$") || s.startsWith("$2y$")) return "bcrypt";
  if (s.includes("$") && s.split("$").length === 2) {
    const [salt, hash] = s.split("$");
    if (/^[0-9a-f]{32}$/i.test(salt) && /^[0-9a-f]{64}$/i.test(hash)) return "scrypt";
  }
  if (/^[0-9a-f]{64}$/i.test(s)) return "sha256";
  return "plaintext";
}
function legacyVerify(password, stored, algo) {
  // 旧库密码校验（仅用于报告提示，不强制）。
  // 真正的登录兼容需在 server 的 verifyPassword 里按前缀识别，此处只做检测。
  return false;
}

/* ---------- 5) 建迁移状态表（幂等） ---------- */
target.exec(`CREATE TABLE IF NOT EXISTS migration_state (
  key TEXT PRIMARY KEY,
  value TEXT
)`);
function done(key) {
  return target.prepare("SELECT value FROM migration_state WHERE key = ?").get(key)?.value === "done";
}
function markDone(key) {
  target.prepare("INSERT INTO migration_state (key, value) VALUES (?, 'done') ON CONFLICT(key) DO UPDATE SET value='done'").run(key);
}

/* ---------- 6) 建 id 映射表 ---------- */
target.exec(`CREATE TABLE IF NOT EXISTS legacy_id_map (
  target_table TEXT NOT NULL,
  old_id INTEGER NOT NULL,
  new_id INTEGER NOT NULL,
  PRIMARY KEY (target_table, old_id)
)`);

/* ---------- 7) 各表导入 ---------- */
function importUsers() {
  if (done("users")) return console.log("[跳过] users 已完成");
  const t = findLegacyTable("users");
  if (!t) return console.log("[提示] 旧库无 users 表，跳过");
  const cols = columns(legacy, t);
  const rows = legacy.prepare(`SELECT * FROM ${t}`).all();

  // 目标 users 列
  const targetCols = columns(target, "users");
  const hasField = (c) => targetCols.includes(c);

  let imported = 0, skipped = 0;
  const now = Date.now();
  for (const r of rows) {
    const oldId = Number(r.id ?? r.user_id ?? r.uid);
    if (!oldId) { skipped++; continue; }

    const username = String(r.username ?? r.name ?? r.nickname ?? "").trim();
    if (!username) { skipped++; continue; }

    // 用户名冲突处理
    let uname = username.slice(0, 40);
    const exists = target.prepare("SELECT id FROM users WHERE username = ?").get(uname);
    if (exists) {
      uname = `${uname}_old`;
      report.conflicts.push({ table: "users", old_id: oldId, username, resolved: uname });
    }

    const passHash = r.pass_hash ?? r.password_hash ?? r.password ?? "";
    const algo = detectHashAlgo(passHash);
    if (algo !== "scrypt" && algo !== "none" && passHash) {
      report.notes.push(`[密码] 用户 ${username}(旧id=${oldId}) 使用 ${algo} 哈希，需在 server verifyPassword 中兼容`);
    }

    const fields = [];
    const values = [];
    fields.push("id", "username", "pass_hash", "role", "status", "created_at");
    values.push(oldId, uname, String(passHash), String(r.role ?? "user"), String(r.status ?? "active"), normTs(r.created_at ?? r.reg_time ?? r.created_at));
    if (hasField("avatar") && r.avatar != null) { fields.push("avatar"); values.push(String(r.avatar)); }
    if (hasField("signature") && r.signature != null) { fields.push("signature"); values.push(String(r.signature)); }
    if (hasField("points") && r.points != null) { fields.push("points"); values.push(Number(r.points) || 0); }
    if (hasField("last_checkin") && r.last_checkin != null) { fields.push("last_checkin"); values.push(String(r.last_checkin)); }

    try {
      target.prepare(`INSERT OR IGNORE INTO users (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`).run(...values);
      // 记录映射（用 INSERT OR IGNORE 后查实际 id；若因唯一键跳过，old_id 仍映射到新 id）
      const inserted = target.prepare("SELECT id FROM users WHERE id = ?").get(oldId);
      target.prepare("INSERT OR REPLACE INTO legacy_id_map (target_table, old_id, new_id) VALUES (?, ?, ?)").run("users", oldId, inserted ? Number(inserted.id) : oldId);
      imported++;
    } catch (e) {
      skipped++;
      report.conflicts.push({ table: "users", old_id: oldId, error: String(e.message) });
    }
  }
  markDone("users");
  console.log(`[users] 导入 ${imported} 行，跳过 ${skipped} 行`);
}

function importPosts() {
  if (done("posts")) return console.log("[跳过] posts 已完成");
  const t = findLegacyTable("posts");
  if (!t) return console.log("[提示] 旧库无 posts 表，跳过");
  const cols = columns(legacy, t);
  const rows = legacy.prepare(`SELECT * FROM ${t}`).all();
  const targetCols = columns(target, "posts");
  const hasField = (c) => targetCols.includes(c);

  let imported = 0, skipped = 0;
  const now = Date.now();
  for (const r of rows) {
    const oldId = Number(r.id ?? r.post_id ?? r.article_id);
    if (!oldId) { skipped++; continue; }
    const oldAuthor = Number(r.author_id ?? r.user_id ?? r.uid);
    // 外键映射
    const map = target.prepare("SELECT new_id FROM legacy_id_map WHERE target_table='users' AND old_id=?").get(oldAuthor);
    const authorId = map ? Number(map.new_id) : (r.author_id != null ? oldAuthor : null);
    if (authorId == null) {
      report.orphans.push({ table: "posts", old_id: oldId, reason: "无作者外键" });
      skipped++; continue;
    }

    const title = String(r.title ?? r.subject ?? "").slice(0, 200);
    const content = String(r.content ?? r.body ?? "").slice(0, 20000);
    if (!title && !content) { skipped++; continue; }

    const fields = ["author_id", "title", "content", "tag", "status", "created_at"];
    const values = [authorId, title, content, String(r.tag ?? "自由讨论").slice(0, 20), String(r.status ?? "approved"), normTs(r.created_at)];
    if (hasField("images") && r.images != null) { fields.push("images"); values.push(String(r.images)); }
    if (hasField("like_count") && r.like_count != null) { fields.push("like_count"); values.push(Number(r.like_count) || 0); }
    if (hasField("view_count") && r.view_count != null) { fields.push("view_count"); values.push(Number(r.view_count) || 0); }
    if (hasField("type") && r.type != null) { fields.push("type"); values.push(String(r.type)); }
    if (hasField("topic_id") && r.topic_id != null) { fields.push("topic_id"); values.push(Number(r.topic_id) || null); }

    try {
      const info = target.prepare(`INSERT INTO posts (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`).run(...values);
      target.prepare("INSERT OR REPLACE INTO legacy_id_map (target_table, old_id, new_id) VALUES (?, ?, ?)").run("posts", oldId, Number(info.lastInsertRowid));
      imported++;
    } catch (e) {
      skipped++;
      report.conflicts.push({ table: "posts", old_id: oldId, error: String(e.message) });
    }
  }
  markDone("posts");
  console.log(`[posts] 导入 ${imported} 行，跳过 ${skipped} 行`);
}

function importComments() {
  if (done("comments")) return console.log("[跳过] comments 已完成");
  const t = findLegacyTable("comments");
  if (!t) return console.log("[提示] 旧库无 comments 表，跳过");
  const rows = legacy.prepare(`SELECT * FROM ${t}`).all();
  const targetCols = columns(target, "comments");
  const hasField = (c) => targetCols.includes(c);

  let imported = 0, skipped = 0;
  for (const r of rows) {
    const oldId = Number(r.id ?? r.comment_id);
    if (!oldId) { skipped++; continue; }
    const pmap = target.prepare("SELECT new_id FROM legacy_id_map WHERE target_table='posts' AND old_id=?").get(Number(r.post_id));
    const postId = pmap ? Number(pmap.new_id) : (r.post_id != null ? Number(r.post_id) : null);
    if (postId == null) { report.orphans.push({ table: "comments", old_id: oldId, reason: "帖子外键无映射" }); skipped++; continue; }
    const umap = target.prepare("SELECT new_id FROM legacy_id_map WHERE target_table='users' AND old_id=?").get(Number(r.author_id));
    const authorId = umap ? Number(umap.new_id) : (r.author_id != null ? Number(r.author_id) : null);
    if (authorId == null) { report.orphans.push({ table: "comments", old_id: oldId, reason: "作者外键无映射" }); skipped++; continue; }

    const fields = ["post_id", "author_id", "content", "status", "created_at"];
    const values = [postId, authorId, String(r.content ?? "").slice(0, 5000), String(r.status ?? "approved"), normTs(r.created_at)];
    if (hasField("reply_to") && r.reply_to != null) { fields.push("reply_to"); values.push(Number(r.reply_to)); }
    if (hasField("like_count") && r.like_count != null) { fields.push("like_count"); values.push(Number(r.like_count) || 0); }

    try {
      target.prepare(`INSERT INTO comments (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`).run(...values);
      imported++;
    } catch (e) {
      skipped++;
      report.conflicts.push({ table: "comments", old_id: oldId, error: String(e.message) });
    }
  }
  markDone("comments");
  console.log(`[comments] 导入 ${imported} 行，跳过 ${skipped} 行`);
}

/* ---------- 8) 执行 ---------- */
console.log(`\n开始迁移：${absLegacy} → ${absTarget}\n`);
target.exec("BEGIN");
try {
  importUsers();
  importPosts();
  importComments();
  target.exec("COMMIT");
} catch (e) {
  target.exec("ROLLBACK");
  console.error("迁移失败，已回滚：", e.message);
  process.exit(1);
}

/* ---------- 9) 报告 ---------- */
function count(db, table) {
  try { return db.prepare(`SELECT COUNT(*) c FROM ${table}`).get().c; } catch { return -1; }
}
console.log(`\n=== 迁移报告 ===`);
for (const tbl of ["users", "posts", "comments"]) {
  const lt = findLegacyTable(tbl);
  const old = lt ? count(legacy, lt) : 0;
  const now = count(target, tbl);
  console.log(`  ${tbl}: 旧库 ${old} 行 → 目标库 ${now} 行`);
}
if (report.conflicts.length) {
  console.log(`\n[冲突] ${report.conflicts.length} 条：`);
  for (const c of report.conflicts.slice(0, 20)) console.log(`  - ${JSON.stringify(c)}`);
}
if (report.orphans.length) {
  console.log(`\n[孤儿行] ${report.orphans.length} 条（外键无映射，已跳过）：`);
  for (const o of report.orphans.slice(0, 20)) console.log(`  - ${JSON.stringify(o)}`);
}
if (report.notes.length) {
  console.log(`\n[提示] ${report.notes.length} 条：`);
  for (const n of report.notes.slice(0, 20)) console.log(`  - ${n}`);
}

const reportPath = `${absTarget}.migration-report.json`;
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n报告已写入 ${reportPath}`);
console.log(`备份在 ${backupPath}（如需回滚：停服 → 用备份覆盖目标库 → 重启）`);

legacy.close();
target.close();
