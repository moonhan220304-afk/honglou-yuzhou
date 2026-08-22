"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, sitePath } from "@/lib/api";
import type { PostSummary } from "@/lib/api";
import { fetchMe } from "@/lib/api";
import type { Me } from "@/lib/api";
import { formatTime, QuoteBlock, QuestionSourceBadge } from "@/lib/client-community";
import SectionSearch from "@/components/section-search";
import StatusComposer from "@/components/community/status-composer";
import { IconHeart, IconMessage, IconShare, IconEye, IconFlame, IconPlus } from "@/components/icons";

export default function CommunityFeed() {
  const search = useSearchParams();
  const [me, setMe] = useState<Me | null>(null);
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState<string>(search.get("tag") || "全部");
  const [tab, setTab] = useState<"hot" | "new" | "following">("hot");
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

  const applyFilter = (patch: Partial<{ tag: string; tab: "hot" | "new" | "following" }>) => {
    setTag(patch.tag ?? tag);
    setTab(patch.tab ?? tab);
    setPage(1);
  };

  useEffect(() => {
    const kwDebounced = kw.trim();
    const timer = setTimeout(async () => {
      try {
        if (tab === "following") {
          const r = await api<{
            items: { id: number; title: string; content: string; tag: string; type: string; like_count: number; view_count: number; created_at: number; author: { id: number; username: string; avatar: string | null } }[];
          }>(`/api/feed?tab=following&per=20`);
          const mapped: PostSummary[] = r.items.map((p) => ({
            id: p.id,
            title: p.title,
            content: p.content,
            tag: p.tag || "关注",
            images: [],
            status: "approved",
            like_count: p.like_count,
            view_count: p.view_count,
            question_id: null,
            quote: null,
            author: { id: p.author.id, username: p.author.username },
            created_at: p.created_at,
          }));
          setPosts(mapped);
          setTotal(mapped.length);
          setErr("");
          return;
        }
        const q = new URLSearchParams({ tag, sort: tab === "hot" ? "hot" : "new", page: String(page) });
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
  }, [tag, tab, page, kw]);

  const chipCls = (on: boolean) =>
    `rounded-full px-3 py-1 text-xs transition-colors ${
      on ? "bg-primary text-paper" : "bg-paper-deep text-muted hover:bg-line/50 hover:text-body"
    }`;

  /* 右侧栏：活跃用户 + 热点 */
  const activeUsers = useMemo(() => {
    if (!posts) return [];
    const seen = new Map<string, string>();
    for (const p of posts) {
      if (!seen.has(p.author.username)) seen.set(p.author.username, String(p.author.id));
    }
    return [...seen.entries()].slice(0, 6).map(([name, id]) => ({ name, id }));
  }, [posts]);

  const hotPosts = useMemo(
    () => (posts ? [...posts].sort((a, b) => b.like_count - a.like_count).slice(0, 5) : []),
    [posts],
  );

  const Avatar = ({ name, size = "h-9 w-9" }: { name: string; size?: string }) => (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif ${size}`}>
      <span className="text-sm text-primary">{name.slice(0, 1)}</span>
    </span>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-gold">COMMUNITY</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">聊一聊</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-body">
            与同好共论红楼。发帖、盖楼、自建话题——内容自动审核，命中敏感词转人工复核，请遵守社区规范。
          </p>
        </div>
        <div className="w-full max-w-[240px] space-y-2">
          <Link
            href="/community/new"
            className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-center font-serif text-sm text-paper transition-colors hover:bg-primary-deep"
          >
            <IconPlus className="h-4 w-4" />
            发帖讨论
          </Link>
          <StatusComposer onPosted={() => applyFilter({ tab: "new" })} />
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        {/* 主列：帖子流（小红书式） */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <SectionSearch
              value={kw}
              onChange={onKwChange}
              placeholder="搜索帖子：标题、内容、作者…"
              className="mr-2 w-full max-w-xs"
            />
            {["全部", ...tags].slice(0, 6).map((t) => (
              <button key={t} type="button" onClick={() => applyFilter({ tag: t })} className={chipCls(tag === t)}>
                {t}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-line" />
            <button type="button" onClick={() => applyFilter({ tab: "hot" })} className={chipCls(tab === "hot")}>
              热帖
            </button>
            <button type="button" onClick={() => applyFilter({ tab: "new" })} className={chipCls(tab === "new")}>
              最新
            </button>
            <button type="button" onClick={() => applyFilter({ tab: "following" })} className={chipCls(tab === "following")}>
              我关注的
            </button>
          </div>

          {err && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
          {!posts && (
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-paper-deep/60" />
              ))}
            </div>
          )}
          {posts && posts.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed border-gold/50 bg-surface-warm p-12 text-center">
              <p className="font-serif text-lg text-secondary-btn-text">
                {kw.trim()
                  ? `没有找到与「${kw.trim()}」相关的帖子`
                  : tab === "following"
                    ? "你还没有关注任何人，去逛一逛，关注感兴趣的同好吧"
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

          {/* 小红书式帖子流：头像 + 作者 + 正文 + 互动区，弱分割线 */}
          <div className="mt-4">
            {posts?.map((p) => (
              <Link
                key={p.id}
                href={`/community/post/?id=${p.id}`}
                className="group flex gap-3.5 border-b border-line-inner/60 py-5 transition-colors hover:bg-paper-deep/30 md:px-2"
              >
                <Avatar name={p.author.username} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-ink">{p.author.username}</span>
                    <span className="text-muted">· {formatTime(p.created_at)}</span>
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                      {p.tag}
                    </span>
                  </div>
                  <h2 className="mt-1.5 font-serif text-[15px] font-semibold leading-snug text-ink group-hover:text-primary">
                    {p.title}
                  </h2>
                  {p.quote && <QuoteBlock quote={p.quote} compact questionId={p.question_id} />}
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{p.content}</p>
                  {!p.quote && p.question_id && <QuestionSourceBadge questionId={p.question_id} className="mt-1.5" />}
                  <div className="mt-2.5 flex items-center gap-5 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <IconHeart className="h-3.5 w-3.5" />
                      {p.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconMessage className="h-3.5 w-3.5" />
                      评论
                    </span>
                    <span className="flex items-center gap-1">
                      <IconShare className="h-3.5 w-3.5" />
                      分享
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                      <IconEye className="h-3.5 w-3.5" />
                      {p.view_count}
                    </span>
                  </div>
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

        {/* 右侧栏：相关人员 / 热点 */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            <div className="card-print card-print--identity rounded-2xl bg-surface p-5">
              <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-ink">
                <IconFlame className="h-4 w-4 text-gold" />
                活跃的同好
              </h3>
              <div className="mt-3 space-y-2.5">
                {activeUsers.map((u) => (
                  <Link key={u.name} href={`/u?id=${u.id}`} className="flex items-center gap-2.5 transition-colors hover:text-primary">
                    <Avatar name={u.name} size="h-8 w-8" />
                    <span className="font-serif text-sm text-ink">{u.name}</span>
                  </Link>
                ))}
                {activeUsers.length === 0 && <p className="text-xs text-muted">暂无活跃用户</p>}
              </div>
            </div>

            <div className="card-print rounded-2xl bg-surface p-5">
              <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-ink">
                <IconFlame className="h-4 w-4 text-gold" />
                热门讨论
              </h3>
              <ol className="mt-3 space-y-2.5">
                {hotPosts.map((p, i) => (
                  <li key={p.id} className="flex gap-2.5 text-sm">
                    <span className="w-4 shrink-0 font-serif text-gold">{i + 1}</span>
                    <Link href={`/community/post/?id=${p.id}`} className="line-clamp-2 text-body transition-colors hover:text-primary">
                      {p.title}
                    </Link>
                  </li>
                ))}
                {hotPosts.length === 0 && <li className="text-xs text-muted">暂无数据</li>}
              </ol>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
