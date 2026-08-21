"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";
import { formatTime } from "@/lib/client-community";
import {
  DIFFICULTY_LABEL,
  POEM_TAG,
  type PostDetailData,
  type TopicInfo,
  type TopicKind,
  type TopicWork,
} from "@/lib/poem-society";
import PoemSocietyNav from "@/components/poem-society/poem-society-nav";
import ExpandableComments from "@/components/poem-society/expandable-comments";
import PoemShareModal, { type PoemShareData } from "@/components/poem-society/poem-share-modal";

const KIND_LABEL: Record<TopicKind, string> = {
  poem_topic: "诗题",
  fill: "填字",
  feihua: "飞花",
};

function AuthorAvatar({
  username,
  avatar,
  className = "h-9 w-9 text-sm",
}: {
  username: string;
  avatar: string | null;
  className?: string;
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-gradient-to-b from-surface-warm to-paper-deep shadow-card ${className}`}
    >
      <span className="font-serif text-secondary-btn-text">{username.charAt(0)}</span>
      {avatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sitePath(avatar)}
          alt={username}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </span>
  );
}

/** 话题详情（诗题/填字/飞花共用）：横幅 + 发帖框 + 作品流 + 评论就地展开与 @诗评 */
export default function TopicDetail({
  id,
  kind,
}: {
  id: number;
  kind: TopicKind;
}) {
  const pathname = usePathname();
  const loginNext = pathname || "/poem-society";
  const loginHref = `/login?next=${encodeURIComponent(loginNext)}`;

  const [me, setMe] = useState<Me | null>(null);
  const [topic, setTopic] = useState<TopicInfo | null | undefined>(undefined);
  const [works, setWorks] = useState<TopicWork[]>([]);
  const [loadErr, setLoadErr] = useState("");

  /* v6 交互：评论就地展开，按需请求详情 */
  const [details, setDetails] = useState<Record<number, PostDetailData>>({});
  const [openComments, setOpenComments] = useState<Set<number>>(new Set());
  const [expanding, setExpanding] = useState<Set<number>>(new Set());

  const [workLikes, setWorkLikes] = useState<Record<number, { count: number; liked: boolean }>>({});
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [shareData, setShareData] = useState<PoemShareData | null>(null);

  /* 填字/飞花的内联发帖框 */
  const [answer, setAnswer] = useState("");
  const [answerBusy, setAnswerBusy] = useState(false);
  const [composeNotice, setComposeNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const showNotice = (ok: boolean, text: string) => {
    setNotice({ ok, text });
    setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await api<{ topic: TopicInfo; items: TopicWork[] }>(`/api/topics/${id}`);
        setTopic(r.topic);
        setWorks([...r.items].sort((a, b) => b.like_count - a.like_count || a.created_at - b.created_at));
        setLoadErr("");
      } catch (ex) {
        setTopic(null);
        setLoadErr(ex instanceof Error ? ex.message : "话题加载失败");
      }
    })();
  }, [id]);

  const refreshDetail = useCallback(async (postId: number) => {
    try {
      const r = await api<PostDetailData>(`/api/posts/${postId}`);
      setDetails((prev) => ({ ...prev, [postId]: r }));
    } catch {
      /* 保留旧数据 */
    }
  }, []);

  const toggleComments = async (w: TopicWork) => {
    if (openComments.has(w.id)) {
      setOpenComments((s) => {
        const n = new Set(s);
        n.delete(w.id);
        return n;
      });
      return;
    }
    if (!details[w.id]) {
      setExpanding((s) => new Set(s).add(w.id));
      try {
        const r = await api<PostDetailData>(`/api/posts/${w.id}`);
        setDetails((prev) => ({ ...prev, [w.id]: r }));
        setOpenComments((s) => new Set(s).add(w.id));
      } catch (ex) {
        showNotice(false, ex instanceof Error ? ex.message : "评论加载失败");
      } finally {
        setExpanding((s) => {
          const n = new Set(s);
          n.delete(w.id);
          return n;
        });
      }
    } else {
      setOpenComments((s) => new Set(s).add(w.id));
    }
  };

  const toggleLike = async (w: TopicWork) => {
    if (!me) {
      showNotice(false, "请先登录后再点赞");
      return;
    }
    try {
      const r = await api<{ liked: boolean }>(`/api/posts/${w.id}/like`, { method: "POST" });
      setWorkLikes((prev) => ({
        ...prev,
        [w.id]: {
          count: (prev[w.id]?.count ?? w.like_count) + (r.liked ? 1 : -1),
          liked: r.liked,
        },
      }));
    } catch (ex) {
      showNotice(false, ex instanceof Error ? ex.message : "点赞失败");
    }
  };

  const shareWork = (w: TopicWork) => {
    const d = details[w.id];
    setShareData({
      title: w.title || w.content.split("\n")[0].slice(0, 24),
      content: w.content,
      author: w.author.username,
      likeCount: workLikes[w.id]?.count ?? w.like_count,
      topicTitle: topic ? `#${topic.title}#` : "海棠诗社",
      comments: d?.comments ?? [],
      reviews: d?.reviews ?? [],
    });
  };

  const goCompose = () => {
    if (!me) {
      setComposeNotice({ ok: false, text: "请先登录后再参与诗题" });
      return;
    }
    window.location.assign(sitePath(`/poem-society/compose?topic=${id}`));
  };

  const submitAnswer = async () => {
    setComposeNotice(null);
    if (!me) {
      setComposeNotice({ ok: false, text: "请先登录后再参与" });
      return;
    }
    if (!answer.trim()) {
      setComposeNotice({ ok: false, text: "请先写下你的答案" });
      return;
    }
    setAnswerBusy(true);
    try {
      await api<{ id: number }>("/api/posts", {
        method: "POST",
        body: JSON.stringify({ title: "", content: answer.trim(), tag: POEM_TAG, type: "answer", topic_id: id }),
      });
      setAnswer("");
      setComposeNotice({ ok: true, text: "已发布，自动审核通过后展示" });
      const r = await api<{ topic: TopicInfo; items: TopicWork[] }>(`/api/topics/${id}`);
      setWorks([...r.items].sort((a, b) => b.like_count - a.like_count || a.created_at - b.created_at));
    } catch (ex) {
      setComposeNotice({ ok: false, text: ex instanceof Error ? ex.message : "发布失败" });
    } finally {
      setAnswerBusy(false);
    }
  };

  if (topic === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-14">
        <PoemSocietyNav />
        <div className="mt-6 space-y-4">
          <div className="h-44 animate-pulse rounded-3xl bg-paper-deep/60" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-paper-deep/60" />
          ))}
        </div>
      </div>
    );
  }

  if (topic === null) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-14">
        <PoemSocietyNav />
        <div className="mt-10 rounded-3xl border border-dashed border-gold/50 bg-surface-warm p-12 text-center">
          <p className="font-serif text-xl text-ink">{loadErr || "话题不存在或已下架"}</p>
          <Link href="/poem-society" className="mt-4 inline-block text-sm text-primary">
            ← 返回诗题列表
          </Link>
        </div>
      </div>
    );
  }

  const difficultyLabel = DIFFICULTY_LABEL[topic.difficulty] || topic.difficulty;
  const current = topic.is_current === 1 && kind === "poem_topic";

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <PoemSocietyNav />

      {/* 话题横幅 */}
      <section className="card-print card-print--questions mt-6 rounded-3xl bg-surface p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">{KIND_LABEL[kind]}</span>
          <span className="rounded-full bg-paper-deep px-2.5 py-0.5">{difficultyLabel}</span>
          {current && (
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 font-medium text-gold">当期诗题 · 参与双倍积分</span>
          )}
        </div>
        <h1 className="mt-4 font-serif text-3xl font-semibold leading-snug text-ink md:text-4xl">
          #{topic.title}#
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">{topic.content}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
          <span>
            已有 <span className="font-serif text-sm font-semibold text-primary">{topic.join_count}</span> 人参与
          </span>
          {topic.theme && <span>主题 · {topic.theme}</span>}
          <span>长期开放</span>
        </div>
      </section>

      {/* 发帖框 */}
      <section className="mt-5 rounded-2xl bg-paper-deep/50 p-4">
        {kind === "poem_topic" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-serif text-[15px] text-ink">写一首诗参与「{topic.title}」——体裁不限，格律不限。</p>
            <div className="flex items-center gap-2">
              {composeNotice && (
                <span className={`text-xs ${composeNotice.ok ? "text-green-700" : "text-red-700"}`}>
                  {composeNotice.text}
                </span>
              )}
              <button
                type="button"
                onClick={goCompose}
                className="rounded-full bg-primary px-5 py-2 font-serif text-sm text-paper transition-colors hover:bg-primary-deep"
              >
                ✍ 写诗参与
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-muted">
              {kind === "fill" ? "把原句抄一遍、填上你的字，以评论参与" : "接下句：把原句抄一遍，写下你的接句"}
            </p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder={kind === "fill" ? "例：清风入客梦，素月照归舟…" : "写下你的下句…"}
              className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 font-serif text-[15px] leading-loose text-ink outline-none placeholder:text-muted/70 focus:border-gold"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={answerBusy}
                onClick={submitAnswer}
                className="rounded-full bg-primary px-5 py-2 font-serif text-xs text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
              >
                {answerBusy ? "发布中…" : "发布"}
              </button>
              {composeNotice && (
                <span className={`text-xs ${composeNotice.ok ? "text-green-700" : "text-red-700"}`}>
                  {composeNotice.text}
                </span>
              )}
              {!me && (
                <Link href={loginHref} className="text-xs text-primary underline decoration-dotted underline-offset-2">
                  请先登录
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {notice && (
        <p className={`mt-3 text-xs ${notice.ok ? "text-green-700" : "text-red-700"}`}>{notice.text}</p>
      )}

      {/* 作品流 */}
      <section className="mt-8">
        <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          作品 · {works.length}
        </h2>

        {works.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-gold/50 bg-surface-warm p-12 text-center">
            <p className="font-serif text-lg text-secondary-btn-text">还没有作品，来做第一个参与的人</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {works.map((w) => {
              const lk = workLikes[w.id];
              const likeCount = lk?.count ?? w.like_count;
              const liked = lk?.liked ?? false;
              const cmtCount = details[w.id]?.comments.length;
              const open = openComments.has(w.id);
              return (
                <article key={w.id} className="rounded-2xl bg-surface p-5 shadow-card md:p-6">
                  <div className="flex items-center gap-3">
                    <AuthorAvatar username={w.author.username} avatar={w.author.avatar} />
                    <div>
                      <p className="font-serif text-sm font-semibold text-ink">{w.author.username}</p>
                      <p className="text-xs text-muted">{formatTime(w.created_at)}</p>
                    </div>
                  </div>
                  {w.title && <h3 className="mt-3 font-serif text-lg font-semibold text-ink">{w.title}</h3>}
                  <p className="mt-2 whitespace-pre-line font-serif text-[15px] leading-loose text-ink/90">
                    {w.content}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-line/50 pt-3 text-xs text-muted">
                    <button
                      type="button"
                      onClick={() => toggleLike(w)}
                      className={`transition-colors ${liked ? "text-primary" : "hover:text-primary"}`}
                    >
                      {liked ? "♥ 已赞" : "♡ 赞"} {likeCount}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleComments(w)}
                      className={`transition-colors ${open ? "text-primary" : "hover:text-primary"}`}
                    >
                      💬 评论{cmtCount !== undefined ? ` ${cmtCount}` : ""}
                    </button>
                    <button type="button" onClick={() => shareWork(w)} className="transition-colors hover:text-primary">
                      分享
                    </button>
                  </div>

                  {open && expanding.has(w.id) && (
                    <div className="mt-3 ml-0 h-24 animate-pulse rounded-xl bg-paper-deep/60 md:ml-6" />
                  )}
                  {open && details[w.id] && (
                    <ExpandableComments
                      postId={w.id}
                      data={details[w.id]}
                      me={me}
                      loginNext={loginNext}
                      onRefresh={refreshDetail}
                    />
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <PoemShareModal data={shareData} onClose={() => setShareData(null)} />
    </div>
  );
}
