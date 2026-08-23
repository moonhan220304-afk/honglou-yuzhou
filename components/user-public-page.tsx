"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { ContentItem, FollowItem, Me, UserPublic } from "@/lib/api";
import { formatTime } from "@/lib/client-community";
import LevelBadge from "@/components/level-badge";
import { typeLabel } from "@/lib/levels";
import ProfileShareCard from "@/components/profile-share-card";
import { IconShare, IconRepost, IconMessage, IconHeart, IconBook, IconFlame } from "@/components/icons";

/** 用户主页内容标签：贴吧 / 动态（与聊一聊命名统一） */
const CONTENT_TABS = [
  { key: "board", label: "贴吧", icon: IconBook, filter: (t: string) => t === "post" || t === "longform" },
  { key: "dynamic", label: "动态", icon: IconFlame, filter: (t: string) => t === "dynamic" },
] as const;

/** 用户公开主页（/u?id=）—— Twitter 风格：无边框卡片，头像下压，金色加粗名字，贴吧/动态标签页 */
export default function UserPublicPage() {
  const search = useSearchParams();
  const id = Number(search.get("id")) || 0;

  const [user, setUser] = useState<UserPublic | null | undefined>(undefined);
  const [items, setItems] = useState<ContentItem[] | null>(null);
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [following, setFollowing] = useState(false);
  const [mutual, setMutual] = useState(false);
  const [followees, setFollowees] = useState<FollowItem[] | null>(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [followMsg, setFollowMsg] = useState("");
  const [tab, setTab] = useState<(typeof CONTENT_TABS)[number]["key"]>("board");
  const [cardOpen, setCardOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const m = await fetchMe();
      setMe(m);
      if (!id) return;
      try {
        const r = await api<{ ok: boolean; user: UserPublic; items: ContentItem[] }>(
          `/api/users/${id}`,
        );
        setUser(r.user);
        setItems(r.items);
        if (m) {
          let amFollowing = false;
          try {
            const f = await api<{ ok: boolean; items: FollowItem[] }>(
              `/api/follows?user_id=${m.id}`,
            );
            amFollowing = f.items.some((x) => x.id === r.user.id);
            setFollowing(amFollowing);
          } catch {
            /* 关注状态查询失败不阻塞页面 */
          }
          try {
            const they = await api<{ ok: boolean; items: FollowItem[] }>(
              `/api/follows?user_id=${r.user.id}`,
            );
            setMutual(amFollowing && they.items.some((x) => x.id === m.id));
            setFollowees(they.items);
          } catch {
            setFollowees([]);
          }
        }
      } catch {
        setUser(null);
      }
    })();
  }, [id]);

  const toggleFollow = async () => {
    if (!me || !user) return;
    if (following && !window.confirm(`确定取消关注「${user.username}」吗？`)) return;
    setFollowBusy(true);
    setFollowMsg("");
    try {
      await api<{ ok: boolean }>("/api/follow", {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, action: following ? "unfollow" : "follow" }),
      });
      const next = !following;
      setFollowing(next);
      setUser((u) => (u ? { ...u, followers: u.followers + (next ? 1 : -1) } : u));
      setFollowMsg("");
    } catch (ex) {
      setFollowMsg(ex instanceof Error ? ex.message : "操作失败");
    } finally {
      setFollowBusy(false);
    }
  };

  if (id === 0 || user === undefined || me === undefined) return <div className="min-h-[60vh]" />;

  if (user === null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-serif text-2xl text-ink">用户不存在或已注销</p>
        <Link href="/community" className="mt-4 inline-block text-sm text-primary">
          ← 返回社区
        </Link>
      </div>
    );
  }

  const isSelf = me !== null && me.id === user.id;
  const activeTab = CONTENT_TABS.find((t) => t.key === tab) ?? CONTENT_TABS[0];
  const filtered =
    items === null
      ? null
      : items.filter((it) => activeTab.filter(it.type));

  const Avatar = ({ size = "h-10 w-10", name = "" }: { size?: string; name?: string }) =>
    user.avatar ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img loading="lazy" src={sitePath(user.avatar)} alt={user.username} className={`${size} shrink-0 rounded-full object-cover`} />
    ) : (
      <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-lg text-primary`}>
        {(name || user.username).slice(0, 1)}
      </span>
    );

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* 顶部：返回 */}
      <div className="flex items-center justify-between px-4 pb-2 pt-4 md:px-6">
        <Link href="/community" className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-primary">
          ← 返回
        </Link>
        <Link
          href="/search"
          aria-label="搜索"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep/70 text-muted transition-colors hover:bg-line/60 hover:text-primary"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.8-3.8" />
          </svg>
        </Link>
      </div>

      {/* 背景图（无边框） */}
      <div
        className="relative h-36 w-full md:h-44"
        style={
          user.bg_image
            ? { backgroundImage: `url(${sitePath(user.bg_image)})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        {!user.bg_image && <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-surface-warm to-surface" />}
      </div>

      {/* 头像 + 身份（Twitter 式下压） */}
      <div className="px-4 md:px-6">
        <div className="relative -mt-12 flex items-end justify-between">
          <Avatar size="h-24 w-24 md:h-28 md:w-28" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCardOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-gold/60 px-4 text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary"
            >
              <IconShare className="h-3.5 w-3.5" />
              分享
            </button>
            {isSelf ? (
              <Link
                href="/profile/edit"
                className="flex h-9 items-center rounded-full bg-primary px-4 text-xs font-medium text-paper transition-colors hover:bg-primary-deep"
              >
                编辑资料
              </Link>
            ) : !me ? (
              <Link
                href={`/login?next=${encodeURIComponent(`/u?id=${user.id}`)}`}
                className="flex h-9 items-center rounded-full bg-primary px-4 text-xs font-medium text-paper transition-colors hover:bg-primary-deep"
              >
                关注
              </Link>
            ) : (
              <button
                type="button"
                onClick={toggleFollow}
                disabled={followBusy}
                className={`flex h-9 items-center rounded-full px-4 text-xs font-medium transition-colors disabled:opacity-60 ${
                  following
                    ? "border border-gold/60 text-secondary-btn-text hover:border-danger/60 hover:text-danger"
                    : "bg-primary text-paper hover:bg-primary-deep"
                }`}
              >
                {followBusy ? "处理中…" : following ? "已关注" : "关注"}
              </button>
            )}
          </div>
        </div>

        {/* 名字（金色加粗）+ 等级 + 签名 */}
        <h1 className="mt-3 font-serif text-2xl font-bold leading-snug text-title-gold md:text-[26px]">
          {user.username}
        </h1>
        <div className="mt-1">
          <LevelBadge level={user.level} levelName={user.level_name} />
        </div>
        <p className="mt-2 font-serif text-sm text-body">
          {user.signature ? `「${user.signature}」` : "「无」"}
        </p>

        {/* 统计 */}
        <div className="mt-4 flex items-center gap-5 text-sm">
          <span className="text-body">
            <b className="font-mono text-ink">{user.following}</b>
            <span className="ml-1 text-muted">关注</span>
          </span>
          <span className="text-body">
            <b className="font-mono text-ink">{user.followers}</b>
            <span className="ml-1 text-muted">粉丝</span>
          </span>
          <span className="text-body">
            <b className="font-mono text-ink">{items?.length ?? 0}</b>
            <span className="ml-1 text-muted">内容</span>
          </span>
        </div>
        {followMsg && <p className="mt-2 text-xs text-muted">{followMsg}</p>}
        {mutual && !followBusy && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-me-soft px-2.5 py-0.5 font-serif text-[11px] text-me-deep">
            互相关注
          </span>
        )}
      </div>

      {/* 内容标签页：贴吧 / 动态（Twitter 式，带 icon，选中红色下划线） */}
      <div className="mt-5 flex border-b border-line-inner">
        {CONTENT_TABS.map((t) => {
          const on = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 py-3 font-serif text-[15px] transition-colors ${
                on ? "border-b-2 border-primary font-medium text-primary" : "text-muted hover:text-body"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 内容列表（无边框，Twitter 式） */}
      <div className="px-4 md:px-6">
        {filtered === null && <p className="py-8 text-center text-sm text-muted">加载中…</p>}
        {filtered !== null && filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            {tab === "board" ? "TA 还没有发布过贴吧内容" : "TA 还没有发过动态"}
          </p>
        )}
        {filtered !== null && filtered.length > 0 && (
          <div className="divide-y divide-line-inner/60">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/community/post/?id=${item.id}`}
                className="flex gap-3 py-5 transition-colors hover:bg-paper-deep/30"
              >
                <span className="mt-1 shrink-0">
                  <Avatar size="h-9 w-9" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="font-medium text-ink">{user.username}</span>
                    <span>· {formatTime(item.created_at)}</span>
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                      {typeLabel(item.type)}
                    </span>
                  </div>
                  {tab === "board" && item.title && (
                    <p className="mt-1.5 font-serif text-[16px] font-semibold leading-snug text-title-gold">
                      {item.title}
                    </p>
                  )}
                  {item.content && (
                    <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-body">{item.content}</p>
                  )}
                  {item.images && item.images.length > 0 && (
                    <div className={`mt-2 grid gap-1.5 ${item.images.length > 1 ? "grid-cols-2" : ""}`}>
                      {item.images.slice(0, 4).map((u) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={u}
                          loading="lazy"
                          src={sitePath(u)}
                          alt="配图"
                          className="w-full rounded-lg object-cover"
                          style={{ maxHeight: "60vh" }}
                        />
                      ))}
                    </div>
                  )}
                  {/* 操作 icon 条 */}
                  <div className="mt-2.5 flex items-center gap-5 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <IconHeart className="h-3.5 w-3.5" />
                      {item.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconMessage className="h-3.5 w-3.5" />
                      评论
                    </span>
                    {tab === "dynamic" ? (
                      <span className="flex items-center gap-1">
                        <IconRepost className="h-3.5 w-3.5" />
                        转发
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <IconShare className="h-3.5 w-3.5" />
                        分享
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 分享名片（可分享任意用户，二维码指向 TA 的个人空间） */}
      <ProfileShareCard
        data={
          cardOpen && user
            ? {
                username: user.username,
                avatar: user.avatar,
                signature: user.signature,
                level: user.level,
                levelName: user.level_name,
                profileUrl: typeof window !== "undefined" ? `${window.location.origin}${sitePath(`/u?id=${user.id}`)}` : sitePath(`/u?id=${user.id}`),
              }
            : null
        }
        onClose={() => setCardOpen(false)}
      />
    </div>
  );
}
