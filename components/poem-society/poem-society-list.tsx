"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { DIFFICULTY_LABEL, type TopicInfo } from "@/lib/poem-society";
import PoemSocietyNav from "@/components/poem-society/poem-society-nav";

/** 诗题列表：当期诗题大卡 + 往期列表（长期开放） */
export default function PoemSocietyList() {
  const [items, setItems] = useState<TopicInfo[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await api<{ items: TopicInfo[] }>("/api/topics?kind=poem_topic");
        setItems(r.items);
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "加载失败");
        setItems([]);
      }
    })();
  }, []);

  const current = items?.find((t) => t.is_current === 1) ?? null;
  const past = items?.filter((t) => t.is_current !== 1) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <header>
        <p className="text-xs tracking-[0.3em] text-gold">POEM SOCIETY · 海棠诗社</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">当期诗题</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-body">
          以诗会友，咏物言志。每月一期诗题，往期长期开放——任何一首，都值得被看见。
        </p>
      </header>

      <div className="mt-6">
        <PoemSocietyNav />
      </div>

      {err && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}

      {!items && (
        <div className="mt-6 space-y-4">
          <div className="h-56 animate-pulse rounded-3xl bg-paper-deep/60" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-paper-deep/60" />
          ))}
        </div>
      )}

      {items && (
        <>
          {/* 当期诗题大卡 */}
          {current && (
            <Link
              href={`/poem-society/topic/${current.id}`}
              className="card-print card-print--identity mt-6 block rounded-3xl bg-surface p-6 transition-all hover:-translate-y-0.5 hover:shadow-hover md:p-8"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-gold/15 px-2.5 py-0.5 font-medium text-gold">
                  当期诗题 · 参与双倍积分
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                  {DIFFICULTY_LABEL[current.difficulty] || current.difficulty}
                </span>
              </div>
              <h2 className="mt-4 font-serif text-2xl font-semibold leading-snug text-ink md:text-3xl">
                #{current.title}#
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">{current.content}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <span className="rounded-full bg-primary px-5 py-2 font-serif text-sm text-paper">
                  去参与 →
                </span>
                <span className="text-xs text-muted">
                  已有 <span className="font-serif text-sm font-semibold text-primary">{current.join_count}</span> 人参与
                </span>
              </div>
            </Link>
          )}

          {/* 往期列表（长期开放） */}
          <section className="mt-10">
            <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
              <span className="h-4 w-1 rounded-full bg-primary" />
              往期诗题 · 长期开放
            </h2>
            {past.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-gold/50 bg-surface-warm p-8 text-center text-sm text-muted">
                还没有往期诗题
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {past.map((t) => (
                  <Link
                    key={t.id}
                    href={`/poem-society/topic/${t.id}`}
                    className="group rounded-2xl bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-paper-deep px-2.5 py-0.5 text-xs text-muted">
                        {DIFFICULTY_LABEL[t.difficulty] || t.difficulty}
                      </span>
                      <span className="text-xs text-muted">{t.join_count} 人参与</span>
                    </div>
                    <h3 className="mt-3 font-serif text-lg font-semibold leading-snug text-ink group-hover:text-primary">
                      #{t.title}#
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{t.content}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
