export type EntityStatus = "draft" | "pending" | "verified";
export type EventLevel = "major" | "minor" | "micro";
export type SourceType = "original_text" | "zhi_ping" | "hongxue_paper";
export type ChapterAttribution = "caoxueqin" | "gaoe";
export type RelationshipDirection = "mutual" | "one-way";
export type EmbeddingStatus = "pending" | "indexed" | "failed";

export interface ReviewStatus {
  review: EntityStatus;
  confidence: number;
  verified_by?: string;
  updated_at: string;
  embedding_status?: EmbeddingStatus;
}

export interface Chapter {
  number: number;
  title: string;
  attribution: ChapterAttribution;
}

export interface SourceRef {
  source_id: string;
  quote: string;
  note: string;
}

export interface Character {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  identity: {
    family: string;
    position: string;
    origin: string;
    generation?: string;
  };
  tags: string[];
  summary: {
    short: string;
    long: string;
  };
  personality_analysis: {
    dimension: string;
    description: string;
    evidence_events: string[];
  }[];
  timeline: {
    order: number;
    event_id: string;
    title: string;
  }[];
  related_characters: {
    character_id: string;
    relationship_type: string;
  }[];
  sources: SourceRef[];
  status: ReviewStatus;
}

export interface Event {
  id: string;
  title: string;
  event_level: EventLevel;
  chapter: Chapter;
  location: {
    name: string;
    specific: string;
  };
  summary: {
    short: string;
    meaning: string[];
  };
  participants: {
    character_id: string;
    role: string;
  }[];
  evidence: SourceRef[];
  interpretations: {
    type: string;
    title: string;
    content: string;
  }[];
  related_events: string[];
  status: ReviewStatus;
}

export interface RelationshipStage {
  stage: number;
  title: string;
  chapter: number;
  description: string;
  note?: string;
}

export interface Relationship {
  id: string;
  from: string;
  to: string;
  type: string;
  nature: string[];
  direction: RelationshipDirection;
  summary: string;
  stages: RelationshipStage[];
  evidence_events: {
    event_id: string;
    description: string;
  }[];
  impact: string;
  status: ReviewStatus;
}

export interface Source {
  id: string;
  type: SourceType;
  title: string;
  chapter_number: number | null;
  description: string;
  author: string | null;
  year: number | null;
  authority: string;
  controversial: boolean;
  verification: string;
  status: ReviewStatus;
}

export interface Viewpoint {
  id: string;
  title: string;
  type: "academic" | "popular" | "disputed";
  author: string;
  year: number | null;
  source_title: string;
  description: string;
  related_event_ids: string[];
  opinions: {
    side: string;
    content: string;
    proponent: string;
  }[];
  status: ReviewStatus;
}

export interface Poem {
  id: string;
  title: string;
  author_id: string;
  chapter: number;
  text: string;
  interpretation: string;
  scene: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  votes: number;
  comments: number;
  tag: string;
}

export interface PersonalityDimension {
  name: string;
  score: number;
}

/** 性格维度分析：以气质框架组织（能量倾向 / 认知方式 / 决策方式 / 生活方式），
 *  内容一律来自原著（行为、对话、判词、他人评价），不套用外部人格标签。 */
export interface ArchetypeDimension {
  name: string;
  trait: string;
  detail: string;
}

export interface Archetype {
  id: string;
  character_id: string;
  title: string;
  /** 原著性格总述 */
  summary: string;
  /** 四个维度的原著分析 */
  dimensions: ArchetypeDimension[];
  traits: string[];
  strengths: string[];
  challenges: string[];
  reading: string[];
}

export interface TestOption {
  text: string;
  weights: Record<string, number>;
}

export interface TestQuestion {
  id: number;
  text: string;
  options: TestOption[];
}

export interface QuestionViewpoint {
  id: string;
  title: string;
  summary: string;
  argument_body: string;
  stance_type: string;
  fact_type: string;
  confidence: number;
  source_ids: string[];
  support_rate?: number;
}

export interface QuestionEvidence {
  id: string;
  evidence_type: string;
  relation_type: string;
  quote_short: string;
  quote_full?: string;
  source_id?: string;
  note?: string;
}

export interface Question {
  id: string;
  slug: string;
  title: string;
  short_summary: string;
  neutral_overview: string;
  question_type: string;
  importance_weight: number;
  heat_weight: number;
  related_character_ids: string[];
  related_event_ids: string[];
  related_chapter_ids: number[];
  related_location_ids: string[];
  viewpoints: QuestionViewpoint[];
  evidence: QuestionEvidence[];
  status: ReviewStatus;
}

export interface Location {
  id: string;
  slug: string;
  name: string;
  location_type: string;
  short_intro: string;
  parent_location_id: string | null;
  map_x: number | null;
  map_y: number | null;
  resident_character_ids: string[];
  key_events: string[];
  symbolic_meaning?: string;
  asset_key?: string;
  status: ReviewStatus;
}

export interface KbPoem {
  id: string;
  title: string;
  work_type: string;
  author_character_id: string;
  chapter_id: number | null;
  summary: string;
  quote_short: string;
  symbolic_notes?: string;
  source_id?: string;
  status: ReviewStatus;
}
