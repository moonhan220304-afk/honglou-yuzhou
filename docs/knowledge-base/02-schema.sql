-- ============================================================
-- 02 — PostgreSQL DDL (完整可执行建表 SQL)
-- RedMansion Knowledge Base V1
-- 数据库名：redmansion_kb
-- ============================================================

-- 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 全文模糊搜索

-- ============================================================
-- 枚举类型
-- ============================================================

-- 章节归属（前 80 回曹雪芹 / 后 40 回高鹗续书）
CREATE TYPE chapter_attribution AS ENUM ('caoxueqin', 'gaoe');

-- 事件层级
CREATE TYPE event_level_type AS ENUM ('major', 'minor', 'micro');

-- 关系方向
CREATE TYPE relationship_direction AS ENUM ('mutual', 'one-way');

-- 来源类型
CREATE TYPE source_type AS ENUM ('original_text', 'zhi_ping', 'hongxue_paper');

-- 审核状态
CREATE TYPE review_status AS ENUM ('draft', 'pending', 'verified');

-- 向量化状态
CREATE TYPE embedding_status_type AS ENUM ('pending', 'indexed', 'failed');

-- 观点类型
CREATE TYPE viewpoint_type AS ENUM ('academic', 'popular', 'disputed');

-- 关系本质类型
CREATE TYPE relationship_nature AS ENUM (
  'kinship',        -- 血缘/姻亲
  'romantic',       -- 情爱
  'friendship',     -- 友谊
  'master_servant', -- 主仆
  'political',      -- 利益/政治联盟
  'rivalry',        -- 竞争/敌对
  'mentorship',     -- 师徒/教导
  'ambiguous'       -- 模糊/多义
);

-- ============================================================
-- 主表
-- ============================================================

-- 1. chapter（章节）— 全 120 回
CREATE TABLE chapter (
  number     INTEGER PRIMARY KEY CHECK (number >= 1 AND number <= 120),
  title      TEXT NOT NULL,                       -- 回目名（如「贾宝玉初试云雨情 刘姥姥一进荣国府」）
  attribution chapter_attribution NOT NULL,       -- caoxueqin / gaoe
  summary    TEXT,
  status     review_status NOT NULL DEFAULT 'draft',
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. character（人物）
CREATE TABLE character (
  id          TEXT PRIMARY KEY,                   -- 如 character_lin_daiyu
  name        TEXT NOT NULL,                      -- 通行本常用名
  aliases     JSONB NOT NULL DEFAULT '[]',        -- ["颦颦", "颦儿", "潇湘妃子", "绛珠仙子"]
  category    TEXT NOT NULL,                      -- 金陵十二钗正册 / 外围人物 / 丫鬟 / 贾府主子 / 其他
  identity    JSONB NOT NULL DEFAULT '{}',        -- { family, position, origin }
  tags        JSONB NOT NULL DEFAULT '[]',        -- ["才情","多愁善感","孤傲"]
  summary     JSONB NOT NULL DEFAULT '{}',        -- { short: "…", long: "…" }
  personality_analysis JSONB NOT NULL DEFAULT '[]', -- [{ dimension, description, evidence_events[] }]
  timeline    JSONB NOT NULL DEFAULT '[]',        -- [{ order, event_id, title }]
  sources     JSONB NOT NULL DEFAULT '[]',        -- [{ source_id, quote, note }]
  status      review_status NOT NULL DEFAULT 'draft',
  confidence  INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  verified_by TEXT,
  embedding_status embedding_status_type NOT NULL DEFAULT 'pending',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. source（证据来源）
CREATE TABLE source (
  id            TEXT PRIMARY KEY,                  -- 如 source_ch03_lin_daiyu_entry
  type          source_type NOT NULL,              -- original_text / zhi_ping / hongxue_paper
  title         TEXT NOT NULL,                     -- 来源标题
  chapter_number INTEGER REFERENCES chapter(number) ON DELETE SET NULL,
  description   TEXT NOT NULL,                     -- 简要说明
  author        TEXT,                              -- 红学论文必填
  year          INTEGER,                           -- 发表年份
  authority     TEXT,                              -- 权威度说明
  controversial BOOLEAN NOT NULL DEFAULT false,    -- 是否为争议性来源
  verification  TEXT,                              -- 校验说明
  status        review_status NOT NULL DEFAULT 'draft',
  confidence    INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. event（事件）
CREATE TABLE event (
  id              TEXT PRIMARY KEY,                 -- 如 event_bury_flowers_ch27
  title           TEXT NOT NULL,                    -- 事件标题
  event_level     event_level_type NOT NULL,        -- major / minor / micro
  chapter_number  INTEGER NOT NULL REFERENCES chapter(number) ON DELETE RESTRICT,
  location        JSONB NOT NULL DEFAULT '{}',      -- { name: "大观园沁芳闸桥边桃花底下", specific: "花冢" }
  summary         JSONB NOT NULL DEFAULT '{}',      -- { short: "…", meaning[]: ["…"] }
  evidence        JSONB NOT NULL DEFAULT '[]',      -- [{ source_id, quote, note }]
  interpretations JSONB NOT NULL DEFAULT '[]',      -- [{ type, title, content }]
  related_events  JSONB NOT NULL DEFAULT '[]',      -- [event_id, ...]
  "order"         INTEGER NOT NULL DEFAULT 0,        -- 叙事顺序（数字）
  status          review_status NOT NULL DEFAULT 'draft',
  confidence      INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  verified_by     TEXT,
  embedding_status embedding_status_type NOT NULL DEFAULT 'pending',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. relationship（关系）
CREATE TABLE relationship (
  id              TEXT PRIMARY KEY,                 -- relationship_{A}_{B}，A 为核心度更高人物
  "from"          TEXT NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  "to"            TEXT NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,                    -- 如「表兄妹」「情人」「主仆」
  nature          relationship_nature[] NOT NULL DEFAULT '{}',
  direction       relationship_direction NOT NULL DEFAULT 'mutual',
  summary         TEXT NOT NULL,                   -- 一句话关系描述
  stages          JSONB NOT NULL DEFAULT '[]',      -- [{ stage, title, chapter, description }]
  evidence_events JSONB NOT NULL DEFAULT '[]',      -- [{ event_id, description }]
  impact          TEXT,                             -- 关系的影响/意义
  status          review_status NOT NULL DEFAULT 'draft',
  confidence      INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  verified_by     TEXT,
  embedding_status embedding_status_type NOT NULL DEFAULT 'pending',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT rel_no_self CHECK ("from" <> "to")
);

-- 6. viewpoint（红学观点）
CREATE TABLE viewpoint (
  id               TEXT PRIMARY KEY,               -- 如 viewpoint_chai_dai_heyi
  title            TEXT NOT NULL,                  -- 观点标题
  type             viewpoint_type NOT NULL,        -- academic / popular / disputed
  author           TEXT NOT NULL,                  -- 提出者
  year             INTEGER,                        -- 提出年份
  source_title     TEXT,                           -- 来源文献/出处
  description      TEXT NOT NULL,                  -- 观点描述
  related_event_ids JSONB NOT NULL DEFAULT '[]',   -- 关联事件
  opinions         JSONB NOT NULL DEFAULT '[]',   -- [{ side, content, proponent }]
  status           review_status NOT NULL DEFAULT 'draft',
  confidence       INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  verified_by      TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 连接表
-- ============================================================

-- 7. character_event（人物时间线）
CREATE TABLE character_event (
  id           SERIAL PRIMARY KEY,
  character_id TEXT NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  event_id     TEXT NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'participant', -- 角色
  note         TEXT,
  "order"      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (character_id, event_id)
);

-- 8. event_participant（事件参与人物）
CREATE TABLE event_participant (
  id           SERIAL PRIMARY KEY,
  event_id     TEXT NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT '参与者',       -- 参与者/见证者/提及者/受影响者
  description  TEXT,
  UNIQUE (event_id, character_id)
);

-- 9. event_evidence（事件↔证据）
CREATE TABLE event_evidence (
  id        SERIAL PRIMARY KEY,
  event_id  TEXT NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES source(id) ON DELETE CASCADE,
  quote     TEXT NOT NULL,                         -- 原文引文
  note      TEXT,
  UNIQUE (event_id, source_id)
);

-- 10. relationship_stage（关系阶段时间线）
CREATE TABLE relationship_stage (
  id              SERIAL PRIMARY KEY,
  relationship_id TEXT NOT NULL REFERENCES relationship(id) ON DELETE CASCADE,
  stage_order     INTEGER NOT NULL,               -- 阶段序号
  title           TEXT NOT NULL,                  -- 阶段标题
  chapter_number  INTEGER REFERENCES chapter(number) ON DELETE SET NULL,
  description     TEXT NOT NULL
);

-- 11. event_interpretation（事件解读）
CREATE TABLE event_interpretation (
  id         SERIAL PRIMARY KEY,
  event_id   TEXT NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'literary',    -- 红学/文学/心理分析
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  source_ref TEXT                                 -- 引用来源
);

-- ============================================================
-- 索引
-- ============================================================

CREATE INDEX idx_character_name ON character USING gin (name gin_trgm_ops);
CREATE INDEX idx_event_chapter ON event (chapter_number);
CREATE INDEX idx_event_level ON event (event_level);
CREATE INDEX idx_relationship_from ON relationship ("from");
CREATE INDEX idx_relationship_to ON relationship ("to");
CREATE INDEX idx_source_type ON source (type);
CREATE INDEX idx_source_chapter ON source (chapter_number);
CREATE INDEX idx_source_controversial ON source (controversial);
CREATE INDEX idx_character_event_char ON character_event (character_id);
CREATE INDEX idx_character_event_event ON character_event (event_id);
CREATE INDEX idx_event_participant_event ON event_participant (event_id);
CREATE INDEX idx_viewpoint_type ON viewpoint (type);

-- 全文搜索索引（用于模糊搜索事件 summary 和 interpretation）
CREATE INDEX idx_event_summary_fts ON event USING gin (to_tsvector('simple', summary::text));
CREATE INDEX idx_character_aliases_fts ON character USING gin (to_tsvector('simple', aliases::text));

-- ============================================================
-- 触发器：自动更新 updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_character_updated_at
  BEFORE UPDATE ON character FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_event_updated_at
  BEFORE UPDATE ON event FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_relationship_updated_at
  BEFORE UPDATE ON relationship FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_source_updated_at
  BEFORE UPDATE ON source FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_chapter_updated_at
  BEFORE UPDATE ON chapter FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_viewpoint_updated_at
  BEFORE UPDATE ON viewpoint FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
