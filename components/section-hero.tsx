import type { ReactNode } from "react";

/**
 * 板块页头组件（视觉升级 V2 · 交付 2）。
 * 统一定义六大板块页头：板块色竖条 + 英文 eyebrow + 宋体大标题 + 简介 + CTA。
 * 用法：
 *   <SectionHero
 *     sector="poem"
 *     eyebrow="POEM SOCIETY"
 *     title="当期诗题"
 *     description="以诗会友，咏物言志……"
 *     actions={<Link ...>去参与</Link>}
 *   />
 * sector 决定竖条与 eyebrow 的板块色（characters/garden/chat/ask/poem/me），
 * 品牌页/首页用 "primary"（朱砂红）。
 */
type Sector = "characters" | "garden" | "chat" | "ask" | "poem" | "me" | "primary";

const sectorBar: Record<Sector, string> = {
  characters: "bg-characters",
  garden: "bg-garden",
  chat: "bg-chat",
  ask: "bg-ask",
  poem: "bg-poem",
  me: "bg-me",
  primary: "bg-primary",
};

const sectorEyebrow: Record<Sector, string> = {
  characters: "text-characters-deep",
  garden: "text-garden-deep",
  chat: "text-chat-deep",
  ask: "text-ask-deep",
  poem: "text-poem-deep",
  me: "text-me-deep",
  primary: "text-gold",
};

interface SectionHeroProps {
  sector?: Sector;
  /** 英文大写小字，如 "POEM SOCIETY"（可选） */
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function SectionHero({
  sector = "primary",
  eyebrow,
  title,
  description,
  actions,
}: SectionHeroProps) {
  return (
    <section className="border-b border-line/70 pb-6">
      <div className="flex items-center gap-3">
        <span aria-hidden className={`h-8 w-1 rounded-full ${sectorBar[sector]}`} />
        {eyebrow && (
          <p className={`text-[11px] uppercase tracking-[0.32em] ${sectorEyebrow[sector]}`}>{eyebrow}</p>
        )}
      </div>
      <h1 className="mt-3 font-serif text-3xl font-semibold tracking-wide text-ink md:text-4xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">{description}</p>}
      {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
    </section>
  );
}
