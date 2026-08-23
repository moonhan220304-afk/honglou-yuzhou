import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import AppSidebar from "@/components/app-sidebar";
import Analytics from "@/components/analytics";
import Footer from "@/components/footer";
import MShell from "@/components/mobile/m-shell";
import OnboardingTour from "@/components/onboarding-tour";
import { IS_MOBILE_BUILD } from "@/lib/mobile-build";

/* 字体：使用系统字体栈（globals.css @theme 中定义），不依赖 Google Fonts 网络下载 */

export const metadata: Metadata = {
  title: {
    default: "红楼社 · 一梦红楼",
    template: "%s · 红楼社",
  },
  description:
    "围绕《红楼梦》的数字文化社区：人物研究档案、事件时间线、人物关系图谱、红学观点与社区讨论。所有内容可溯源至原文。",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icons/icon-192.png`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icons/apple-touch-icon.png`,
  },
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/manifest.json`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#a63834",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 卡片水印线稿（按 basePath 注入，桌面/移动各自构建） */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--garden-line:url("${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/garden-linework-v1.png")}`,
          }}
        />
        {/* 主题初始化：在首次绘制前设置 data-theme-dark，避免深色用户白闪 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem("hlm_theme")||"system";var d=m==="dark"||(m==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.setAttribute("data-theme-dark","1");}}catch(e){}})();`,
          }}
        />
        {/* X5/微信内置浏览器对 HTTP 站点偶发进入「兼容模式」，按桌面宽度（980px）渲染。
            此 meta 让 X5 进入极速模式（Chromium/WebKit/Safari 均忽略，无害）。 */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        {/* iOS 添加到主屏：独立窗口 + 状态栏样式 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="红楼社" />
        {/* 微信等内置浏览器偶发忽略 viewport meta、按桌面宽度（980px）渲染。
            此脚本在 <head> 解析阶段同步重写 viewport，早于页面排版，旧内核也能生效。 */}
        <Script
          id="mobile-viewport-fix"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var ua=navigator.userAgent||"";var isMobile=/Mobi|Android|iPhone|iPad|iPod/i.test(ua);if(isMobile){var vp=document.querySelector('meta[name="viewport"]');if(vp){vp.setAttribute("content","width=device-width, initial-scale=1, viewport-fit=cover");}}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-sans antialiased">
        {/* 兜底：若移动设备仍按桌面宽度渲染（老内核忽略 viewport），解析期即重写并强制重排 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var ua=navigator.userAgent||"";var isMobile=/Mobi|Android|iPhone|iPad|iPod/i.test(ua);if(!isMobile)return;var vp=document.querySelector('meta[name="viewport"]');if(vp){vp.setAttribute("content","width=device-width, initial-scale=1, viewport-fit=cover");}var d=document.documentElement;var p=document.createElement("div");p.style.cssText="width:1px;height:1px;position:absolute;top:-9999px;left:0;";d.appendChild(p);d.style.zoom="1";setTimeout(function(){try{d.removeChild(p);}catch(e){}window.scrollTo(0,0);},0);}catch(e){}})();`,
          }}
        />
        <Analytics />
        {IS_MOBILE_BUILD ? (
          <MShell>{children}</MShell>
        ) : (
          <>
            <AppSidebar />
            <SiteHeader />
            <main className="flex-1 md:pl-[var(--hlm-sidebar-w)]">{children}</main>
            <Footer />
          </>
        )}
        <OnboardingTour />
        {/* Service Worker：仅生产构建（有 basePath）注册；本地预览（空 basePath）注销所有旧 SW，避免缓存旧样式 */}
        {process.env.NEXT_PUBLIC_BASE_PATH ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{if("serviceWorker"in navigator){var p="${process.env.NEXT_PUBLIC_BASE_PATH}";window.addEventListener("load",function(){navigator.serviceWorker.register(p+"/sw.js").catch(function(){});});}}catch(e){}})();`,
            }}
          />
        ) : (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{if("serviceWorker"in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});});}}catch(e){}})();`,
            }}
          />
        )}
      </body>
    </html>
  );
}
