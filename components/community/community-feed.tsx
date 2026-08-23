"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, sitePath } from "@/lib/api";
import type { PostSummary, Me } from "@/lib/api";
import { fetchMe } from "@/lib/api";
import { formatTime, QuoteBlock, QuestionSourceBadge } from "@/lib/client-community";
import SectionSearch from "@/components/section-search";
import { IconHeart, IconMessage, IconShare, IconRepost, IconEye, IconFlame, IconPlus } from "@/components/icons";
import SectionHero from "@/components/section-hero";
import RepostComposer from "@/components/community/repost-composer";

type Scope = "board" | "dynamic";

const SCOPE_TABS: { key: Scope; label: string; desc: string }[] = [
  { key: "board", label: "贴吧讨论", desc: "带标题的长文与主题，盖楼回复" },
  { key: "dynamic", label: "今日动态", desc: "短图文、日常动态，评论互动" },
];

const BOARD_TAGS = ["全部", "人物讨论", "自由讨论", "脑洞讨论"];

/** 图片按原比例展示（Twitter 式）：单张全宽自适应；多张网格 */
function PostImages({ urls, scope }: { urls: string[]; scope: Scope }) {
  if (!urls || urls.length === 0) return null;
  const grid = scope === "dynamic" && urls.length > 1 ? "grid grid-cols-2 gap-1.5" : "grid gap-1.5";
  return (
    <div className={`${grid} mt-3`}>
      {urls.map((u, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={u}
          loading="lazy"
          src={sitePath(u)}
          alt={`配图${i + 1}`}
          className="w-full rounded-xl object-cover"
          style={urls.length === 1 ? { maxHeight: "70vh" } : { aspectRatio: "1/1" }}
        />
      ))}
    </div>
  );
}

/** 转发来源卡（X 风格：小号原文 + 原作者头像） */
function RepostCard({ repost }: { repost: NonNullable<PostSummary["repost"]> }) {
  return (
    <div className="mt-2.5 rounded-2xl border border-line/70 bg-paper-deep/40 p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 font-serif text-[10px] text-primary">
          {repost.author.username.slice(0, 1)}
        </span>
        <span className="font-medium text-body">@{repost.author.username}</span>
      </p>
      <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted">
        {repost.title ? `【${repost.title}】${repost.content}` : repost.content}
      </p>
      {repost.images && repost.images.length > 0 && (
        <div className="mt-2 flex gap-1.5">
          {repost.images.slice(0, 3).map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} loading="lazy" src={sitePath(u)} alt="原帖图" className="h-14 w-14 rounded-lg object-cover" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommunityFeed() {
  const search = useSearchParams();
  const [me, setMe] = useState<Me | null>(null);
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [scope, setScope] = useState<Scope>((search.get("scope") as Scope) || "board");
  const [tag, setTag] = useState<string>(search.get("tag") || "全部");
  const [tab, setTab] = useState<"hot" | "new" | "following">("hot");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState("");
  const [kw, setKw] = useState(search.get("q") ?? "");
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [repostTarget, setRepostTarget] = useState<PostSummary | null>(null);

  const isBoard = scope === "board";

  const toggleLike = async (p: PostSummary) => {
    const liked = !!likedMap[p.id];
    const next = !liked;
    setLikedMap((m) => ({ ...m, [p.id]: next }));
    setPosts((list) => (list ? list.map((x) => (x.id === p.id ? { ...x, like_count: Math.max(0, x.like_count + (next ? 1 : -1)) } : x)) : list));
    try {
      await api(`/api/posts/${p.id}/like`, { method: "POST" });
    } catch {
      setLikedMap((m) => ({ ...m, [p.id]: liked }));
      setPosts((list) => (list ? list.map((x) => (x.id === p.id ? { ...x, like_count: Math.max(0, x.like_count + (liked ? 1 : -1)) } : x)) : list));
    }
  };

  useEffect(() => {
    setKw(search.get("q") ?? "");
    const s = search.get("scope") as Scope | null;
    if (s === "board" || s === "dynamic") setScope(s);
  }, [search]);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  const onKwChange = (v: string) => {
    setKw(v);
    setPage(1);
  };

  const applyFilter = (patch: Partial<{ tag: string; tab: "hot" | "new" | "following" }>) => {
    if (patch.tag !== undefined) setTag(patch.tag);
    if (patch.tab !== undefined) setTab(patch.tab);
    setPage(1);
  };

  const switchScope = (s: Scope) => {
    setScope(s);
    setTag("全部");
    setTab("hot");
    setPage(1);
    setPosts(null);
    setErr("");
  };

  useEffect(() => {
    const kwDebounced = kw.trim();
    const timer = setTimeout(async () => {
      try {
        if (tab === "following") {
          const r = await api<{
            items: PostSummary[];
          }>(`/api/feed?tab=following&per=20&scope=${scope}`);
          setPosts(r.items.map((p) => ({ ...p, status: "approved", quote: p.quote ?? null })));
          setTotal(r.items.length);
          setErr("");
          return;
        }
        const q = new URLSearchParams({ tag, sort: tab === "hot" ? "hot" : "new", page: String(page), scope });
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
  }, [scope, tag, tab, page, kw]);

  const chipCls = (on: boolean) =>
    `rounded-full px-3 py-1 text-xs transition-colors ${
      on ? "bg-primary text-paper" : "bg-paper-deep text-muted hover:bg-line/50 hover:text-body"
    }`;

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

  const Avatar = ({ name, avatar, size = "h-9 w-9" }: { name: string; avatar?: string | null; size?: string }) => {
    if (avatar) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          loading="lazy"
          src={sitePath(avatar)}
          alt={name}
          className={`${size} shrink-0 rounded-full border border-gold/40 object-cover`}
        />
      );
    }
    return (
      <span className={`flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif ${size}`}>
        <span className="text-sm text-primary">{name.slice(0, 1)}</span>
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <SectionHero
        sector="chat"
        eyebrow="COMMUNITY"
        title="聊一聊"
        description="贴吧式盖楼讨论 + 微博式今日动态，两类内容各自独立。内容自动审核，请遵守社区规范。"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/community/new"
              className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-center font-serif text-sm text-paper transition-colors hover:bg-primary-deep"
            >
              <IconPlus className="h-4 w-4" />
              发帖讨论
            </Link>
            <Link
              href="/community/status"
              className="flex items-center justify-center gap-1.5 rounded-full border border-chat-deep/40 px-5 py-2.5 text-center font-serif text-sm text-chat-deep transition-colors hover:bg-chat-deep hover:text-paper"
            >
              <IconPlus className="h-4 w-4" />
              发表状态
            </Link>
          </div>
        }
      />

      {/* 一级板块：贴吧讨论 / 今日动态（文字 Tab：选中加粗 + 下划线） */}
      <div className="mt-6 flex items-center gap-6 border-b border-line/60">
        {SCOPE_TABS.map((s) => {
          const on = scope === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => switchScope(s.key)}
              className={`-mb-px border-b-2 px-1 pb-2.5 pt-1 font-serif text-base transition-colors ${
                on
                  ? "border-title-gold font-semibold text-title-gold"
                  : "border-transparent text-muted hover:text-body"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          {/* 搜索框 */}
          <div className="flex items-center">
            <SectionSearch
              value={kw}
              onChange={onKwChange}
              placeholder={isBoard ? "搜索帖子：标题、内容、作者…" : "搜索动态…"}
              className="w-full max-w-md"
            />
          </div>

          {/* 分类标签（仅贴吧讨论） */}
          {isBoard && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {[...BOARD_TAGS, ...tags.filter((t) => !BOARD_TAGS.includes(t))].slice(0, 8).map((t) => (
                <button key={t} type="button" onClick={() => applyFilter({ tag: t })} className={chipCls(tag === t)}>
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* 排序：热帖 / 最新 / 我关注的（与上方用线分隔） */}
          <div className="mt-4 flex items-center gap-5 border-t border-line/50 pt-3">
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

          {err && <p className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{err}</p>}
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
                  ? `没有找到与「${kw.trim()}」相关的${isBoard ? "帖子" : "动态"}`
                  : tab === "following"
                    ? "你还没有关注任何人，去逛一逛，关注感兴趣的同好吧"
                    : isBoard
                      ? "这里还很安静，来做第一个发帖的人"
                      : "还没有动态，来发第一条吧"}
              </p>
              <Link
                href={isBoard ? "/community/new" : "/community/status"}
                className="mt-4 inline-block rounded-md bg-secondary-btn px-6 py-3 text-sm font-medium text-secondary-btn-text transition-colors hover:bg-[#F5EBE0]"
              >
                {isBoard ? "发第一帖" : "发第一条动态"}
              </Link>
            </div>
          )}

          {/* 帖子/动态流（Twitter 式：无边框卡片，弱分割线） */}
          <div className="mt-4">
            {posts?.map((p) => (
              <div
                key={p.id}
                className="group flex gap-3.5 border-b border-line-inner/60 py-5 transition-colors hover:bg-paper-deep/30 md:px-2"
              >
                <Link href={`/u?id=${p.author.id}`} className="shrink-0" title={`查看 ${p.author.username} 的主页`}>
                  <Avatar name={p.author.username} avatar={p.author.avatar} />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Link href={`/u?id=${p.author.id}`} className="font-medium text-ink hover:text-primary">
                      {p.author.username}
                    </Link>
                    <span className="text-muted">· {formatTime(p.created_at)}</span>
                    {isBoard && (
                      <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <Link href={`/community/post/?id=${p.id}`} className="block">
                    {isBoard ? (
                      <>
                        {/* 标题醒目区分：深棕金配色（浅色主题深棕金、深色主题提亮），正文次之 */}
                        <h2 className="mt-1.5 font-serif text-[17px] font-semibold leading-snug text-title-gold group-hover:brightness-110">
                          {p.title || "（无标题）"}
                        </h2>
                        {p.quote && <QuoteBlock quote={p.quote} compact questionId={p.question_id} />}
                        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-body">{p.content}</p>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 text-[15px] leading-relaxed text-ink">{p.content}</p>
                        {p.repost && <RepostCard repost={p.repost} />}
                      </>
                    )}
                    {!p.quote && p.question_id && <QuestionSourceBadge questionId={p.question_id} className="mt-1.5" />}
                  </Link>
                  <PostImages urls={p.images} scope={scope} />

                  {/* 操作条：统一图标（贴吧=赞/评论/分享；动态=赞/评论/转发） */}
                  <div className="mt-3 flex items-center gap-5 text-xs text-muted">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleLike(p);
                      }}
                      className={`flex items-center gap-1 transition-colors ${likedMap[p.id] ? "text-primary" : "hover:text-primary"}`}
                    >
                      <IconHeart className={`h-3.5 w-3.5 ${likedMap[p.id] ? "fill-primary text-primary" : ""}`} />
                      {p.like_count}
                    </button>
                    <Link href={`/community/post/?id=${p.id}#comments`} className="flex items-center gap-1 hover:text-primary">
                      <IconMessage className="h-3.5 w-3.5" />
                      评论
                    </Link>
                    {isBoard ? (
                      <span className="flex items-center gap-1">
                        <IconShare className="h-3.5 w-3.5" />
                        分享
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRepostTarget(p);
                        }}
                        className="flex items-center gap-1 transition-colors hover:text-primary"
                      >
                        <IconRepost className="h-3.5 w-3.5" />
                        转发
                      </button>
                    )}
                    <span className="ml-auto flex items-center gap-1">
                      <IconEye className="h-3.5 w-3.5" />
                      {p.view_count}
                    </span>
                  </div>
                </div>
              </div>
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

        {/* 右侧栏：活跃同好 / 热门 */}
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
                热门{isBoard ? "讨论" : "动态"}
              </h3>
              <ol className="mt-3 space-y-2.5">
                {hotPosts.map((p, i) => (
                  <li key={p.id} className="flex gap-2.5 text-sm">
                    <span className="w-4 shrink-0 font-serif text-gold">{i + 1}</span>
                    <Link href={`/community/post/?id=${p.id}`} className="line-clamp-2 text-body transition-colors hover:text-primary">
                      {p.title || p.content}
                    </Link>
                  </li>
                ))}
                {hotPosts.length === 0 && <li className="text-xs text-muted">暂无数据</li>}
              </ol>
            </div>
          </div>
        </aside>
      </div>

      {/* 转发弹层 */}
      {repostTarget && (
        <RepostComposer
          original={{
            id: repostTarget.id,
            username: repostTarget.author.username,
            content: repostTarget.content,
            title: repostTarget.title,
            images: repostTarget.images,
          }}
          onClose={() => setRepostTarget(null)}
          onDone={() => {
            setRepostTarget(null);
            setTimeout(() => {
              const q = new URLSearchParams({ tag, sort: tab === "hot" ? "hot" : "new", page: String(page), scope });
              api<{ posts: PostSummary[]; total: number }>(`/api/posts?${q}`).then((r) => {
                setPosts(r.posts);
                setTotal(r.total);
              }).catch(() => {});
            }, 800);
          }}
        />
      )}
    </div>
  );
}
