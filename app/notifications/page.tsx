"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { Me, NotificationItem } from "@/lib/api";
import { formatTime } from "@/lib/client-community";

export default function NotificationsPage() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [list, setList] = useState<NotificationItem[] | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async (p: number) => {
    try {
      const r = await api<{ notifications: NotificationItem[]; unread: number }>(
        `/api/notifications?page=${p}`,
      );
      setList((prev) => (p === 1 ? r.notifications : [...(prev ?? []), ...r.notifications]));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "加载失败");
      setList([]);
    }
  }, []);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  useEffect(() => {
    (async () => {
      if (me) await load(1);
    })();
  }, [me, load]);

  const markAllRead = async () => {
    try {
      await api("/api/notifications/read", { method: "POST", body: JSON.stringify({ all: true }) });
      setList((ls) => (ls ? ls.map((n) => ({ ...n, read: true })) : ls));
    } catch {
      /* 忽略 */
    }
  };

  const openNotification = async (n: NotificationItem) => {
    if (!n.read) {
      try {
        await api("/api/notifications/read", { method: "POST", body: JSON.stringify({ id: n.id }) });
        setList((ls) => (ls ? ls.map((x) => (x.id === n.id ? { ...x, read: true } : x)) : ls));
      } catch {
        /* 忽略 */
      }
    }
    if (n.post_id) {
      window.location.assign(sitePath(`/community/post/?id=${n.post_id}`));
    }
  };

  if (me === undefined) return <div className="min-h-[50vh]" />;

  if (me === null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-serif text-2xl text-ink">登录后查看通知</p>
        <Link href="/login" className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 font-serif text-sm text-paper">
          去登录
        </Link>
      </div>
    );
  }

  const typeLabel: Record<string, string> = {
    new_post: "新讨论",
    reply_post: "评论了你的帖子",
    reply_comment: "回复了你的楼层",
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-gold">NOTIFICATIONS</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">通知</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-body">
            有人在你的讨论下盖楼、评论或回复了你的楼层，都会在这里收到提醒。
          </p>
        </div>
        {list && list.some((n) => !n.read) && (
          <button
            type="button"
            onClick={markAllRead}
            className="rounded-full bg-paper-deep px-4 py-2 text-xs text-secondary-btn-text transition-colors hover:text-primary"
          >
            全部已读
          </button>
        )}
      </header>

      <div className="mt-8 space-y-3">
        {err && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{err}</p>}
        {!list && <p className="rounded-2xl bg-surface p-6 text-center text-sm text-muted">加载通知中…</p>}
        {list && list.length === 0 && (
          <p className="rounded-2xl bg-surface p-10 text-center">
            <p className="font-serif text-lg text-secondary-btn-text">还没有通知</p>
            <p className="mt-1 text-xs text-muted">去讨论区发起讨论或回复他人，互动消息会显示在这里。</p>
          </p>
        )}
        {list?.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => openNotification(n)}
            className={`block w-full rounded-2xl p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover ${
              n.read ? "bg-surface" : "bg-surface-warm ring-1 ring-gold/40"
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                {typeLabel[n.type] ?? "通知"}
              </span>
              <span>{n.from ? n.from.username : "系统"}</span>
              <span>·</span>
              <span>{formatTime(n.created_at)}</span>
              {!n.read && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
            </div>
            <p className="mt-2 font-serif text-[15px] font-semibold text-ink">{n.title}</p>
            {n.body && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{n.body}</p>}
          </button>
        ))}
      </div>

      {list && list.length > 0 && list.length >= 20 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => load((list?.length ?? 20) / 20 + 1)}
            className="rounded-full bg-paper-deep px-5 py-2 text-sm text-body"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
}
