/** 构建期辅助（仅供服务端 page.tsx 使用，勿在客户端组件中 import）。
 *  静态导出（output:"export"）要求动态路由提供 generateStaticParams。
 *  话题 id 来自后端数据库：构建时优先请求本机开发 API（api-server 常用 PORT=4114），
 *  失败则回退到 api-server.js 首次启动时预置的种子话题 id（poem_topic 1-4 / fill 5-7 / feihua 8-10）。 */
const SEED_TOPIC_IDS: Record<string, number[]> = {
  poem_topic: [1, 2, 3, 4],
  fill: [5, 6, 7],
  feihua: [8, 9, 10],
};

export async function poemTopicStaticParams(kind: string): Promise<{ id: string }[]> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1500);
    try {
      const r = await fetch(`http://127.0.0.1:4114/api/topics?kind=${kind}`, {
        signal: ctrl.signal,
      });
      const data = await r.json().catch(() => null);
      if (data && data.ok && Array.isArray(data.items) && data.items.length > 0) {
        return data.items.map((t: { id: number }) => ({ id: String(t.id) }));
      }
    } finally {
      clearTimeout(timer);
    }
  } catch {
    /* 本机 API 不可用 → 回退种子 id */
  }
  return (SEED_TOPIC_IDS[kind] ?? []).map((id) => ({ id: String(id) }));
}
