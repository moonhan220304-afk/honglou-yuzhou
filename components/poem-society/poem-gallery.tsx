"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatTime } from "@/lib/client-community";
import type { PostDetailData, TopicInfo, TopicWork } from "@/lib/poem-society";
import { cleanReview } from "@/lib/poem-society";
import PoemSocietyNav from "@/components/poem-society/poem-society-nav";
import PoemShareModal, { type PoemShareData } from "@/components/poem-society/poem-share-modal";

interface GalleryPoem extends TopicWork {
  review: string | null;
  detail: PostDetailData | null;
}

interface GalleryRow {
  topic: TopicInfo;
  poems: GalleryPoem[];
}

const RANKS = [
  { label: "魁首", badge: "bg-gold text-white", card: "border-2 border-gold shadow-hover", reason: "本刊魁首" },
  { label: "榜眼", badge: "bg-[#8f9aa8] text-white", card: "border border-[#aeb8c2]", reason: "本刊榜眼" },
  { label: "探花", badge: "bg-[#c58a5a] text-white", card: "border border-[#c58a5a]", reason: "本刊探花" },
];

function excerpt(s: string, n = 56): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

/** 佳作集（红楼诗刊）：各期诗题按热度取前三，魁首/榜眼/探花 */
export default function PoemGallery() {
  const [rows, setRows] = useState<GalleryRow[] | null>(null);
  const [err, setErr] = useState("");
  const [shareData, setShareData] = useState<PoemShareData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api<{ items: TopicInfo[] }>("/api/topics?kind=poem_topic");
        const topics = r.items.slice(0, 4);
        const settled = await Promise.allSettled(
          topics.map(async (topic) => {
            const d = await api<{ topic: TopicInfo; items: TopicWork[] }>(`/api/topics/${topic.id}`);
            const top = [...d.items]
              .sort((a, b) => b.like_count - a.like_count || a.created_at - b.created_at)
              .slice(0, 3);
            const poems = (
              await Promise.allSettled(
                top.map(async (w) => {
                  const dd = await api<PostDetailData>(`/api/posts/${w.id}`);
                  return { ...w, review: dd.reviews[0]?.content ?? null, detail: dd } as GalleryPoem;
                }),
              )
            )
              .filter((x): x is PromiseFulfilledResult<GalleryPoem> => x.status === "fulfilled")
              .map((x) => x.value);
            return { topic, poems } as GalleryRow;
          }),
        );
        setRows(
          settled
            .filter((x): x is PromiseFulfilledResult<GalleryRow> => x.status === "fulfilled")
            .map((x) => x.value),
        );
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "加载失败");
        setRows([]);
      }
    })();
  }, []);

  const sharePoem = (row: GalleryRow, p: GalleryPoem) => {
    setShareData({
      title: p.title || p.content.split("\n")[0].slice(0, 24),
      content: p.content,
      author: p.author.username,
      likeCount: p.like_count,
      topicTitle: `#${row.topic.title}#`,
      comments: p.detail?.comments ?? [],
      reviews: p.detail?.reviews ?? [],
    });
  };

  const total = rows?.reduce((n, r) => n + r.poems.length, 0) ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <header>
        <p className="text-xs tracking-[0.3em] text-gold">POEM JOURNAL · 海棠诗社</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">红楼诗刊</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-body">
          各期诗题按热度遴选佳作，魁首、榜眼、探花，附评选理由。
        </p>
      </header>

      <div className="mt-6">
        <PoemSocietyNav />
      </div>

      {err && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}

      {!rows && (
        <div className="mt-6 space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl bg-paper-deep/60" />
          ))}
        </div>
      )}

      {rows && total === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-gold/50 bg-surface-warm p-12 text-center">
          <p className="font-serif text-lg text-secondary-btn-text">
            诗刊尚待来稿——去当期诗题写下第一首诗吧
          </p>
          <Link
            href="/poem-society"
            className="mt-4 inline-block rounded-md bg-secondary-btn px-6 py-3 text-sm font-medium text-secondary-btn-text transition-colors hover:bg-[#F5EBE0]"
          >
            去当期诗题 →
          </Link>
        </div>
      )}

      {rows && total > 0 && (
        <div className="mt-8 space-y-10">
          {rows
            .filter((r) => r.poems.length > 0)
            .map((row) => (
              <section key={row.topic.id}>
                <h2 className="flex flex-wrap items-baseline gap-3">
                  <Link
                    href={`/poem-society/topic/${row.topic.id}`}
                    className="font-serif text-xl font-semibold text-ink transition-colors hover:text-primary"
                  >
                    #{row.topic.title}#
                  </Link>
                  <span className="text-xs text-muted">{row.poems.length} 首入选</span>
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {row.poems.map((p, i) => {
                    const rank = RANKS[i] || RANKS[2];
                    return (
                      <article key={p.id} className={`rounded-2xl bg-surface p-5 ${rank.card}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 font-serif text-xs font-semibold ${rank.badge}`}>
                            {rank.label}
                          </span>
                          <span className="text-xs text-muted">{formatTime(p.created_at)}</span>
                        </div>
                        {p.title && (
                          <h3 className="mt-3 font-serif text-base font-semibold text-ink">{p.title}</h3>
                        )}
                        <p className="mt-2 line-clamp-6 whitespace-pre-line font-serif text-sm leading-loose text-ink/90">
                          {p.content}
                        </p>
                        <p className="mt-3 text-xs text-muted">
                          <span className="font-medium text-ink">{p.author.username}</span> · ♥ {p.like_count}
                        </p>
                        <p className="mt-1.5 rounded-lg bg-paper-deep/60 px-3 py-2 text-xs leading-relaxed text-body">
                          <span className="text-gold">评选理由：</span>
                          {p.review ? excerpt(cleanReview(p.review)) : rank.reason}
                        </p>
                        <button
                          type="button"
                          onClick={() => sharePoem(row, p)}
                          className="mt-3 w-full rounded-full border border-gold/50 bg-gold/10 py-2 font-serif text-xs text-[#8a6a45] transition-colors hover:bg-gold/20"
                        >
                          生成分享页
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      )}

      <PoemShareModal data={shareData} onClose={() => setShareData(null)} />
    </div>
  );
}
