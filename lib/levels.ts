/**
 * 成长体系工具：等级阈值 / 进度 / 积分原因中文映射（纯函数，无依赖）。
 * 阈值与 server/api-server.js 的 LEVEL_THRESHOLDS / LEVEL_NAMES 保持一致。
 */

export const LEVEL_THRESHOLDS = [0, 200, 600, 1500];
export const LEVEL_NAMES = ["懵懂", "试才", "通灵", "元老"];

export function levelOf(points: number): number {
  let lv = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) lv = i + 1;
  }
  return lv;
}

/** 距下一级还差多少分；已满级返回 0 */
export function remainToNext(points: number, level?: number): number {
  const lv = level ?? levelOf(points);
  const next = LEVEL_THRESHOLDS[lv];
  if (next === undefined) return 0;
  return Math.max(0, next - points);
}

/** 进度条（0-100）：当前等级段内的完成度；满级返回 100 */
export function levelProgressPct(points: number, level?: number): number {
  const lv = level ?? levelOf(points);
  const cur = LEVEL_THRESHOLDS[lv - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[lv];
  if (next === undefined) return 100;
  const total = next - cur;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round(((points - cur) / total) * 100)));
}

/** 下一级的名称；满级返回 null */
export function nextLevelName(level: number): string | null {
  return LEVEL_NAMES[level] ?? null;
}

/** 积分原因 → 中文名 */
const REASON_LABELS: Record<string, string> = {
  post: "发帖",
  comment: "评论",
  like: "被点赞",
  checkin: "签到",
};

export function reasonLabel(reason: string): string {
  return REASON_LABELS[reason] ?? (reason === "" ? "其他" : reason);
}

/** 积分规则（展示用） */
export const POINTS_RULES: { action: string; delta: number }[] = [
  { action: "发帖 / 发动态", delta: 10 },
  { action: "评论", delta: 3 },
  { action: "内容被点赞", delta: 2 },
  { action: "每日签到", delta: 5 },
];

/** 内容 type → 展示标签 */
export function typeLabel(type: string): string {
  switch (type) {
    case "dynamic":
      return "动态";
    case "longform":
      return "长文";
    case "poem":
      return "作品 · 诗";
    case "answer":
      return "作品 · 问答";
    default:
      return "帖子";
  }
}

/** 本地时区的今天日期串（YYYY-MM-DD），与后端 dayOf 一致，用于判断是否已签到 */
export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
