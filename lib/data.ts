
import {
  characters,
  events,
  relationships,
  sources,
  chapters,
  referencedName,
  viewpointsByCharacter,
  allViewpoints,
  questions,
  topQuestions,
  questionsOfCharacter,
  locations,
  getLocation,
  kbPoems,
  poemsOfCharacter,
  characterAges,
  agesOfCharacter,
} from "@/lib/kb/loader";

export {
  characters,
  events,
  relationships,
  sources,
  chapters,
  viewpointsByCharacter,
  allViewpoints,
  questions,
  topQuestions,
  questionsOfCharacter,
  locations,
  getLocation,
  kbPoems,
  poemsOfCharacter,
  characterAges,
  agesOfCharacter,
};

export function getCharacter(id: string) {
  return characters[id];
}

export function getEvent(id: string) {
  return events[id];
}

export function getRelationship(id: string) {
  return relationships[id];
}

export function getSource(id: string) {
  return sources[id];
}

/** 问题 id → 标题（社区帖子「来自问题」回跳链路用） */
export function questionTitle(id: string): string | undefined {
  return questions.find((q) => q.id === id)?.title;
}

export function getChapter(number: number) {
  return chapters[number];
}

export function relationshipsOf(characterId: string) {
  return Object.values(relationships).filter(
    (r) => r.from === characterId || r.to === characterId,
  );
}

export function counterpart(relationshipId: string, characterId: string) {
  const r = getRelationship(relationshipId);
  if (!r) return null;
  return r.from === characterId ? r.to : r.from;
}

export function characterName(id: string) {
  return characters[id]?.name ?? referencedName(id) ?? id.replace("character_", "");
}

export function eventByIds(ids: string[]) {
  return ids.map((id) => events[id]).filter(Boolean);
}

export function eventFromRelations(r: { event_id: string }[]) {
  return r
    .map((e) => ({ ...e, event: events[e.event_id] }))
    .filter((e) => e.event);
}

export function chapterLabel(number: number | null | undefined) {
  if (number == null || number < 1 || number > 120) return "";
  return `第${toChineseNumber(number)}回`;
}

const digits = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

export function toChineseNumber(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  if (n < 10) return digits[n];
  if (n < 20) return `十${n % 10 === 0 ? "" : digits[n % 10]}`;
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return `${digits[tens]}十${ones === 0 ? "" : digits[ones]}`;
  }
  if (n < 110) return `一百${n === 100 ? "" : "零" + digits[n % 10]}`;
  const ones = n % 10;
  const tens = Math.floor((n % 100) / 10);
  return `一百${tens === 0 ? (ones === 0 ? "" : "零" + digits[ones]) : digits[tens] + "十" + (ones === 0 ? "" : digits[ones])}`;
}
