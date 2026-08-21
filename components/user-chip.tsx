"use client";

import Link from "next/link";
import { sitePath } from "@/lib/api";
import LevelBadge from "@/components/level-badge";

/** 用户信息小条：头像 + 用户名 + 等级徽章（可选积分）。
 * 供个人空间 / 用户主页等需要展示"谁 + 什么等级"的地方使用。
 * 传入 href 时整条可点击（跳转用户主页，路径自动带站点前缀）。 */
export default function UserChip({
  username,
  avatar,
  level,
  levelName,
  points,
  href,
  showPoints = false,
  className = "",
}: {
  id: number;
  username: string;
  avatar?: string | null;
  level?: number;
  levelName?: string;
  points?: number;
  /** 点击跳转的用户主页地址（裸路径，内部用 sitePath 加前缀） */
  href?: string;
  showPoints?: boolean;
  className?: string;
}) {
  const body = (
    <>
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sitePath(avatar)}
          alt={username}
          className="h-5 w-5 shrink-0 rounded-full border border-gold/40 object-cover"
        />
      ) : (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-[11px] text-primary">
          {username.charAt(0)}
        </span>
      )}
      <span className="max-w-[120px] truncate font-serif text-[13px] font-semibold text-ink transition-colors group-hover:text-primary">
        {username}
      </span>
      {(level !== undefined || levelName) && <LevelBadge level={level} levelName={levelName} />}
      {showPoints && typeof points === "number" && (
        <span className="shrink-0 text-[11px] text-muted">{points} 分</span>
      )}
    </>
  );

  const cls = `group inline-flex max-w-full items-center gap-1.5 ${className}`;

  if (href) {
    return (
      <Link href={sitePath(href)} className={cls} title={`查看 ${username} 的主页`}>
        {body}
      </Link>
    );
  }
  return <span className={cls}>{body}</span>;
}
