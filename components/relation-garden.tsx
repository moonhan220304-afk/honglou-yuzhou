"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  VIEW_W,
  VIEW_H,
  ZONES,
  graphEdges,
  graphNodes,
} from "@/lib/graph-layout";
import { characters, relationships } from "@/lib/data";
import { characterImage } from "@/lib/images";

/** 关系大类（筛选用）：关键词首中即归组；顺序即优先级；「其他」兜底 */
const REL_CATEGORIES: { key: string; color: string; match: string[] }[] = [
  { key: "主仆", color: "#8FB4B5", match: ["主仆", "通房", "侍妾", "丫鬟"] },
  {
    key: "姻缘",
    color: "#E07A73",
    match: ["夫妻", "姻缘", "夫妇", "婚约", "未婚夫", "未婚妻", "偷娶", "妾", "外室", "二房", "妻妾", "夫妾"],
  },
  {
    key: "亲缘",
    color: "#D9B27C",
    match: [
      "母子", "母女", "父女", "父子", "兄妹", "姐弟", "姊妹", "兄弟",
      "祖孙", "祖孙媳", "姑侄", "姑嫂", "叔嫂", "婆媳", "表亲", "表兄妹",
      "堂", "甥", "叔侄", "同母", "胞", "干亲", "干娘", "长辈与晚辈", "祖辈", "连襟", "姻亲",
    ],
  },
  {
    key: "情缘",
    color: "#C79BC0",
    match: [
      "情敌", "恋人", "情人", "知己", "密友", "好友", "挚友", "友谊",
      "朋友", "青梅竹马", "暧昧", "爱慕", "初恋", "闺中", "情友",
      "精神共鸣", "镜像", "影子", "仰慕",
    ],
  },
  { key: "冲突", color: "#C0625A", match: ["仇", "死敌", "敌", "逼", "加害", "迫害", "驱逐", "强占", "压迫", "对立", "陷害", "辖制", "威胁", "勾结", "共谋"] },
  { key: "恩义", color: "#8FA98F", match: ["恩", "救", "施", "托孤", "庇护", "扶持", "报恩"] },
  { key: "其他", color: "#B9B2A6", match: [] },
];

const DARK_TYPE_COLOR: Record<string, string> = Object.fromEntries(
  REL_CATEGORIES.map((c) => [c.key, c.color]),
);

/** 关系类型 → 大类（首中即归组） */
function typeCategory(type: string): string {
  for (const c of REL_CATEGORIES) {
    if (c.match.some((k) => type.includes(k))) return c.key;
  }
  return "其他";
}

function darkTypeColor(type: string): string {
  return DARK_TYPE_COLOR[typeCategory(type)] ?? "#B9B2A6";
}

/** 曲线中点抬升 */
function curveMid(a: [number, number], b: [number, number]): [number, number] {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 - 22;
  return [mx, my];
}

/* ---------- 背景星空（模块级一次性生成，确定性伪随机，符合 React Compiler） ---------- */
function lcg(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const rnd = lcg(20260814);
/** 背景星尘：更密、更小、大小错落（个别亮星点缀） */
const STARFIELD = Array.from({ length: 300 }, () => {
  const roll = rnd();
  const r =
    roll < 0.68
      ? 0.3 + rnd() * 1.0
      : roll < 0.93
        ? 1.3 + rnd() * 1.1
        : 2.4 + rnd() * 1.6;
  return {
    x: rnd() * VIEW_W,
    y: rnd() * VIEW_H,
    r,
    o: 0.12 + rnd() * 0.55,
    dur: 2.4 + rnd() * 3.6,
    delay: rnd() * 4,
  };
});

/** 人物星大小：按重要性档位 + 关系复杂度（星缘条数）叠加，参差不齐 */
function starScale(
  level: string | undefined,
  degree: number,
): { core: number; ring: number } {
  const base =
    level === "core" ? 8.5 : level === "major" ? 6.8 : level === "minor" ? 5.4 : 4.2;
  const core = base + Math.min(degree * 0.06, 3);
  return { core, ring: core + 19 };
}

export default function RelationGarden() {
  const nodes = useMemo(() => graphNodes(), []);
  const edges = useMemo(() => graphEdges(), []);
  const degree = useMemo(() => {
    const d: Record<string, number> = {};
    for (const e of edges) {
      d[e.rel.from] = (d[e.rel.from] ?? 0) + 1;
      d[e.rel.to] = (d[e.rel.to] ?? 0) + 1;
    }
    return d;
  }, [edges]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of edges) {
      const c = typeCategory(e.rel.type);
      m.set(c, (m.get(c) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [edges]);

  const filteredEdges = useMemo(
    () =>
      edges.filter(
        (e) =>
          (!activeCat || typeCategory(e.rel.type) === activeCat) &&
          (!query.trim() ||
            characters[e.rel.from]?.name.includes(query.trim()) ||
            characters[e.rel.to]?.name.includes(query.trim())),
      ),
    [edges, activeCat, query],
  );

  const activeId = hovered ?? selected;
  const activeEdges = activeId
    ? edges.filter((e) => e.rel.from === activeId || e.rel.to === activeId)
    : [];
  const activeNeighbors = new Set(
    activeEdges.flatMap((e) => [e.rel.from, e.rel.to]),
  );
  const hasQuery = query.trim().length > 0;
  const matchedIds = useMemo(
    () =>
      new Set(
        nodes
          .filter((n) => hasQuery && n.c.name.includes(query.trim()))
          .map((n) => n.c.id),
      ),
    [nodes, hasQuery, query],
  );
  const dimmed =
    activeId || hasQuery
      ? (id: string) => {
          if (activeId)
            return (
              activeId !== id &&
              !activeNeighbors.has(id) &&
              !(hasQuery && matchedIds.has(id))
            );
          return !matchedIds.has(id);
        }
      : () => false;

  const activePos = activeId
    ? nodes.find((n) => n.c.id === activeId)?.pos
    : undefined;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0A0E1A] shadow-card">
      {/* 控制条 */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-white/[0.04] px-6 py-4">
        <div className="flex min-w-48 flex-1 items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索星辰：黛玉 / 凤姐 / 宝二爷…"
            className="w-full rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-[#EDE9DF] placeholder:text-white/35 focus:border-[#E8C98F]/60 focus:outline-none"
          />
          {hasQuery && matchedIds.size === 0 && (
            <span className="shrink-0 text-xs text-[#E8C98F]/80">
              未找到「{query.trim()}」
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveCat(null)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              activeCat === null
                ? "bg-[#EDE9DF] text-[#0A0E1A]"
                : "bg-white/[0.06] text-white/55 hover:bg-white/[0.12] hover:text-white/85"
            }`}
          >
            全部关系
          </button>
          {categoryCounts.map(([cat, n]) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCat(activeCat === cat ? null : cat)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors hover:bg-white/[0.12]"
              style={
                activeCat === cat
                  ? { backgroundColor: DARK_TYPE_COLOR[cat], color: "#0A0E1A" }
                  : { color: "rgba(255,255,255,0.6)" }
              }
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: DARK_TYPE_COLOR[cat] }}
              />
              {cat} · {n}
            </button>
          ))}
        </div>
      </div>

      {/* 星空图（移动端横向滚动保持可读，桌面不变） */}
      <div className="relative overflow-x-auto bg-[#0A0E1A]">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block h-auto w-full min-w-[820px]"
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B0F1D" />
              <stop offset="55%" stopColor="#101629" />
              <stop offset="100%" stopColor="#151126" />
            </linearGradient>
            <radialGradient id="nebulaA">
              <stop offset="0%" stopColor="#3D2C63" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3D2C63" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="nebulaB">
              <stop offset="0%" stopColor="#5C2536" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#5C2536" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="nebulaC">
              <stop offset="0%" stopColor="#23405A" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#23405A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="starGlow">
              <stop offset="0%" stopColor="#F7E7C3" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#E8C98F" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E8C98F" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 深空底 + 星云 */}
          <rect width={VIEW_W} height={VIEW_H} fill="url(#bgGrad)" />
          <circle cx={310} cy={220} r={390} fill="url(#nebulaA)" />
          <circle cx={960} cy={470} r={430} fill="url(#nebulaB)" />
          <circle cx={640} cy={770} r={360} fill="url(#nebulaC)" />

          {/* 满目星尘（大小错落，亮星带微晕） */}
          {STARFIELD.map((s, i) => (
            <g key={i}>
              {s.r >= 2.2 && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={s.r * 3.2}
                  fill="url(#starGlow)"
                  opacity={0.22}
                />
              )}
              <circle cx={s.x} cy={s.y} r={s.r} fill="#E8E3D8" opacity={s.o}>
                <animate
                  attributeName="opacity"
                  values={`${s.o};${s.o * 0.25};${s.o}`}
                  dur={`${s.dur}s`}
                  begin={`${s.delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}

          {/* 点空白处收起档案 */}
          <rect
            width={VIEW_W}
            height={VIEW_H}
            fill="transparent"
            onClick={() => setSelected(null)}
          />

          {/* 筛选静态层：选中关系大类 / 搜索人物时，直接点亮对应关系线（不再依赖悬停） */}
          {(activeCat || hasQuery) &&
            filteredEdges.map((e) => {
              const [mx, my] = curveMid(e.a, e.b);
              return (
                <path
                  key={`static-${e.rel.id}`}
                  d={`M ${e.a[0]} ${e.a[1]} Q ${mx} ${my} ${e.b[0]} ${e.b[1]}`}
                  fill="none"
                  stroke={darkTypeColor(e.rel.type)}
                  strokeWidth={1.3}
                  strokeOpacity={0.22}
                  strokeLinecap="round"
                />
              );
            })}

          {/* 穿梭层：hover 星星时整片星空向它推近 */}
          <g
            style={{
              transform: activePos ? "scale(1.07)" : "scale(1)",
              transformOrigin: activePos ? `${activePos[0]}px ${activePos[1]}px` : "50% 50%",
              transformBox: "view-box",
              transition: "transform 1.1s cubic-bezier(0.22,0.61,0.36,1)",
            }}
          >
            {/* 居所分区（星座般的幽微标记） */}
            {ZONES.map((z) => (
              <g key={z.id}>
                <rect
                  x={z.x}
                  y={z.y}
                  width={z.w}
                  height={z.h}
                  rx={36}
                  fill="#FFFFFF"
                  opacity={0.025}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <circle cx={z.x + 16} cy={z.y + 16} r={2} fill="#E8C98F" opacity={0.55} />
                <text
                  x={z.x + 26}
                  y={z.y + 22}
                  fontFamily="'Noto Serif SC', 'Songti SC', serif"
                  fontSize="14"
                  fill="rgba(255,255,255,0.3)"
                  letterSpacing="4"
                >
                  {z.name}
                </text>
              </g>
            ))}

            {/* 星缘线：悬停/点选一颗星时才点亮它的连线 */}
            {activeId &&
              filteredEdges
                .filter((e) => e.rel.from === activeId || e.rel.to === activeId)
                .map((e) => {
                  const [mx, my] = curveMid(e.a, e.b);
                  const target = activeCat ? 0.85 : 0.95;
                  return (
                    <path
                      key={e.rel.id}
                      d={`M ${e.a[0]} ${e.a[1]} Q ${mx} ${my} ${e.b[0]} ${e.b[1]}`}
                      fill="none"
                      stroke={darkTypeColor(e.rel.type)}
                      strokeWidth={2}
                      strokeOpacity={0}
                      strokeLinecap="round"
                    >
                      <animate
                        attributeName="stroke-opacity"
                        from="0"
                        to={target}
                        dur="0.55s"
                        fill="freeze"
                      />
                    </path>
                  );
                })}

            {/* 关系类型标签已移除：悬停时线的颜色 + 底部图例 + 右侧档案即可辨明，避免与线重叠 */}

            {/* 星辰（人物） */}
            {nodes.map(({ c, pos }) => {
              const [x, y] = pos;
              const isActive = activeId === c.id;
              const isMatched = matchedIds.has(c.id);
              const dim = dimmed(c.id) ? 0.12 : 1;
              const img = characterImage(c.id);
              const scale = starScale(
                (c as { importance_level?: string }).importance_level,
                degree[c.id] ?? 0,
              );
              const haloR =
                isActive || isMatched
                  ? Math.max(scale.core * 7, 56)
                  : scale.core * 4.4;
              const ringR = scale.ring;
              const clipR = ringR - 1;
              return (
                <g
                  key={c.id}
                  opacity={dim}
                  style={{ transition: "opacity .35s", cursor: "pointer" }}
                  role="button"
                  aria-label={c.name}
                  onMouseEnter={() => setHovered(c.id)}
                  onClick={() => setSelected((s) => (s === c.id ? null : c.id))}
                >
                  {/* 星光晕 */}
                  <circle
                    cx={x}
                    cy={y}
                    r={haloR}
                    fill="url(#starGlow)"
                    opacity={isActive ? 0.75 : isMatched ? 0.6 : 0.42}
                    style={{ transition: "all .5s" }}
                  />
                  {/* 搜索匹配 → 金色光环 */}
                  {isMatched && !isActive && (
                    <circle
                      cx={x}
                      cy={y}
                      r={scale.core * 2.6}
                      fill="none"
                      stroke="#E8C98F"
                      strokeWidth="1.6"
                      opacity={0.9}
                      style={{ transition: "opacity .35s" }}
                    />
                  )}
                  {/* 穿梭涟漪 */}
                  {isActive && (
                    <>
                      <circle cx={x} cy={y} r={ringR} fill="none" stroke="#E8C98F" strokeWidth="1.2" opacity="0">
                        <animate attributeName="r" values={`${ringR - 2};${ringR + 46}`} dur="1.8s" begin="0s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.65;0" dur="1.8s" begin="0s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={x} cy={y} r={ringR} fill="none" stroke="#E8C98F" strokeWidth="1" opacity="0">
                        <animate attributeName="r" values={`${ringR - 2};${ringR + 46}`} dur="1.8s" begin="0.9s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                  {/* 星核（未进入时） */}
                  <circle
                    cx={x}
                    cy={y}
                    r={scale.core}
                    fill="#F7E7C3"
                    opacity={isActive ? 0 : 0.95}
                    style={{ transition: "opacity .3s" }}
                  />
                  {/* 进入星星 → 显现人物肖像 */}
                  <clipPath id={`clip-${c.id}`}>
                    <circle cx={x} cy={y} r={clipR} />
                  </clipPath>
                  {img && (
                    <image
                      href={img}
                      x={x - clipR}
                      y={y - clipR}
                      width={clipR * 2}
                      height={clipR * 2}
                      clipPath={`url(#clip-${c.id})`}
                      preserveAspectRatio="xMidYMid slice"
                      opacity={isActive ? 1 : 0}
                      style={{
                        transform: isActive ? "scale(1)" : "scale(0.5)",
                        transformBox: "fill-box",
                        transformOrigin: "center",
                        transition:
                          "transform .6s cubic-bezier(.2,.7,.2,1), opacity .45s",
                      }}
                    />
                  )}
                  {/* 星环：仅进入（悬停/点选）时作为肖像边框出现，平时不画圈 */}
                  {isActive && (
                    <circle
                      cx={x}
                      cy={y}
                      r={ringR}
                      fill="none"
                      stroke="#E8C98F"
                      strokeWidth={2}
                      style={{ transition: "all .4s" }}
                    />
                  )}
                  {/* 名字 */}
                  <text
                    x={x}
                    y={y + ringR + 16}
                    textAnchor="middle"
                    fontFamily="'Noto Serif SC', 'Songti SC', serif"
                    fontSize={isActive ? 14.5 : 12.5}
                    fill={isActive ? "#F2D9A4" : "#D8D2C4"}
                    paintOrder="stroke"
                    stroke="#0B0F1D"
                    strokeWidth="3.5"
                    style={{ transition: "all .3s" }}
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 图例 */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-full border border-white/10 bg-[#0D1220]/80 px-5 py-2 shadow-card backdrop-blur">
          <span className="text-[11px] text-white/50">星缘：</span>
          {(
            [
              ["情缘", "#E07A73"],
              ["亲缘", "#D9B27C"],
              ["主仆", "#8FB4B5"],
              ["对照", "#A99BC4"],
            ] as const
          ).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5 text-[11px] text-white/70">
              <span className="h-1 w-4 rounded-full" style={{ backgroundColor: v }} />
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* 点选星辰 → 右侧小档案（手机端为底部弹层） */}
      {selected &&
        (() => {
          const c = characters[selected];
          if (!c) return null;
          const rels = activeEdgesFor(edges, selected).map((e) => {
            const other = e.rel.from === selected ? e.rel.to : e.rel.from;
            const oc = characters[other];
            return {
              id: e.rel.id,
              otherId: other,
              name: oc?.name ?? other,
              type: e.rel.type,
              summary: e.rel.summary,
            };
          });
          return (
            <>
              <div
                className="absolute bottom-14 right-3 top-3 z-10 hidden w-80 md:block"
                style={{ animation: "star-panel-in-x .45s cubic-bezier(.2,.7,.2,1)" }}
              >
                <StarProfile c={c} rels={rels} onClose={() => setSelected(null)} />
              </div>
              <div
                className="fixed inset-x-3 bottom-24 z-[70] max-h-[60vh] md:hidden"
                style={{ animation: "star-panel-in .4s cubic-bezier(.2,.7,.2,1)" }}
              >
                <StarProfile c={c} rels={rels} onClose={() => setSelected(null)} />
              </div>
            </>
          );
        })()}
    </div>
  );
}

function activeEdgesFor(
  edges: { rel: (typeof relationships)[string] }[],
  id: string,
) {
  return edges.filter((e) => e.rel.from === id || e.rel.to === id);
}

/* ---------- 星档案面板 ---------- */
function StarProfile({
  c,
  rels,
  onClose,
}: {
  c: (typeof characters)[string];
  rels: {
    id: string;
    otherId: string;
    name: string;
    type: string;
    summary: string;
  }[];
  onClose: () => void;
}) {
  const img = characterImage(c.id);
  return (
    <div className="flex max-h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0D1220]/95 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="relative overflow-y-auto p-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-sm text-white/60 transition-colors hover:bg-white/[0.14] hover:text-white"
        >
          ×
        </button>

        <div className="flex items-center gap-3">
          {img ? (
            <img
              src={img}
              alt={c.name}
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-[#E8C98F]/70 shadow-[0_0_18px_rgba(232,201,143,0.35)]"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-serif text-xl text-[#E8C98F]">
              {c.name.charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-serif text-lg font-semibold text-[#F2EBDC]">{c.name}</p>
            {c.aliases?.length ? (
              <p className="mt-0.5 text-xs text-white/50">
                {c.aliases.slice(0, 2).join(" · ")}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-white/40">{c.category}</p>
            )}
          </div>
        </div>

        {c.identity?.position && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/70">
            {c.identity.position.split("；")[0]}
          </p>
        )}
        <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-white/55">
          {c.summary?.short}
        </p>

        {c.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {c.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/70"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[10px] tracking-[0.2em] text-white/40">
            星缘 · {rels.length} 条关系
          </p>
          <div className="mt-2 space-y-1.5">
            {rels.slice(0, 5).map((r) => {
              const inner = (
                <>
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: darkTypeColor(r.type) }}
                  />
                  <span className="min-w-0 flex-1 truncate text-xs text-[#EDE9DF]">
                    {r.name}
                  </span>
                  <span className="shrink-0 text-[10px] text-white/45">{r.type}</span>
                </>
              );
              const linked = characters[r.otherId];
              return linked ? (
                <Link
                  key={r.id}
                  href={`/characters/${r.otherId}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.06]"
                >
                  {inner}
                </Link>
              ) : (
                <span
                  key={r.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                  title="该人物档案整理中"
                >
                  {inner}
                </span>
              );
            })}
          </div>
        </div>

        <Link
          href={`/characters/${c.id}`}
          className="mt-4 block rounded-full border border-[#E8C98F]/40 bg-[#E8C98F]/10 py-2 text-center text-xs font-medium text-[#E8C98F] transition-colors hover:bg-[#E8C98F]/20"
        >
          进入完整档案 →
        </Link>
      </div>
    </div>
  );
}
