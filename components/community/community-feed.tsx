"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { PostSummary } from "@/lib/api";
import { fetchMe } from "@/lib/api";
import type { Me } from "@/lib/api";
import { formatTime, QuoteBlock, QuestionSourceBadge } from "@/lib/client-community";
import SectionSearch from "@/components/section-search";

export default function CommunityFeed() {
  const search = useSearchParams();
  const [me, setMe] = useState<Me | null>(null);
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState<string>(search.get("tag") || "全部");
  const [sort, setSort] = useState<"new" | "hot">("new");
  const [mine, setMine] = useState(search.get("mine") === "1");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState("");
  const [kw, setKw] = useState(search.get("q") ?? "");

  useEffect(() => {
    (async () => {
      setKw(search.get("q") ?? "");
    })();
  }, [search]);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  const onKwChange = (v: string) => {
    setKw(v);
    setPage(1);
  };

  const applyFilter = (patch: Partial<{ tag: string; sort: "new" | "hot"; mine: boolean }>) => {
    setTag(patch.tag ?? tag);
    setSort(patch.sort ?? sort);
    setMine(patch.mine ?? mine);
    setPage(1);
  };

  useEffect(() => {
    const kwDebounced = kw.trim();
    const timer = setTimeout(async () => {
      try {
        const q = new URLSearchParams({ tag, sort, page: String(page) });
        if (mine) q.set("mine", "1");
        if (kwDebounced) q.set("q", kwDebounced);
        const r = await api<{ posts: PostSummary[]; total: number; tags: string[] }>(`/api/posts?${q}`);
        setPosts(r.posts);
        setTotal(r.total);
        if (r.tags.length) setTags(r.tags);
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "加载失败");
        setPosts([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [tag, sort, mine, page, kw]);

  const chipCls = (on: boolean) =>
    `rounded-full px-3 py-1 text-xs transition-colors ${
      on ? "bg-primary text-paper" : "bg-paper-deep text-muted hover:bg-line/50 hover:text-body"
    }`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-gold">COMMUNITY</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">社区讨论</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-body">
            与同好共论红楼。发帖、盖楼、自建话题——内容自动审核，命中敏感词转人工复核，请遵守社区规范。
          </p>
        </div>
        <Link
          href="/community/new"
          className="rounded-full bg-primary px-5 py-2.5 font-serif text-sm text-paper transition-colors hover:bg-primary-deep"
        >
          ✍ 发帖讨论
        </Link>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <SectionSearch
          value={kw}
          onChange={onKwChange}
          placeholder="搜索帖子：标题、内容、作者…"
          className="mr-2 w-full max-w-xs"
        />
        {["全部", ...tags].map((t) => (
          <button key={t} type="button" onClick={() => applyFilter({ tag: t })} className={chipCls(tag === t)}>
            {t}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-line" />
        <button type="button" onClick={() => applyFilter({ sort: "new" })} className={chipCls(sort === "new")}>
          最新
        </button>
        <button type="button" onClick={() => applyFilter({ sort: "hot" })} className={chipCls(sort === "hot")}>
          热门
        </button>
        {me && (
          <>
            <span className="mx-1 h-4 w-px bg-line" />
            <button type="button" onClick={() => applyFilter({ mine: !mine })} className={chipCls(mine)}>
              我的帖子
            </button>
          </>
        )}
      </div>

      {kw.trim() && (
        <p className="mt-3 text-xs text-muted">
          {posts && posts.length > 0 ? `找到 ${total} 个相关帖子` : ""}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
        {!posts && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-paper-deep/60" />
            ))}
          </>
        )}
        {posts && posts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-gold/50 bg-surface-warm p-12 text-center">
            <p className="font-serif text-lg text-secondary-btn-text">
              {kw.trim()
                ? `没有找到与「${kw.trim()}」相关的帖子`
                : mine
                  ? "你还没有发过帖子"
                  : "这里还很安静，来做第一个发言的人"}
            </p>
            <Link
              href="/community/new"
              className="mt-4 inline-block rounded-md bg-secondary-btn px-6 py-3 text-sm font-medium text-secondary-btn-text transition-colors hover:bg-[#F5EBE0]"
            >
              发第一帖
            </Link>
          </div>
        )}
        {posts?.map((p) => (
          <Link
            key={p.id}
            href={`/community/post/?id=${p.id}`}
            className="group block rounded-2xl bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">{p.tag}</span>
              {p.status === "pending" && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-700">待审核</span>
              )}
              <span>{p.author.username}</span>
              <span>·</span>
              <span>{formatTime(p.created_at)}</span>
            </div>
            <h2 className="mt-2.5 font-serif text-lg font-semibold leading-snug text-ink group-hover:text-primary">
              {p.title}
            </h2>
            {p.quote && <QuoteBlock quote={p.quote} compact questionId={p.question_id} />}
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{p.content}</p>
            {!p.quote && p.question_id && <QuestionSourceBadge questionId={p.question_id} className="mt-2" />}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted">
              <span>赞 {p.like_count}</span>
              <span>阅读 {p.view_count}</span>
              {p.images.length > 0 && <span>🖼 {p.images.length}</span>}
            </div>
          </Link>
        ))}
      </div>

      {posts && total > 20 && (
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((v) => v - 1)}
            className="rounded-full bg-paper-deep px-5 py-2 text-sm text-body disabled:opacity-40"
          >
            ← 上一页
          </button>
          <span className="py-2 text-sm text-muted">
            第 {page} 页 / 共 {Math.ceil(total / 20)} 页
          </span>
          <button
            type="button"
            disabled={page * 20 >= total}
            onClick={() => setPage((v) => v + 1)}
            className="rounded-full bg-paper-deep px-5 py-2 text-sm text-body disabled:opacity-40"
          >
            下一页 →
          </button>
        </div>
      )}
    </div>
  );
}
