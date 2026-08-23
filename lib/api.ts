"use client";

/** 站点基础路径（桌面 /honglou-yuzhou，移动 /honglou-yuzhou/m）。
 * 任何 window.location / 服务端重定向都必须经 sitePath 加前缀，
 * 否则会跳到服务器根路径（被同机其他站点占用）。 */
export const siteBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function sitePath(p: string): string {
  return p.startsWith("/") ? `${siteBase}${p}` : p;
}

/** API 基础路径：与站点基础路径分离。
 * 移动版 basePath 是 /honglou-yuzhou/m，但 API 反代挂在 /honglou-yuzhou/api，
 * 所以去掉 /m 后缀；可用 NEXT_PUBLIC_API_BASE 显式覆盖。 */
const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? siteBase.replace(/\/m$/, "");

export function apiPath(p: string): string {
  return p.startsWith("/") ? `${apiBase}${p}` : p;
}

export interface Me {
  id: number;
  username: string;
  role: "user" | "admin";
  avatar: string | null;
  signature: string | null;
  bg_image: string | null;
  created_at: number;
  /* 第二阶段：成长体系 */
  points?: number;
  level?: number;
  level_name?: string;
  followers?: number;
  following?: number;
  last_checkin?: string | null;
}

export interface PostQuote {
  question_title?: string;
  viewpoint_title?: string;
  source?: string;
  summary?: string;
}

export interface PostSummary {
  id: number;
  title: string;
  content: string;
  tag: string;
  images: string[];
  status: string;
  like_count: number;
  view_count: number;
  question_id: string | null;
  quote: PostQuote | null;
  author: { id: number; username: string };
  created_at: number;
}

export interface CommentItem {
  id: number;
  content: string;
  reply_to: number | null;
  floor: number;
  like_count: number;
  liked?: boolean;
  author: { id: number; username: string };
  created_at: number;
}

export interface NotificationItem {
  id: number;
  type: string;
  from: { id: number; username: string } | null;
  post_id: number | null;
  comment_id: number | null;
  question_id: string | null;
  title: string;
  body: string;
  read: boolean;
  created_at: number;
}

export interface TestStatType {
  archetype_id: string;
  character_id: string;
  c: number;
}

export interface TestStats {
  total: number;
  byType: TestStatType[];
}

/* ===== 第二阶段：成长体系 / 关注 响应类型 ===== */

/** 积分明细一条（GET /api/points 的 logs） */
export interface PointsLog {
  id: number;
  delta: number;
  reason: string;
  ref: string | null;
  created_at: number;
}

/** GET /api/points 响应 */
export interface PointsResp {
  ok: boolean;
  points: number;
  level: number;
  level_name: string;
  logs: PointsLog[];
}

/** 关注列表项（GET /api/follows） */
export interface FollowItem {
  id: number;
  username: string;
  avatar: string | null;
  points: number;
}

/** 用户公开主页的用户信息（GET /api/users/:id 的 user） */
export interface UserPublic {
  id: number;
  username: string;
  avatar: string | null;
  signature: string | null;
  bg_image: string | null;
  points: number;
  level: number;
  level_name: string;
  followers: number;
  following: number;
  created_at: number;
}

/** 用户公开主页 / 关注流中的内容条目（含 type） */
export interface ContentItem {
  id: number;
  title: string;
  content: string;
  type: string;
  like_count: number;
  view_count?: number;
  created_at: number;
}

/** 混合流条目（GET /api/feed，tab=hot|new|following） */
export interface FeedItem {
  id: number;
  title: string;
  content: string;
  tag: string;
  type: string;
  topic_id: number | null;
  like_count: number;
  view_count: number;
  created_at: number;
  author: { id: number; username: string; avatar: string | null; points?: number };
}

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiPath(path), {
    credentials: "same-origin",
    headers: init?.body instanceof FormData || init?.body instanceof Blob ? undefined : { "Content-Type": "application/json", ...(init?.headers as Record<string, string> | undefined) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { msg?: string }).msg || `请求失败(${res.status})`);
  return data as T;
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  return api<T>(path);
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return api<T>(path, { method: "POST", body: JSON.stringify(body) });
}

/** 登录状态（客户端一次性获取，页面按需调用） */
export async function fetchMe(): Promise<Me | null> {
  try {
    const r = await api<{ user: Me | null }>("/api/me");
    return r.user;
  } catch {
    return null;
  }
}
