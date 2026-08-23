/* 红楼社 · Service Worker
 * 策略：静态资源与同源导航采用 stale-while-revalidate（缓存优先，后台刷新），
 * API 请求一律走网络，不缓存登录态与动态数据。
 * basePath 无关：缓存键使用 request.url，作用域自动取 SW 所在目录（桌面 /honglou-yuzhou/，移动 /honglou-yuzhou/m/）。
 */
const CACHE_NAME = "hlm-shell-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  // 仅处理同源请求
  if (url.origin !== self.location.origin) return;
  // API 动态数据不缓存
  if (url.pathname.includes("/api/")) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
