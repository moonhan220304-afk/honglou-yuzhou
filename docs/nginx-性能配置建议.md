# Nginx 性能配置建议（移动端 / 桌面端通用）

> 用途：给 ECS（`39.106.144.168`）上的 nginx 补充静态资源压缩与缓存策略，缓解移动端首屏 JS ~3.4MB（未压缩）与图片 40MB 的带宽压力。
> 状态：本文件仅作**配置建议**，实际 nginx 配置在服务器上，不在本仓库内；上线前需由运维在 ECS 上应用并 `nginx -t && nginx -s reload`。

## 一、问题背景

- 静态产物 `out/`、`out-mobile/` 经 rsync 直接放到 nginx 静态目录，前端 JS chunk 未压缩时首屏约 3.4MB。
- 未确认 nginx 是否开启 gzip/brotli 与 `/_next/static` 长缓存，导致移动端 4G 下首屏可达数秒。

## 二、推荐配置（追加到该站点的 server 块）

```nginx
# 1) gzip 压缩（兜底，兼容所有客户端）
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain text/css text/xml text/javascript
    application/javascript application/json application/xml
    application/x-javascript image/svg+xml;

# 2) 静态资源长缓存：/_next/static 文件名带内容 hash，可永久缓存
location /honglou-yuzhou/_next/static/ {
    alias /srv/honglou-yuzhou/_next/static/;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
}
# 移动版产物路径
location /honglou-yuzhou/m/_next/static/ {
    alias /srv/honglou-yuzhou/mobile/_next/static/;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
}

# 3) 图片等媒体：长缓存 + 弱压缩
location ~* \.(?:jpg|jpeg|png|webp|gif|svg|ico|woff2?)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
    access_log off;
}
```

> 说明：以上 `alias` 路径需与实际 rsync 目标（`/srv/honglou-yuzhou` 与 `/srv/honglou-yuzhou/mobile`）一致，如有差异以 `scripts/deploy-ecs.sh` / `scripts/deploy-ecs-mobile.sh` 的 `REMOTE_DIR` 为准。

## 三、可选进阶

- **brotli**：若 nginx 已编入 `ngx_brotli` 模块，可再加 `brotli on; brotli_comp_level 6; brotli_types ...`（比 gzip 更省 ~15-20%）。
- **HTTP/2**：`listen 443 ssl http2;`（配合 HTTPS，多路复用显著提升 chunk 加载）。
- **PWA service worker**：`sw.js` 不要长缓存（`Cache-Control: no-cache` 或 `max-age=0`），保证更新及时：

```nginx
location = /honglou-yuzhou/sw.js { add_header Cache-Control "no-cache"; }
location = /honglou-yuzhou/m/sw.js { add_header Cache-Control "no-cache"; }
```

## 四、验证

应用后可用 curl 校验响应头：

```bash
curl -I http://39.106.144.168/honglou-yuzhou/m/_next/static/chunks/000fl582st6uf.js
# 期望：Cache-Control: public, max-age=31536000, immutable；Content-Encoding: gzip（或 br）
```
