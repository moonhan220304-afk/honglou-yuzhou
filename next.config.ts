import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  trailingSlash: true,
  // 仅本地 dev 预览用：把 /api 代理到本地 api-server（:4000）。
  // output:"export" 导出产物无 server，此规则不进入静态产物，部署不受影响。
  async rewrites() {
    if (process.env.NEXT_PUBLIC_BASE_PATH) return [];
    return [{ source: "/api/:path*", destination: "http://127.0.0.1:4000/api/:path*" }];
  },
};

export default nextConfig;
