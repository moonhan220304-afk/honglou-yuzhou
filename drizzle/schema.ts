import {
  pgTable,
  text,
  integer,
  jsonb,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const chapter = pgTable("chapter", {
  number: integer("number").primaryKey(),
  title: text("title").notNull(),
  attribution: text("attribution", { enum: ["caoxueqin", "gaoe"] }).notNull(),
  summary: text("summary"),
  status: text("status", { enum: ["draft", "pending", "verified"] })
    .notNull()
    .default("draft"),
  confidence: integer("confidence").default(100),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const character = pgTable(
  "character",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    aliases: jsonb("aliases").notNull().default([]),
    category: text("category").notNull(),
    identity: jsonb("identity").notNull().default({}),
    tags: jsonb("tags").notNull().default([]),
    summary: jsonb("summary").notNull().default({}),
    personalityAnalysis: jsonb("personality_analysis").notNull().default([]),
    timeline: jsonb("timeline").notNull().default([]),
    sources: jsonb("sources").notNull().default([]),
    status: text("status", { enum: ["draft", "pending", "verified"] })
      .notNull()
      .default("draft"),
    confidence: integer("confidence").default(100),
    verifiedBy: text("verified_by"),
    embeddingStatus: text("embedding_status", {
      enum: ["pending", "indexed", "failed"],
    })
      .notNull()
      .default("pending"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_character_name").on(t.name)],
);

export const source = pgTable("source", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["original_text", "zhi_ping", "hongxue_paper"] }).notNull(),
  title: text("title").notNull(),
  chapterNumber: integer("chapter_number").references(() => chapter.number, {
    onDelete: "set null",
  }),
  description: text("description").notNull(),
  author: text("author"),
  year: integer("year"),
  authority: text("authority"),
  controversial: boolean("controversial").notNull().default(false),
  verification: text("verification"),
  status: text("status", { enum: ["draft", "pending", "verified"] })
    .notNull()
    .default("draft"),
  confidence: integer("confidence").default(100),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const event = pgTable(
  "event",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    eventLevel: text("event_level", { enum: ["major", "minor", "micro"] }).notNull(),
    chapterNumber: integer("chapter_number")
      .notNull()
      .references(() => chapter.number, { onDelete: "restrict" }),
    location: jsonb("location").notNull().default({}),
    summary: jsonb("summary").notNull().default({}),
    evidence: jsonb("evidence").notNull().default([]),
    interpretations: jsonb("interpretations").notNull().default([]),
    relatedEvents: jsonb("related_events").notNull().default([]),
    order: integer("order").notNull().default(0),
    status: text("status", { enum: ["draft", "pending", "verified"] })
      .notNull()
      .default("draft"),
    confidence: integer("confidence").default(100),
    verifiedBy: text("verified_by"),
    embeddingStatus: text("embedding_status", {
      enum: ["pending", "indexed", "failed"],
    })
      .notNull()
      .default("pending"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_event_chapter").on(t.chapterNumber),
    index("idx_event_level").on(t.eventLevel),
  ],
);

export const relationship = pgTable(
  "relationship",
  {
    id: text("id").primaryKey(),
    from: text("from")
      .notNull()
      .references(() => character.id, { onDelete: "cascade" }),
    to: text("to")
      .notNull()
      .references(() => character.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    nature: jsonb("nature").notNull().default([]),
    direction: text("direction", { enum: ["mutual", "one-way"] })
      .notNull()
      .default("mutual"),
    summary: text("summary").notNull(),
    stages: jsonb("stages").notNull().default([]),
    evidenceEvents: jsonb("evidence_events").notNull().default([]),
    impact: text("impact"),
    status: text("status", { enum: ["draft", "pending", "verified"] })
      .notNull()
      .default("draft"),
    confidence: integer("confidence").default(100),
    verifiedBy: text("verified_by"),
    embeddingStatus: text("embedding_status", {
      enum: ["pending", "indexed", "failed"],
    })
      .notNull()
      .default("pending"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_relationship_from").on(t.from),
    index("idx_relationship_to").on(t.to),
  ],
);

export const viewpoint = pgTable("viewpoint", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type", { enum: ["academic", "popular", "disputed"] }).notNull(),
  author: text("author").notNull(),
  year: integer("year"),
  sourceTitle: text("source_title"),
  description: text("description").notNull(),
  relatedEventIds: jsonb("related_event_ids").notNull().default([]),
  opinions: jsonb("opinions").notNull().default([]),
  status: text("status", { enum: ["draft", "pending", "verified"] })
    .notNull()
    .default("draft"),
  confidence: integer("confidence").default(100),
  verifiedBy: text("verified_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const characterEvent = pgTable(
  "character_event",
  {
    id: text("id").primaryKey(),
    characterId: text("character_id")
      .notNull()
      .references(() => character.id, { onDelete: "cascade" }),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("participant"),
    note: text("note"),
    order: integer("order").notNull().default(0),
  },
  (t) => [
    uniqueIndex("uq_character_event").on(t.characterId, t.eventId),
    index("idx_character_event_char").on(t.characterId),
  ],
);

export const eventParticipant = pgTable(
  "event_participant",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    characterId: text("character_id")
      .notNull()
      .references(() => character.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("参与者"),
    description: text("description"),
  },
  (t) => [
    uniqueIndex("uq_event_participant").on(t.eventId, t.characterId),
    index("idx_event_participant_event").on(t.eventId),
  ],
);

export const eventEvidence = pgTable(
  "event_evidence",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    sourceId: text("source_id")
      .notNull()
      .references(() => source.id, { onDelete: "cascade" }),
    quote: text("quote").notNull(),
    note: text("note"),
  },
  (t) => [uniqueIndex("uq_event_evidence").on(t.eventId, t.sourceId)],
);

export const relationshipStage = pgTable("relationship_stage", {
  id: text("id").primaryKey(),
  relationshipId: text("relationship_id")
    .notNull()
    .references(() => relationship.id, { onDelete: "cascade" }),
  stageOrder: integer("stage_order").notNull(),
  title: text("title").notNull(),
  chapterNumber: integer("chapter_number").references(() => chapter.number, {
    onDelete: "set null",
  }),
  description: text("description").notNull(),
});

export const eventInterpretation = pgTable("event_interpretation", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("literary"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceRef: text("source_ref"),
});
