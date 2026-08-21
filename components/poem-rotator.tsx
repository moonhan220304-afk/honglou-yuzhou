"use client";

import { useState } from "react";
import { kbPoems, characters, chapterLabel } from "@/lib/data";
import { poemImage } from "@/lib/images";
import PoemShareModal from "@/components/poem-share-modal";

/** 轮播精选：有图优先，其余按序补位（配图生成后自动生效） */
const ROTATION_IDS = [
  "poem_zanghua_yin",
  "poem_qiuchuang_fengyu_xi",
  "poem_daiyu_bohaitang",
  "poem_baochai_bohaitang",
  "poem_taohua_xing",
  "poem_tipa_sanjue",
  "poem_juhua_daiyu",
  "poem_pangxie_yong",
  "poem_luxuean_liianju",
  "poem_furong_nuer_lei",
];

export default function PoemRotator() {
  const [idx, setIdx] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const poems = ROTATION_IDS.map((id) => kbPoems.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  if (poems.length === 0) return null;
  const poem = poems[Math.min(idx, poems.length - 1)];
  const img = imgFailed ? undefined : poemImage(poem.id);
  const author = poem.author_character_id
    ? characters[poem.author_character_id]?.name ?? ""
    : "";

  return (
    <div className="overflow-hidden rounded-3xl bg-surface-warm card-print card-print--viewpoints">
      {img && (
        <div className="relative h-48 overflow-hidden sm:h-56">
          <img
            src={img}
            alt={poem.title}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute inset-x-6 bottom-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-serif text-xl font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                {poem.title}
              </h3>
              <p className="mt-1 text-xs text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {chapterLabel(poem.chapter_id)}
                {author ? ` · ${author}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-1.5 font-sans text-xs font-medium text-[#8A2C28] shadow backdrop-blur transition-colors hover:bg-white"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
              </svg>
              分享
            </button>
          </div>
        </div>
      )}

      <div className="p-8">
        {!img && (
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-lg font-semibold text-ink">{poem.title}</h3>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/50 bg-surface px-3.5 py-1.5 font-sans text-xs font-medium text-primary transition-colors hover:bg-paper-deep"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
              </svg>
              分享
            </button>
          </div>
        )}
        {poem.quote_short && (
          <div className={`${img ? "mt-6" : "mt-4"} border-l-2 border-gold/60 pl-5`}>
            <p className="whitespace-pre-line font-serif text-[15px] leading-loose text-ink/90">
              {poem.quote_short}
            </p>
          </div>
        )}
        {poem.summary && (
          <p className="mt-5 text-sm leading-relaxed text-muted">{poem.summary}</p>
        )}
        {poem.symbolic_notes && (
          <p className="mt-3 rounded-xl bg-paper-deep/60 p-3 text-xs leading-relaxed text-muted">
            {poem.symbolic_notes}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line-inner bg-paper/60 px-8 py-3">
        <button
          type="button"
          onClick={() => setIdx((idx + poems.length - 1) % poems.length)}
          className="text-sm text-muted transition-colors hover:text-primary"
          aria-label="上一首"
        >
          ← 上一首
        </button>
        <div className="flex gap-1.5">
          {poems.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={p.title}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === idx ? "bg-primary" : "bg-line"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIdx((idx + 1) % poems.length)}
          className="text-sm text-muted transition-colors hover:text-primary"
          aria-label="下一首"
        >
          下一首 →
        </button>
      </div>

      <PoemShareModal
        open={shareOpen}
        poemId={poem.id}
        title={poem.title}
        chapterLabel={chapterLabel(poem.chapter_id)}
        author={author}
        quote={poem.quote_short || ""}
        summary={poem.summary || ""}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
