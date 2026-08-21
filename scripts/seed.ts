 
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../drizzle/schema";
import { characters } from "../lib/mock/characters";
import { events } from "../lib/mock/events";
import { relationships } from "../lib/mock/relationships";
import { sources, chapters } from "../lib/mock/sources";

async function main() {
  const url = process.env.DATABASE_URL ?? "postgres://localhost:5432/redmansion_kb";
  const client = new Client({ connectionString: url });
  await client.connect();
  const db = drizzle(client, { schema });
  console.log("connected:", url);

  for (const ch of Object.values(chapters)) {
    await db
      .insert(schema.chapter)
      .values({
        number: ch.number,
        title: ch.title,
        attribution: ch.attribution,
        status: "verified",
        confidence: 100,
      })
      .onConflictDoNothing();
  }
  console.log("chapters:", Object.keys(chapters).length);

  for (const s of Object.values(sources)) {
    await db
      .insert(schema.source)
      .values({
        id: s.id,
        type: s.type,
        title: s.title,
        chapterNumber: s.chapter_number,
        description: s.description,
        author: s.author,
        year: s.year,
        authority: s.authority,
        controversial: s.controversial,
        verification: s.verification,
        status: s.status.review,
        confidence: s.status.confidence,
      })
      .onConflictDoNothing();
  }
  console.log("sources:", Object.keys(sources).length);

  for (const c of Object.values(characters)) {
    await db
      .insert(schema.character)
      .values({
        id: c.id,
        name: c.name,
        aliases: c.aliases,
        category: c.category,
        identity: c.identity,
        tags: c.tags,
        summary: c.summary,
        personalityAnalysis: c.personality_analysis,
        timeline: c.timeline,
        sources: c.sources,
        status: c.status.review,
        confidence: c.status.confidence,
        verifiedBy: c.status.verified_by,
      })
      .onConflictDoNothing();
  }
  console.log("characters:", Object.keys(characters).length);

  for (const e of Object.values(events)) {
    await db
      .insert(schema.event)
      .values({
        id: e.id,
        title: e.title,
        eventLevel: e.event_level,
        chapterNumber: e.chapter.number,
        location: e.location,
        summary: e.summary,
        evidence: e.evidence,
        interpretations: e.interpretations,
        relatedEvents: e.related_events,
        order: e.chapter.number,
        status: e.status.review,
        confidence: e.status.confidence,
        verifiedBy: e.status.verified_by,
      })
      .onConflictDoNothing();

    for (const p of e.participants) {
      await db
        .insert(schema.eventParticipant)
        .values({ id: `${e.id}_p_${p.character_id}`, eventId: e.id, characterId: p.character_id, role: p.role })
        .onConflictDoNothing();
    }
  }
  console.log("events:", Object.keys(events).length);

  for (const r of Object.values(relationships)) {
    await db
      .insert(schema.relationship)
      .values({
        id: r.id,
        from: r.from,
        to: r.to,
        type: r.type,
        nature: r.nature,
        direction: r.direction,
        summary: r.summary,
        stages: r.stages,
        evidenceEvents: r.evidence_events,
        impact: r.impact,
        status: r.status.review,
        confidence: r.status.confidence,
        verifiedBy: r.status.verified_by,
      })
      .onConflictDoNothing();
  }
  console.log("relationships:", Object.keys(relationships).length);

  await client.end();
  console.log("seed complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
