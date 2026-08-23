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
import { IconShare } from "@/components/icons";

const TABS = [
  { key: "all", label: "全部" },
  { key: "post", label: "讨论" },
  { key: "dynamic", label: "动态" },
  { key: "longform", label: "长文" },
  { key: "poem", label: "诗作" },
  { key: "answer", label: "接句" },
] as const;

/** 用户公开主页（/u?id=）：任何人可访问，展示用户信息 + TA 的内容 */
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
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
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
            setFollowees(they.items);
            setMutual(amFollowing && they.items.some((x) => x.id === m.id));
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
      setFollowMsg(""); // 按钮状态已体现「已关注/＋关注」，不再重复弹字
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
  const filtered =
    items === null
      ? null
      : tab === "all"
        ? items
        : items.filter((it) => it.type === tab);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link href="/community" className="text-xs text-muted transition-colors hover:text-primary">
        ← 返回社区
      </Link>

      {/* Hero：封面 + 身份（一张连续卡片，Twitter 式） */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-line/60 bg-surface shadow-card">
        {/* 封面（有背景图显示图，无则默认渐变 + 水印） */}
        <div
          className="relative h-40 md:h-44"
          style={
            user.bg_image
              ? { backgroundImage: `url(${sitePath(user.bg_image)})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!user.bg_image && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface-warm to-surface" />
              <div className="card-print card-print--identity absolute inset-0 opacity-40" />
            </>
          )}
          <p className="absolute bottom-3 right-5 text-[10px] tracking-[0.3em] text-white/70 drop-shadow">一梦红楼 · 同好空间</p>
        </div>

        {/* 身份区（头像下压） */}
        <div className="px-5 pb-6 md:px-6">
          <div className="flex flex-wrap items-end gap-4">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" src={sitePath(user.avatar)}
                alt={user.username}
                className="relative z-10 -mt-12 h-24 w-24 rounded-full border-4 border-surface object-cover ring-1 ring-gold/50 shadow-card md:-mt-14 md:h-28 md:w-28"
              />
            ) : (
              <span className="relative z-10 -mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface bg-primary/10 font-serif text-4xl text-primary ring-1 ring-gold/50 shadow-card md:-mt-14 md:h-28 md:w-28">
                {user.username.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="min-w-0 truncate font-serif text-2xl font-semibold text-ink md:text-[26px]">
                  {user.username}
                </h1>
                {isSelf && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-serif text-[11px] text-primary">
                    这是我自己
                  </span>
                )}
              </div>
              <LevelBadge level={user.level} levelName={user.level_name} />
              <p className="mt-2 font-serif text-[13px] text-gold">
                {user.signature ? `「${user.signature}」` : "「无」"}
              </p>
              {/* 关注 + 分享（与个人中心一致；分享可分享任意用户） */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {isSelf ? (
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs text-paper transition-colors hover:bg-primary-deep"
                  >
                    编辑资料
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={toggleFollow}
                    disabled={followBusy}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-gold/60 px-3.5 py-1.5 text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary disabled:opacity-60 ${
                      following ? "border-gold/60" : ""
                    }`}
                  >
                    {followBusy ? "处理中…" : following ? "已关注" : "＋ 关注"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCardOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 px-3.5 py-1.5 text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary"
                >
                  <IconShare className="h-3.5 w-3.5" />
                  分享
                </button>
              </div>
              {mutual && !followBusy && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-me-soft px-2.5 py-0.5 font-serif text-[11px] text-me-deep">
                  互相关注
                </span>
              )}
              {followMsg && <p className="mt-2 text-xs text-muted">{followMsg}</p>}
            </div>
            {!me && (
              <div className="shrink-0">
                <Link
                  href={`/login?next=${encodeURIComponent(`/u?id=${user.id}`)}`}
                  className="inline-block rounded-full bg-primary px-6 py-2.5 font-serif text-sm text-paper transition-colors hover:bg-primary-deep"
                >
                  登录后关注
                </Link>
              </div>
            )}
          </div>

          {/* 数据条：关注 / 粉丝 / 内容 */}
          <div className="mt-5 flex items-center divide-x divide-line/70 border-t border-line-inner/70 pt-4 text-center">
            {[
              { label: "关注", value: user.following },
              { label: "粉丝", value: user.followers },
              { label: "内容", value: items?.length ?? 0 },
            ].map((s) => (
              <div key={s.label} className="flex-1">
                <p className="font-mono text-xl text-ink">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* TA 关注的人头像条 */}
          {followees !== null && followees.length > 0 && (
            <div className="mt-4 flex items-center gap-3 border-t border-line-inner/70 pt-4">
              <div className="flex -space-x-2">
                {followees.slice(0, 8).map((f) => (
                  <Link key={f.id} href={`/u?id=${f.id}`} className="group">
                    {f.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img loading="lazy" src={sitePath(f.avatar)}
                        alt={f.username}
                        className="h-8 w-8 rounded-full border-2 border-surface object-cover ring-1 ring-gold/40 transition-transform group-hover:-translate-y-0.5"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-primary/10 font-serif text-[11px] text-primary transition-transform group-hover:-translate-y-0.5">
                        {f.username.charAt(0)}
                      </span>
                    )}
                  </Link>
                ))}
                {user.following > 8 && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-paper-deep font-mono text-[10px] text-muted">
                    +{user.following - 8}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted">TA 关注的人 · {user.following}</span>
            </div>
          )}
        </div>
      </div>

      {/* 内容列表（tab 过滤） */}
      <section className="mt-6 rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="flex items-center gap-3 font-serif text-lg font-semibold text-ink">
            <span className="h-4 w-1 rounded-full bg-primary" />
            {user.username} 的内容
          </h2>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  tab === t.key ? "bg-primary text-paper" : "bg-paper-deep text-muted hover:bg-line/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {filtered === null && <p className="mt-4 text-sm text-muted">加载中…</p>}
        {filtered !== null && filtered.length === 0 && (
          <p className="mt-4 rounded-2xl bg-paper-deep/60 p-6 text-center text-sm text-muted">
            {tab === "all" ? "TA 还没有发布过内容" : "这个分类下暂无内容"}
          </p>
        )}
        {filtered !== null && filtered.length > 0 && (
          <div className="mt-4 space-y-3">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/community/post/?id=${item.id}`}
                className="block rounded-2xl bg-paper-deep/60 p-4 transition-all hover:bg-line/40"
              >
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                    {typeLabel(item.type)}
                  </span>
                  <span>{formatTime(item.created_at)}</span>
                  <span className="ml-auto">赞 {item.like_count}</span>
                </div>
                <p className="mt-1.5 truncate font-serif text-[15px] font-semibold text-ink">
                  {item.title || "（无标题）"}
                </p>
                {item.content && (
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-body">
                    {item.content}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

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
