/** 海棠诗社模块：共享类型与客户端工具（仅供 "use client" 组件使用） */

import type { CommentItem } from "@/lib/api";

export type TopicKind = "poem_topic" | "fill" | "feihua";

/** GET /api/topics 列表项 */
export interface TopicInfo {
  id: number;
  kind: TopicKind;
  title: string;
  content: string;
  theme: string | null;
  difficulty: string;
  is_current: number;
  like_count: number;
  created_at: number;
  join_count: number;
}

/** GET /api/topics/:id 下的话题作品/答案 */
export interface TopicWork {
  id: number;
  title: string;
  content: string;
  type: string;
  like_count: number;
  created_at: number;
  author: { id: number; username: string; avatar: string | null };
}

/** AI 诗评（GET /api/posts/:id 的 reviews / POST /api/ai/review 返回） */
export interface AiReview {
  id: number;
  post_id: number;
  trigger_user_id: number;
  content: string;
  created_at: number;
  trigger_name?: string;
}

/** GET /api/posts/:id 完整详情（评论就地展开时按需请求） */
export interface PostDetailData {
  post: {
    id: number;
    title: string;
    content: string;
    like_count: number;
    created_at: number;
    author: { id: number; username: string };
  };
  comments: CommentItem[];
  liked: boolean;
  reviews: AiReview[];
}

/** 难度中文名 */
export const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "初级",
  intermediate: "中级",
  advanced: "高级",
};

export const DIFFICULTY_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "beginner", label: "初级" },
  { value: "intermediate", label: "中级" },
  { value: "advanced", label: "高级" },
];

/** 诗社帖子的 tag（社区流里统一归类） */
export const POEM_TAG = "诗词";

/** 今日新题判定：创建时间距今 < 2 天 */
export function isNewTopic(createdAt: number): boolean {
  return Date.now() - createdAt < 2 * 24 * 3600_000;
}

/** 清洗后端生成的 AI 诗评文本（后端 hashOf 偶发负索引导致 "undefined。" 前缀，存库后需前端兜底） */
export function cleanReview(text: string): string {
  return text.replace(/^undefined[。，、]?/, "").trim();
}

export interface CommentNode extends CommentItem {
  children: CommentNode[];
}

/** 按 reply_to 组装楼中楼，根节点与子节点均按赞数降序（其次按时间升序） */
export function buildCommentTree(comments: CommentItem[]): CommentNode[] {
  const byId = new Map<number, CommentNode>();
  for (const c of comments) byId.set(c.id, { ...c, children: [] });
  const roots: CommentNode[] = [];
  for (const c of comments) {
    const node = byId.get(c.id)!;
    const parent = c.reply_to ? byId.get(c.reply_to) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sortNode = (a: CommentNode, b: CommentNode) =>
    b.like_count - a.like_count || a.created_at - b.created_at;
  const walk = (nodes: CommentNode[]) => {
    nodes.sort(sortNode);
    for (const n of nodes) walk(n.children);
  };
  walk(roots);
  return roots;
}
