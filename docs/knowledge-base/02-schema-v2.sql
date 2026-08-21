-- ============================================================
-- 02-schema-v2.sql — PostgreSQL DDL (完整可执行建表 SQL)
-- RedMansion Knowledge Base V2
-- 数据库名：redmansion_kb_v2
-- 基于框架：OPENCODE_CONTENT_DATABASE_FRAMEWORK.md + CONTENT_DEPTH_STANDARD.md
-- ============================================================

BEGIN;

-- ============================================================
-- 扩展
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 枚举类型
-- ============================================================

-- 事实分层（全局核心枚举）
CREATE TYPE fact_type AS ENUM (
  'canonical_text_fact',
  'text_inference',
  'scholarly_viewpoint',
  'adaptation_only',
  'disputed_version'
);

-- 内容深度等级
CREATE TYPE content_level AS ENUM ('L1', 'L2', 'L3');

-- 人物重要度
CREATE TYPE importance_level AS ENUM ('core', 'major', 'secondary');

-- 审核状态
CREATE TYPE review_status AS ENUM ('draft', 'pending', 'verified');

-- 向量化状态
CREATE TYPE embedding_status_type AS ENUM ('pending', 'indexed', 'failed');

-- 章节归属（前 80 回 / 后 40 回）
CREATE TYPE chapter_attribution AS ENUM ('caoxueqin', 'gaoe');

-- 事件层级
CREATE TYPE event_level_type AS ENUM ('major', 'minor', 'micro');

-- 事件类型
CREATE TYPE event_type AS ENUM (
  'personal', 'social', 'political', 'ceremonial',
  'tragic', 'poetic', 'domestic', 'public', 'symbolic', 'other'
);

-- 别名 / 称谓类型
CREATE TYPE alias_type AS ENUM (
  'courtesy', 'nickname', 'title', 'family_address',
  'servant_address', 'other'
);

-- 关系本质类型
CREATE TYPE relationship_nature AS ENUM (
  'kinship', 'romantic', 'friendship', 'master_servant',
  'political', 'rivalry', 'mentorship', 'marriage',
  'social_alliance', 'symbolic_parallel', 'patronage',
  'conflict', 'ambiguous'
);

-- 性别
CREATE TYPE gender_type AS ENUM ('male', 'female', 'unknown');

-- 地点类型
CREATE TYPE location_type AS ENUM (
  'residence', 'garden', 'mansion', 'courtyard',
  'temple', 'hall', 'study', 'natural', 'other'
);

-- 问题类型
CREATE TYPE question_type AS ENUM (
  'character', 'relationship', 'event', 'plot',
  'theme', 'symbol', 'version', 'other'
);

-- 观点立场类型
CREATE TYPE stance_type AS ENUM (
  'supporting', 'opposing', 'alternative', 'synthetic', 'neutral'
);

-- 观点分类（保留 v1 字段）
CREATE TYPE viewpoint_type AS ENUM ('academic', 'popular', 'disputed');

-- 证据—问题关系类型
CREATE TYPE evidence_relation_type AS ENUM (
  'support', 'weaken', 'contextual', 'neutral'
);

-- 来源类型
CREATE TYPE source_type AS ENUM (
  'original_text', 'academic_book', 'academic_paper',
  'annotated_edition', 'redology_monograph', 'interview',
  'reputable_article', 'adaptation', 'community_post',
  'zhi_ping'
);

-- 来源可信度等级
CREATE TYPE credibility_level AS ENUM ('A', 'B', 'C', 'D');

-- 文学作品类型
CREATE TYPE work_type AS ENUM (
  'poem', 'ci', 'qu', 'song', 'fu', 'couplet',
  'riddle', 'letter', 'inscription', 'verdict', 'other'
);

-- 研究专题类型
CREATE TYPE research_topic_type AS ENUM (
  'biography', 'personality', 'relationship', 'poetry',
  'symbolism', 'family_system', 'gender', 'social_structure',
  'economics', 'fate', 'verdict', 'version_study',
  'redology_history', 'scholarly_debate', 'adaptation_comparison'
);

-- ============================================================
-- 辅助 / 查找表
-- ============================================================

-- edition｜版本
CREATE TABLE edition (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  short_code  TEXT UNIQUE,
  year        INTEGER,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  status      review_status NOT NULL DEFAULT 'draft',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 核心内容表
-- ============================================================

-- 1. chapter｜章节
CREATE TABLE chapter (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_number  INTEGER NOT NULL UNIQUE CHECK (chapter_number >= 1 AND chapter_number <= 120),
  title           TEXT NOT NULL,
  summary         TEXT,
  attribution     chapter_attribution NOT NULL,
  edition_id      UUID REFERENCES edition(id) ON DELETE SET NULL,
  major_characters JSONB NOT NULL DEFAULT '[]',
  major_events    JSONB NOT NULL DEFAULT '[]',
  questions       JSONB NOT NULL DEFAULT '[]',
  evidence        JSONB NOT NULL DEFAULT '[]',
  status          review_status NOT NULL DEFAULT 'draft',
  confidence      INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  embedding_status embedding_status_type NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. location｜地点
CREATE TABLE location (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  location_type     location_type NOT NULL DEFAULT 'other',
  short_intro       TEXT,
  parent_location_id UUID REFERENCES location(id) ON DELETE SET NULL,
  map_x             DOUBLE PRECISION,
  map_y             DOUBLE PRECISION,
  asset_key         TEXT,
  fact_type         fact_type NOT NULL DEFAULT 'canonical_text_fact',
  status            review_status NOT NULL DEFAULT 'draft',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. character｜人物（v1 基础 + v2 增强）
CREATE TABLE character (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                       TEXT NOT NULL UNIQUE,
  name                       TEXT NOT NULL,
  gender                     gender_type NOT NULL DEFAULT 'unknown',
  short_intro                TEXT,
  identity_summary           TEXT,
  family_group               TEXT,
  first_appearance_chapter_id UUID REFERENCES chapter(id) ON DELETE SET NULL,
  importance_level           importance_level NOT NULL DEFAULT 'secondary',
  content_level              content_level NOT NULL DEFAULT 'L1',
  asset_key                  TEXT,
  sort_weight                INTEGER NOT NULL DEFAULT 0,
  birth_origin_summary       TEXT,
  fate_summary               TEXT,
  residence_location_id      UUID REFERENCES location(id) ON DELETE SET NULL,
  fact_type                  fact_type NOT NULL DEFAULT 'canonical_text_fact',

  -- v1 保留字段
  category                   TEXT,
  identity                   JSONB NOT NULL DEFAULT '{}',
  tags                       JSONB NOT NULL DEFAULT '[]',
  keywords                   JSONB NOT NULL DEFAULT '[]',
  personality_analysis       JSONB NOT NULL DEFAULT '[]',
  notes_internal             TEXT,

  status                     review_status NOT NULL DEFAULT 'draft',
  confidence                 INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  verified_by                TEXT,
  embedding_status           embedding_status_type NOT NULL DEFAULT 'pending',
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. character_alias｜人物别名 / 称谓
CREATE TABLE character_alias (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  alias        TEXT NOT NULL,
  alias_type   alias_type NOT NULL DEFAULT 'other',
  context      TEXT,
  source_id    UUID,
  fact_type    fact_type NOT NULL DEFAULT 'canonical_text_fact',
  status       review_status NOT NULL DEFAULT 'draft',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. relationship｜人物关系（v1 基础 + v2 增强）
CREATE TABLE relationship (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_character_id    UUID NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  to_character_id      UUID NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  relationship_type    TEXT NOT NULL,
  nature               relationship_nature[] NOT NULL DEFAULT '{}',
  directional          BOOLEAN NOT NULL DEFAULT false,
  relationship_summary TEXT,
  start_chapter_id     UUID REFERENCES chapter(id) ON DELETE SET NULL,
  end_chapter_id       UUID REFERENCES chapter(id) ON DELETE SET NULL,
  strength_weight      INTEGER NOT NULL DEFAULT 0,
  fact_type            fact_type NOT NULL DEFAULT 'canonical_text_fact',
  evidence_ids         JSONB NOT NULL DEFAULT '[]',
  source_ids           JSONB NOT NULL DEFAULT '[]',

  -- v1 保留字段
  stages               JSONB NOT NULL DEFAULT '[]',
  impact               TEXT,
  status               review_status NOT NULL DEFAULT 'draft',
  confidence           INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  verified_by          TEXT,
  embedding_status     embedding_status_type NOT NULL DEFAULT 'pending',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT rel_no_self CHECK (from_character_id <> to_character_id)
);

-- 6. event｜事件（v1 基础 + v2 增强）
CREATE TABLE event (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  summary          TEXT,
  event_type       event_type NOT NULL DEFAULT 'other',
  event_level      event_level_type NOT NULL DEFAULT 'minor',
  start_chapter_id UUID REFERENCES chapter(id) ON DELETE SET NULL,
  end_chapter_id   UUID REFERENCES chapter(id) ON DELETE SET NULL,
  location_id      UUID REFERENCES location(id) ON DELETE SET NULL,
  importance_weight INTEGER NOT NULL DEFAULT 0,
  fact_type        fact_type NOT NULL DEFAULT 'canonical_text_fact',

  -- v1 保留字段
  evidence         JSONB NOT NULL DEFAULT '[]',
  interpretations  JSONB NOT NULL DEFAULT '[]',
  related_events   JSONB NOT NULL DEFAULT '[]',
  source_ids       JSONB NOT NULL DEFAULT '[]',
  "order"          INTEGER NOT NULL DEFAULT 0,
  status           review_status NOT NULL DEFAULT 'draft',
  confidence       INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  verified_by      TEXT,
  embedding_status embedding_status_type NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. source_citation｜来源 / 引用（v1 source 重命名 + 增强）
CREATE TABLE source_citation (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type      source_type NOT NULL,
  title            TEXT NOT NULL,
  author           TEXT,
  publisher        TEXT,
  year             INTEGER,
  edition          TEXT,
  url              TEXT,
  notes            TEXT,
  credibility_level credibility_level NOT NULL DEFAULT 'C',
  -- v1 兼容字段
  chapter_id       UUID REFERENCES chapter(id) ON DELETE SET NULL,
  description      TEXT,
  controversial    BOOLEAN NOT NULL DEFAULT false,
  verification     TEXT,
  status           review_status NOT NULL DEFAULT 'draft',
  confidence       INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- character_alias.source_id → source_citation（表已存在，补外键）
ALTER TABLE character_alias
  ADD CONSTRAINT fk_alias_source
  FOREIGN KEY (source_id) REFERENCES source_citation(id) ON DELETE SET NULL;

-- 8. text_excerpt｜原文短证据
CREATE TABLE text_excerpt (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id      UUID NOT NULL REFERENCES chapter(id) ON DELETE RESTRICT,
  edition_id      UUID REFERENCES edition(id) ON DELETE SET NULL,
  quote_short     TEXT NOT NULL,
  context_summary TEXT,
  evidence_type   TEXT,
  fact_type       fact_type NOT NULL DEFAULT 'canonical_text_fact',
  source_id       UUID REFERENCES source_citation(id) ON DELETE SET NULL,
  copyright_note  TEXT,
  status          review_status NOT NULL DEFAULT 'draft',
  embedding_status embedding_status_type NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. question｜问题
CREATE TABLE question (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  short_summary     TEXT,
  neutral_overview  TEXT,
  question_type     question_type NOT NULL DEFAULT 'other',
  importance_weight INTEGER NOT NULL DEFAULT 0,
  heat_weight       INTEGER NOT NULL DEFAULT 0,
  fact_type         fact_type NOT NULL DEFAULT 'canonical_text_fact',
  -- 关联快照（JSONB 冗余，加速查询）
  character_ids     JSONB NOT NULL DEFAULT '[]',
  event_ids         JSONB NOT NULL DEFAULT '[]',
  chapter_ids       JSONB NOT NULL DEFAULT '[]',
  location_ids      JSONB NOT NULL DEFAULT '[]',
  status            review_status NOT NULL DEFAULT 'draft',
  embedding_status  embedding_status_type NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. viewpoint｜观点 / 主张（v1 基础 + v2 增强）
CREATE TABLE viewpoint (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id      UUID NOT NULL REFERENCES question(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  summary          TEXT,
  argument_body    TEXT,
  stance_type      stance_type NOT NULL DEFAULT 'neutral',
  fact_type        fact_type NOT NULL DEFAULT 'scholarly_viewpoint',
  confidence       INTEGER CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 100,
  source_ids       JSONB NOT NULL DEFAULT '[]',

  -- v1 保留字段
  type             viewpoint_type NOT NULL DEFAULT 'academic',
  author           TEXT,
  year             INTEGER,
  source_title     TEXT,
  description      TEXT,
  related_event_ids JSONB NOT NULL DEFAULT '[]',
  opinions         JSONB NOT NULL DEFAULT '[]',

  status           review_status NOT NULL DEFAULT 'draft',
  verified_by      TEXT,
  embedding_status embedding_status_type NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. poem_literary_work｜诗词曲文
CREATE TABLE poem_literary_work (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  work_type           work_type NOT NULL DEFAULT 'poem',
  author_character_id UUID REFERENCES character(id) ON DELETE SET NULL,
  chapter_id          UUID REFERENCES chapter(id) ON DELETE SET NULL,
  summary             TEXT,
  quote_short         TEXT,
  symbolic_notes      TEXT,
  source_id           UUID REFERENCES source_citation(id) ON DELETE SET NULL,
  fact_type           fact_type NOT NULL DEFAULT 'canonical_text_fact',
  status              review_status NOT NULL DEFAULT 'draft',
  embedding_status    embedding_status_type NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. discussion｜讨论 / 帖子
CREATE TABLE discussion (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_user_id UUID,
  target_type    TEXT NOT NULL,
  target_id      UUID NOT NULL,
  title          TEXT,
  body           TEXT NOT NULL,
  parent_post_id UUID REFERENCES discussion(id) ON DELETE CASCADE,
  status         review_status NOT NULL DEFAULT 'draft',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. research_topic｜深度研究专题（L3 内容）
CREATE TABLE research_topic (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES character(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  summary      TEXT,
  body         TEXT,
  topic_type   research_topic_type NOT NULL DEFAULT 'biography',
  fact_type    fact_type NOT NULL DEFAULT 'scholarly_viewpoint',
  source_ids   JSONB NOT NULL DEFAULT '[]',
  status       review_status NOT NULL DEFAULT 'draft',
  sort_weight  INTEGER NOT NULL DEFAULT 0,
  embedding_status embedding_status_type NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 连接 / 关联表
-- ============================================================

-- 14. character_event｜人物—事件关联
CREATE TABLE character_event (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  event_id     UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'participant',
  note         TEXT,
  "order"      INTEGER NOT NULL DEFAULT 0,
  fact_type    fact_type NOT NULL DEFAULT 'canonical_text_fact',
  UNIQUE (character_id, event_id)
);

-- 15. event_participant｜事件参与人物（双向关联）
CREATE TABLE event_participant (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT '参与者',
  description  TEXT,
  fact_type    fact_type NOT NULL DEFAULT 'canonical_text_fact',
  UNIQUE (event_id, character_id)
);

-- 16. event_evidence｜事件↔证据
CREATE TABLE event_evidence (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id  UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES source_citation(id) ON DELETE CASCADE,
  quote     TEXT NOT NULL,
  note      TEXT,
  fact_type fact_type NOT NULL DEFAULT 'canonical_text_fact',
  UNIQUE (event_id, source_id)
);

-- 17. event_interpretation｜事件解读
CREATE TABLE event_interpretation (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id   UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'literary',
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  source_ref TEXT
);

-- 18. relationship_stage｜关系阶段时间线
CREATE TABLE relationship_stage (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationship(id) ON DELETE CASCADE,
  stage_order     INTEGER NOT NULL,
  title           TEXT NOT NULL,
  chapter_id      UUID REFERENCES chapter(id) ON DELETE SET NULL,
  description     TEXT NOT NULL
);

-- 19. question_evidence_link｜问题—证据—观点三元关联
CREATE TABLE question_evidence_link (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   UUID NOT NULL REFERENCES question(id) ON DELETE CASCADE,
  viewpoint_id  UUID REFERENCES viewpoint(id) ON DELETE CASCADE,
  evidence_id   UUID NOT NULL REFERENCES text_excerpt(id) ON DELETE CASCADE,
  relation_type evidence_relation_type NOT NULL DEFAULT 'neutral',
  weight        INTEGER NOT NULL DEFAULT 0,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. character_chapter｜人物—章节出现关联
CREATE TABLE character_chapter (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  chapter_id   UUID NOT NULL REFERENCES chapter(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'appears',
  note         TEXT,
  fact_type    fact_type NOT NULL DEFAULT 'canonical_text_fact',
  UNIQUE (character_id, chapter_id)
);

-- ============================================================
-- 索引
-- ============================================================

-- edition
CREATE INDEX idx_edition_short_code ON edition (short_code);
CREATE INDEX idx_edition_sort_order ON edition (sort_order);

-- chapter
CREATE INDEX idx_chapter_number ON chapter (chapter_number);
CREATE INDEX idx_chapter_attribution ON chapter (attribution);
CREATE INDEX idx_chapter_edition ON chapter (edition_id);
CREATE INDEX idx_chapter_status ON chapter (status);
CREATE INDEX idx_chapter_major_chars ON chapter USING gin (major_characters);

-- location
CREATE INDEX idx_location_slug ON location (slug);
CREATE INDEX idx_location_type ON location (location_type);
CREATE INDEX idx_location_parent ON location (parent_location_id);
CREATE INDEX idx_location_fact_type ON location (fact_type);

-- character
CREATE INDEX idx_character_slug ON character (slug);
CREATE INDEX idx_character_name ON character USING gin (name gin_trgm_ops);
CREATE INDEX idx_character_gender ON character (gender);
CREATE INDEX idx_character_family_group ON character (family_group);
CREATE INDEX idx_character_importance ON character (importance_level);
CREATE INDEX idx_character_content_level ON character (content_level);
CREATE INDEX idx_character_first_appearance ON character (first_appearance_chapter_id);
CREATE INDEX idx_character_residence ON character (residence_location_id);
CREATE INDEX idx_character_fact_type ON character (fact_type);
CREATE INDEX idx_character_status ON character (status);
CREATE INDEX idx_character_sort ON character (sort_weight DESC);
CREATE INDEX idx_character_embedding ON character (embedding_status);
CREATE INDEX idx_character_tags ON character USING gin (tags);
CREATE INDEX idx_character_keywords ON character USING gin (keywords);

-- character_alias
CREATE INDEX idx_alias_character ON character_alias (character_id);
CREATE INDEX idx_alias_type ON character_alias (alias_type);
CREATE INDEX idx_alias_text ON character_alias USING gin (alias gin_trgm_ops);

-- relationship
CREATE INDEX idx_rel_from ON relationship (from_character_id);
CREATE INDEX idx_rel_to ON relationship (to_character_id);
CREATE INDEX idx_rel_type ON relationship (relationship_type);
CREATE INDEX idx_rel_nature ON relationship USING gin (nature);
CREATE INDEX idx_rel_start_chapter ON relationship (start_chapter_id);
CREATE INDEX idx_rel_end_chapter ON relationship (end_chapter_id);
CREATE INDEX idx_rel_strength ON relationship (strength_weight DESC);
CREATE INDEX idx_rel_fact_type ON relationship (fact_type);
CREATE INDEX idx_rel_status ON relationship (status);
CREATE INDEX idx_rel_evidence_ids ON relationship USING gin (evidence_ids);

-- event
CREATE INDEX idx_event_slug ON event (slug);
CREATE INDEX idx_event_type ON event (event_type);
CREATE INDEX idx_event_level ON event (event_level);
CREATE INDEX idx_event_start_chapter ON event (start_chapter_id);
CREATE INDEX idx_event_end_chapter ON event (end_chapter_id);
CREATE INDEX idx_event_location ON event (location_id);
CREATE INDEX idx_event_importance ON event (importance_weight DESC);
CREATE INDEX idx_event_fact_type ON event (fact_type);
CREATE INDEX idx_event_status ON event (status);
CREATE INDEX idx_event_order ON event ("order");
CREATE INDEX idx_event_embedding ON event (embedding_status);

-- source_citation
CREATE INDEX idx_source_type ON source_citation (source_type);
CREATE INDEX idx_source_author ON source_citation (author);
CREATE INDEX idx_source_year ON source_citation (year);
CREATE INDEX idx_source_credibility ON source_citation (credibility_level);
CREATE INDEX idx_source_chapter ON source_citation (chapter_id);
CREATE INDEX idx_source_controversial ON source_citation (controversial);
CREATE INDEX idx_source_status ON source_citation (status);

-- text_excerpt
CREATE INDEX idx_excerpt_chapter ON text_excerpt (chapter_id);
CREATE INDEX idx_excerpt_edition ON text_excerpt (edition_id);
CREATE INDEX idx_excerpt_source ON text_excerpt (source_id);
CREATE INDEX idx_excerpt_fact_type ON text_excerpt (fact_type);
CREATE INDEX idx_excerpt_status ON text_excerpt (status);
CREATE INDEX idx_excerpt_embedding ON text_excerpt (embedding_status);

-- question
CREATE INDEX idx_question_slug ON question (slug);
CREATE INDEX idx_question_type ON question (question_type);
CREATE INDEX idx_question_importance ON question (importance_weight DESC);
CREATE INDEX idx_question_heat ON question (heat_weight DESC);
CREATE INDEX idx_question_fact_type ON question (fact_type);
CREATE INDEX idx_question_status ON question (status);
CREATE INDEX idx_question_embedding ON question (embedding_status);
CREATE INDEX idx_question_char_ids ON question USING gin (character_ids);
CREATE INDEX idx_question_event_ids ON question USING gin (event_ids);

-- viewpoint
CREATE INDEX idx_viewpoint_question ON viewpoint (question_id);
CREATE INDEX idx_viewpoint_type ON viewpoint (type);
CREATE INDEX idx_viewpoint_stance ON viewpoint (stance_type);
CREATE INDEX idx_viewpoint_fact_type ON viewpoint (fact_type);
CREATE INDEX idx_viewpoint_author ON viewpoint (author);
CREATE INDEX idx_viewpoint_status ON viewpoint (status);
CREATE INDEX idx_viewpoint_embedding ON viewpoint (embedding_status);

-- poem_literary_work
CREATE INDEX idx_poem_author ON poem_literary_work (author_character_id);
CREATE INDEX idx_poem_chapter ON poem_literary_work (chapter_id);
CREATE INDEX idx_poem_source ON poem_literary_work (source_id);
CREATE INDEX idx_poem_work_type ON poem_literary_work (work_type);
CREATE INDEX idx_poem_fact_type ON poem_literary_work (fact_type);
CREATE INDEX idx_poem_status ON poem_literary_work (status);

-- discussion
CREATE INDEX idx_discussion_author ON discussion (author_user_id);
CREATE INDEX idx_discussion_target ON discussion (target_type, target_id);
CREATE INDEX idx_discussion_parent ON discussion (parent_post_id);
CREATE INDEX idx_discussion_status ON discussion (status);
CREATE INDEX idx_discussion_created ON discussion (created_at DESC);

-- research_topic
CREATE INDEX idx_rt_character ON research_topic (character_id);
CREATE INDEX idx_rt_topic_type ON research_topic (topic_type);
CREATE INDEX idx_rt_fact_type ON research_topic (fact_type);
CREATE INDEX idx_rt_sort ON research_topic (sort_weight DESC);
CREATE INDEX idx_rt_status ON research_topic (status);
CREATE INDEX idx_rt_embedding ON research_topic (embedding_status);

-- 连接表索引
CREATE INDEX idx_char_event_char ON character_event (character_id);
CREATE INDEX idx_char_event_event ON character_event (event_id);
CREATE INDEX idx_char_event_order ON character_event ("order");
CREATE INDEX idx_event_participant_event ON event_participant (event_id);
CREATE INDEX idx_event_participant_char ON event_participant (character_id);
CREATE INDEX idx_event_evidence_event ON event_evidence (event_id);
CREATE INDEX idx_event_evidence_source ON event_evidence (source_id);
CREATE INDEX idx_event_interp_event ON event_interpretation (event_id);
CREATE INDEX idx_rel_stage_rel ON relationship_stage (relationship_id);
CREATE INDEX idx_rel_stage_chapter ON relationship_stage (chapter_id);
CREATE INDEX idx_rel_stage_order ON relationship_stage (stage_order);
CREATE INDEX idx_qel_question ON question_evidence_link (question_id);
CREATE INDEX idx_qel_viewpoint ON question_evidence_link (viewpoint_id);
CREATE INDEX idx_qel_evidence ON question_evidence_link (evidence_id);
CREATE INDEX idx_qel_relation_type ON question_evidence_link (relation_type);
CREATE INDEX idx_char_chapter_char ON character_chapter (character_id);
CREATE INDEX idx_char_chapter_chapter ON character_chapter (chapter_id);

-- ============================================================
-- 全文搜索索引
-- ============================================================

CREATE INDEX idx_event_summary_fts ON event
  USING gin (to_tsvector('simple', coalesce(summary, '')));
CREATE INDEX idx_question_fts ON question
  USING gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(neutral_overview, '')));
CREATE INDEX idx_viewpoint_body_fts ON viewpoint
  USING gin (to_tsvector('simple', coalesce(argument_body, '') || ' ' || coalesce(description, '')));
CREATE INDEX idx_excerpt_quote_fts ON text_excerpt
  USING gin (to_tsvector('simple', coalesce(quote_short, '')));
CREATE INDEX idx_research_topic_fts ON research_topic
  USING gin (to_tsvector('simple', coalesce(body, '') || ' ' || coalesce(summary, '')));
CREATE INDEX idx_poem_quote_fts ON poem_literary_work
  USING gin (to_tsvector('simple', coalesce(quote_short, '')));

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

-- edition
CREATE TRIGGER trg_edition_updated_at
  BEFORE UPDATE ON edition FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- chapter
CREATE TRIGGER trg_chapter_updated_at
  BEFORE UPDATE ON chapter FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- location
CREATE TRIGGER trg_location_updated_at
  BEFORE UPDATE ON location FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- character
CREATE TRIGGER trg_character_updated_at
  BEFORE UPDATE ON character FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- character_alias
CREATE TRIGGER trg_alias_updated_at
  BEFORE UPDATE ON character_alias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- relationship
CREATE TRIGGER trg_relationship_updated_at
  BEFORE UPDATE ON relationship FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- event
CREATE TRIGGER trg_event_updated_at
  BEFORE UPDATE ON event FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- source_citation
CREATE TRIGGER trg_source_updated_at
  BEFORE UPDATE ON source_citation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- text_excerpt
CREATE TRIGGER trg_excerpt_updated_at
  BEFORE UPDATE ON text_excerpt FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- question
CREATE TRIGGER trg_question_updated_at
  BEFORE UPDATE ON question FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- viewpoint
CREATE TRIGGER trg_viewpoint_updated_at
  BEFORE UPDATE ON viewpoint FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- poem_literary_work
CREATE TRIGGER trg_poem_updated_at
  BEFORE UPDATE ON poem_literary_work FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- discussion
CREATE TRIGGER trg_discussion_updated_at
  BEFORE UPDATE ON discussion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- research_topic
CREATE TRIGGER trg_research_topic_updated_at
  BEFORE UPDATE ON research_topic FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 聚合视图（可选：覆盖率统计）
-- ============================================================

CREATE OR REPLACE VIEW character_coverage AS
SELECT
  c.id,
  c.slug,
  c.name,
  c.importance_level,
  c.content_level,
  c.status,
  (SELECT count(*) FROM relationship r WHERE r.from_character_id = c.id OR r.to_character_id = c.id) AS relationship_count,
  (SELECT count(*) FROM character_event ce WHERE ce.character_id = c.id) AS event_count,
  (SELECT count(*) FROM character_chapter cc WHERE cc.character_id = c.id) AS chapter_count,
  (SELECT count(DISTINCT qel.question_id)
     FROM question_evidence_link qel
     JOIN question q ON q.id = qel.question_id
    WHERE q.character_ids @> to_jsonb(c.id::text)) AS evidence_count,
  (SELECT count(*) FROM question q WHERE q.character_ids @> to_jsonb(c.id::text)) AS question_count,
  (SELECT count(*) FROM viewpoint v
     JOIN question q ON q.id = v.question_id
    WHERE q.character_ids @> to_jsonb(c.id::text)) AS viewpoint_count,
  (SELECT count(*) FROM research_topic rt WHERE rt.character_id = c.id) AS research_topic_count,
  c.updated_at
FROM character c
ORDER BY c.sort_weight DESC;

COMMIT;
