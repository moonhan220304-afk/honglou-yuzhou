"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { Me, PostQuote } from "@/lib/api";
import type { Question, QuestionViewpoint } from "@/lib/types";
import { getSource, getCharacter, getEvent, getLocation, chapterLabel, characterName } from "@/lib/data";
import CharacterAvatar from "@/components/character-avatar";
import QuestionDiscussion from "@/components/community/question-discussion";
import ShareCardModal from "@/components/community/share-card-modal";
import type { ShareCardData } from "@/components/community/share-card-modal";

const stanceLabel: Record<string, string> = {
  pro_self_pity: "自怜论",
  pro_martyrdom: "殉道论",
  pro_symbolism: "象征论",
};

interface LikeState {
  count: number;
  liked: boolean;
}

/** 问题页主体（client）：各方观点（点赞/引用/按赞排序）+ 原文证据 + 关联 + 讨论区联动 */
export default function QuestionBody({ q }: { q: Question }) {
  const [me, setMe] = useState<Me | null>(null);
  const [likes, setLikes] = useState<Record<string, LikeState>>({});
  const [loaded, setLoaded] = useState(false);
  const [quote, setQuote] = useState<PostQuote | null>(null);
  const [shareData, setShareData] = useState<ShareCardData | null>(null);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  const loadLikes = useCallback(async () => {
    try {
      const r = await api<{ likes: Record<string, LikeState> }>(`/api/viewpoints/${encodeURIComponent(q.id)}`);
      setLikes(r.likes);
    } catch {
      setLikes({});
    } finally {
      setLoaded(true);
    }
  }, [q.id]);

  useEffect(() => {
    (async () => {
      await loadLikes();
    })();
  }, [loadLikes]);

  const toggleLike = async (v: QuestionViewpoint) => {
    if (!me) {
      window.location.assign(sitePath(`/login?next=/questions/${q.id}`));
      return;
    }
    try {
      const r = await api<{ liked: boolean; count: number }>(
        `/api/viewpoints/${encodeURIComponent(q.id)}/${encodeURIComponent(v.id)}/like`,
        { method: "POST" },
      );
      setLikes((prev) => ({ ...prev, [v.id]: { count: r.count, liked: r.liked } }));
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : "点赞失败");
    }
  };

  const quoteViewpoint = (v: QuestionViewpoint) => {
    if (!me) {
      window.location.assign(sitePath(`/login?next=/questions/${q.id}`));
      return;
    }
    const srcLabels = v.source_ids
      .map((sid) => getSource(sid)?.title)
      .filter((t) => t && !t.startsWith("source_"));
    const source = `${v.fact_type === "text_inference" ? "文本推断" : "红学观点"} · 置信度 ${v.confidence}%${
      srcLabels.length ? ` · ${srcLabels.join("；")}` : ""
    }`;
    setQuote({
      question_title: q.title,
      viewpoint_title: v.title,
      source,
      summary: v.summary || v.argument_body,
    });
    requestAnimationFrame(() => {
      document.getElementById("question-discussion")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const shareViewpoint = (v: QuestionViewpoint) => {
    const srcLabels = v.source_ids
      .map((sid) => getSource(sid)?.title)
      .filter((t) => t && !t.startsWith("source_"));
    const source = `${v.fact_type === "text_inference" ? "文本推断" : "红学观点"} · 置信度 ${v.confidence}%${
      srcLabels.length ? ` · ${srcLabels.join("；")}` : ""
    }`;
    setShareData({
      mode: "viewpoint",
      questionTitle: q.title,
      quoteTitle: v.title,
      quoteSource: source,
      quoteBody: v.summary || v.argument_body,
      noteLabel: "我的理解",
      note: "",
      noteAuthor: me ? me.username : "红楼读者",
      downloadName: `honglou-viewpoint-${v.id}.png`,
    });
  };

  /* 点赞数排序：多者前置；未加载时保持原序（稳定） */
  const ordered = loaded
    ? [...q.viewpoints].sort((a, b) => (likes[b.id]?.count ?? 0) - (likes[a.id]?.count ?? 0))
    : q.viewpoints;

  return (
    <>
      {/* 多方观点 */}
      <section className="mt-10">
        <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          各方观点
          {loaded && (
            <span className="font-sans text-xs font-normal text-muted">按点赞排序 · 可引用、可分享</span>
          )}
        </h2>
        <div className="mt-5 space-y-4">
          {ordered.map((v) => {
            const st = likes[v.id] || { count: 0, liked: false };
            return (
              <article
                key={v.id}
                className="rounded-2xl bg-surface card-print card-print--identity p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-base font-semibold text-ink">{v.title}</h3>
                  {stanceLabel[v.stance_type] && (
                    <span className="rounded-[4px] bg-gold/15 px-2 py-0.5 text-xs text-secondary-btn-text">
                      {stanceLabel[v.stance_type]}
                    </span>
                  )}
                  <span className="rounded-[4px] bg-paper-deep px-2 py-0.5 text-xs text-muted">
                    {v.fact_type === "text_inference" ? "文本推断" : "红学观点"} · 置信度 {v.confidence}%
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.summary}</p>
                <p className="mt-3 text-sm leading-relaxed text-body">{v.argument_body}</p>
                {v.source_ids?.length > 0 && (() => {
                  const labels = v.source_ids
                    .map((sid) => getSource(sid)?.title)
                    .filter((t) => t && !t.startsWith("source_"));
                  return labels.length > 0 ? (
                    <p className="mt-3 text-xs text-muted">出处：{labels.join("；")}</p>
                  ) : null;
                })()}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-line/60 pt-3">
                  <button
                    type="button"
                    onClick={() => quoteViewpoint(v)}
                    className="rounded-full bg-paper-deep px-3.5 py-1.5 text-xs text-secondary-btn-text transition-colors hover:bg-line/60 hover:text-primary"
                  >
                    引用观点
                  </button>
                  <button
                    type="button"
                    onClick={() => shareViewpoint(v)}
                    className="rounded-full bg-paper-deep px-3.5 py-1.5 text-xs text-secondary-btn-text transition-colors hover:bg-line/60 hover:text-primary"
                  >
                    分享
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLike(v)}
                    className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                      st.liked
                        ? "bg-primary/10 text-primary"
                        : "bg-paper-deep text-secondary-btn-text hover:bg-line/60 hover:text-primary"
                    }`}
                  >
                    {st.liked ? "♥ 已赞" : "♡ 赞"}
                    {st.count > 0 && <span className="font-mono">{st.count}</span>}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 原文证据 */}
      {q.evidence.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
            <span className="h-4 w-1 rounded-full bg-primary" />
            原文证据
          </h2>
          <div className="mt-5 space-y-4">
            {q.evidence.map((e) => (
              <blockquote
                key={e.id}
                className="rounded-2xl border-l-2 border-gold/70 bg-surface-warm p-5"
              >
                <p className="font-serif text-sm leading-loose text-ink/85">
                  “{e.quote_full ?? e.quote_short}”
                </p>
                <footer className="mt-2 text-xs text-muted">
                  {e.relation_type === "support" ? "支持性证据" : "对照性证据"}
                  {e.source_id && getSource(e.source_id) && !getSource(e.source_id)!.title.startsWith("source_")
                    ? ` · ${getSource(e.source_id)!.title}`
                    : ""}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* 相关人物 / 事件 / 章节 / 地点 */}
      <section className="mt-10">
        <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          沿着问题继续走
        </h2>

        {q.related_character_ids?.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold tracking-wide text-gold">相关人物</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {q.related_character_ids.map((cid) => {
                const linked = getCharacter(cid);
                const inner = (
                  <>
                    <CharacterAvatar
                      characterId={cid}
                      name={characterName(cid)}
                      className="h-16 w-16 transition-transform group-hover:scale-105"
                    />
                    <span className="text-sm font-medium text-ink group-hover:text-primary">
                      {characterName(cid)}
                    </span>
                  </>
                );
                return linked ? (
                  <Link
                    key={cid}
                    href={`/characters/${cid}`}
                    className="group flex w-24 flex-col items-center gap-2 text-center"
                  >
                    {inner}
                  </Link>
                ) : (
                  <span
                    key={cid}
                    className="group flex w-24 flex-col items-center gap-2 text-center"
                    title="该人物档案整理中"
                  >
                    {inner}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {q.related_event_ids?.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold tracking-wide text-gold">相关事件</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.related_event_ids.map((eid) => {
                const ev = getEvent(eid);
                return ev ? (
                  <Link
                    key={eid}
                    href={`/events/${eid}`}
                    className="rounded-full bg-surface px-3 py-1.5 text-xs text-secondary-btn-text transition-colors hover:border-gold/70 hover:text-primary"
                  >
                    {ev.title} · {chapterLabel(ev.chapter.number)}
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        )}

        {q.related_chapter_ids?.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold tracking-wide text-gold">涉及章回</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.related_chapter_ids.map((n) => (
                <span
                  key={n}
                  className="rounded-full bg-surface px-3 py-1.5 text-xs text-secondary-btn-text"
                >
                  {chapterLabel(n)}
                </span>
              ))}
            </div>
          </div>
        )}

        {q.related_location_ids?.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold tracking-wide text-gold">发生地点</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.related_location_ids.map((lid) => {
                const loc = getLocation(lid);
                return loc ? (
                  <Link
                    key={lid}
                    href={`/map/${lid}`}
                    className="rounded-full bg-surface px-3 py-1.5 text-xs text-secondary-btn-text transition-colors hover:border-gold/70 hover:text-primary"
                  >
                    {loc.name}
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        )}
      </section>

      {/* 讨论（真实社区，内嵌当页） */}
      <div id="question-discussion" className="scroll-mt-24">
        <QuestionDiscussion
          questionId={q.id}
          questionTitle={q.title}
          quote={quote}
          onClearQuote={() => setQuote(null)}
        />
      </div>

      <ShareCardModal data={shareData} onClose={() => setShareData(null)} />
    </>
  );
}
