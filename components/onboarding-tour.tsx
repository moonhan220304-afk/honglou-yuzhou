"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sitePath } from "@/lib/api";

const LS_KEY = "hlm_tutorial_v1_seen";

interface Step {
  /** 锚点选择器（高亮该元素） */
  selector?: string;
  /** 锚点不存在时用 fallback 定位（相对页面，top% / left%） */
  fallback?: { top: number; left: number };
  title: string;
  body: string;
  /** 气泡位置：above / below / left / right / center */
  pos: "above" | "below" | "left" | "right" | "center";
  /** 跳转链接（点击"去看看"） */
  href?: string;
}

const MOBILE_STEPS: Step[] = [
  {
    title: "欢迎来到红楼社",
    body: "这里是你的大观园。下面带你认识几个关键入口，看完就能逛起来了。",
    pos: "center",
  },
  {
    fallback: { top: 88, left: 50 },
    title: "首页",
    body: "沉浸开屏 + 今日热议，还有「每日一诗」和热度榜。上下滑动就能看到园中今日动静。",
    pos: "above",
  },
  {
    fallback: { top: 92, left: 20 },
    title: "底部导航 · 五个入口",
    body: "首页、搜索、发布、聊一聊、消息，常用的都在这。中间「＋」可以发动态、写长文、发诗。",
    pos: "above",
  },
  {
    selector: "a[href$='/poem-society/']",
    fallback: { top: 30, left: 50 },
    title: "海棠诗社",
    body: "本期诗题、填字、飞花接句都在这里，官方题库每周自动更新，你也可以「我来出题」。",
    pos: "below",
    href: "/poem-society",
  },
  {
    selector: "a[href$='/test/'], a[href$='/test']",
    fallback: { top: 40, left: 50 },
    title: "人格测试",
    body: "24 道情境题，测出你在红楼里像谁——全部依据原著，测完还能看站内同好统计。",
    pos: "below",
    href: "/test",
  },
  {
    selector: "button[aria-label='用户菜单'], a[href$='/profile/']",
    fallback: { top: 8, left: 80 },
    title: "个人空间与主题",
    body: "头像进个人中心：换头像、设背景、生成个人名片分享；「明暗主题」可在浅色/深色间切换。",
    pos: "below",
    href: "/profile",
  },
];

const DESKTOP_STEPS: Step[] = [
  {
    selector: "aside nav",
    title: "欢迎来到红楼社",
    body: "左侧竖排图标是全部频道入口：首页、人物志、海棠诗社、问一问……把鼠标移到图标上，会展开成文字菜单。",
    pos: "right",
  },
  {
    selector: "aside nav a[href$='/poem-society/']",
    fallback: { top: 30, left: 8 },
    title: "海棠诗社",
    body: "从左侧第 6 个图标（海棠诗社）进入：当期诗题、填字、飞花接句、佳作集都在这里，官方题库每周自动更新，人人可以「我来出题」。",
    pos: "right",
    href: "/poem-society",
  },
  {
    selector: "aside nav a[href$='/test/']",
    fallback: { top: 35, left: 8 },
    title: "人格测试",
    body: "从左侧第 3 个图标（找乐子 → 人格测试）进入：24 道情境题，测出你在红楼里像谁，测完可生成分享卡。",
    pos: "right",
    href: "/test",
  },
  {
    fallback: { top: 10, left: 70 },
    title: "明暗主题",
    body: "页面右上角用户菜单里有「明暗主题」，浅色 / 深色 / 跟随系统三态可切，记住你的选择。",
    pos: "below",
  },
];

function getRect(sel: string | undefined): DOMRect | null {
  if (!sel) return null;
  try {
    const el = document.querySelector(sel);
    return el ? el.getBoundingClientRect() : null;
  } catch {
    return null;
  }
}

/** 新手引导：新用户首次进入时逐条走查核心功能。localStorage 记忆，可跳过。 */
export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_KEY)) return;
    } catch {
      return;
    }
    const m = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "") || (typeof window !== "undefined" && window.innerWidth < 768);
    setIsMobile(m);
    // 等首屏渲染完成，然后等开屏结束（用户点「开始探索/直接进入」后开屏按钮消失）再弹引导
    const t = setTimeout(() => {
      let tries = 0;
      const inSplash = () => {
        try {
          // 开屏态特征：页面上存在「开始探索」按钮（点击后该按钮会卸载）
          const btns = [...document.querySelectorAll("button")].filter((b) => (b.textContent || "").includes("开始探索"));
          if (btns.length === 0) return false;
          const r = btns[0].getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        } catch {
          return false;
        }
      };
      const check = () => {
        if (inSplash() && tries < 40) {
          tries++;
          setTimeout(check, 500);
          return;
        }
        // 开屏已结束（或从未有开屏）→ 弹出引导
        setTimeout(() => setVisible(true), 300);
      };
      check();
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // 桌面引导期间：给 body 加 tour-expanded，AppSidebar 据此强制展开（图标+文字都可见）
  useEffect(() => {
    if (!visible || isMobile) return;
    document.body.classList.add("tour-expanded");
    return () => document.body.classList.remove("tour-expanded");
  }, [visible, isMobile, step]);

  if (!visible) return null;

  const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS;
  const s = steps[Math.min(step, steps.length - 1)];
  const rect = getRect(s.selector);

  const finish = () => {
    setVisible(false);
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch {}
  };
  const next = () => {
    if (step >= steps.length - 1) finish();
    else setStep(step + 1);
  };

  // 气泡位置计算
  let bubbleStyle: React.CSSProperties = { position: "fixed", zIndex: 200 };
  let arrowDir = "";
  if (s.pos === "center") {
    bubbleStyle = { ...bubbleStyle, top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  } else if (rect) {
    const pad = 10;
    const w = 260;
    if (s.pos === "below") {
      bubbleStyle = { ...bubbleStyle, top: rect.bottom + pad, left: Math.min(Math.max(12, rect.left + rect.width / 2 - w / 2), typeof window !== "undefined" ? window.innerWidth - w - 12 : 0) };
      arrowDir = "↑";
    } else if (s.pos === "above") {
      bubbleStyle = { ...bubbleStyle, top: Math.max(8, rect.top - 150), left: Math.min(Math.max(12, rect.left + rect.width / 2 - w / 2), typeof window !== "undefined" ? window.innerWidth - w - 12 : 0) };
      arrowDir = "↓";
    } else if (s.pos === "right") {
      bubbleStyle = { ...bubbleStyle, top: Math.max(8, rect.top), left: rect.right + pad };
      arrowDir = "←";
    } else if (s.pos === "left") {
      bubbleStyle = { ...bubbleStyle, top: Math.max(8, rect.top), left: Math.max(8, rect.left - w - pad) };
      arrowDir = "→";
    }
  } else if (s.fallback) {
    const vw = typeof window !== "undefined" ? window.innerWidth : 390;
    const vh = typeof window !== "undefined" ? window.innerHeight : 844;
    bubbleStyle = { ...bubbleStyle, top: (s.fallback.top / 100) * vh, left: Math.min(Math.max(12, (s.fallback.left / 100) * vw - 130), vw - 280) };
  }

  // 高亮框
  let halo: React.CSSProperties | null = null;
  if (rect && s.pos !== "center") {
    halo = {
      position: "fixed",
      zIndex: 190,
      top: rect.top - 4,
      left: rect.left - 4,
      width: rect.width + 8,
      height: rect.height + 8,
      borderRadius: 14,
      boxShadow: "0 0 0 9999px rgba(10,8,6,0.55), 0 0 0 2px #E8C98F, 0 8px 30px rgba(0,0,0,0.4)",
      pointerEvents: "none",
    };
  }

  return (
    <>
      {halo && <div style={halo} />}
      {!halo && (
        <div className="fixed inset-0 z-[190] bg-black/55" onClick={next} />
      )}
      <div
        className="w-[272px] max-w-[88vw] rounded-2xl border border-gold/30 bg-surface p-4 shadow-2xl"
        style={bubbleStyle}
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-serif text-[11px] text-primary">
            {step + 1} / {steps.length}
          </span>
          <button
            type="button"
            onClick={finish}
            className="text-xs text-muted transition-colors hover:text-body"
          >
            跳过引导
          </button>
        </div>
        <h3 className="mt-2 font-serif text-lg font-semibold text-ink">{s.title}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-body">{s.body}</p>
        <div className="mt-3 flex items-center gap-2">
          {s.href ? (
            <Link
              href={sitePath(s.href)}
              onClick={finish}
              className="flex-1 rounded-full bg-primary py-2 text-center font-serif text-sm text-paper transition-colors hover:bg-primary-deep"
            >
              去看看 →
            </Link>
          ) : (
            <button
              type="button"
              onClick={next}
              className="flex-1 rounded-full bg-primary py-2 font-serif text-sm text-paper transition-colors hover:bg-primary-deep"
            >
              {step >= steps.length - 1 ? "开始逛园子" : "下一步"}
            </button>
          )}
        </div>
        {arrowDir && (
          <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 text-lg leading-none text-gold/70">
            {arrowDir}
          </div>
        )}
      </div>
    </>
  );
}
