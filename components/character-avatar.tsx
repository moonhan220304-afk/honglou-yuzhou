/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { characterImage } from "@/lib/images";

export default function CharacterAvatar({
  characterId,
  name,
  className = "",
}: {
  characterId: string;
  name: string;
  className?: string;
}) {
  const src = characterImage(characterId);
  const [failed, setFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoomed]);

  const canZoom = !!src && !failed;

  return (
    <>
      <div
        role={canZoom ? "button" : undefined}
        aria-label={canZoom ? `放大查看${name}` : undefined}
        onClick={(e) => {
          if (!canZoom) return;
          e.preventDefault();
          e.stopPropagation();
          setZoomed(true);
        }}
        className={`relative flex items-center justify-center overflow-hidden rounded-full border border-line bg-gradient-to-b from-surface-warm to-paper-deep shadow-card ${canZoom ? "cursor-zoom-in" : ""} ${className}`}
      >
        <span className="font-serif text-secondary-btn-text" style={{ fontSize: "calc(1em * 0.9)" }}>
          {name.charAt(0)}
        </span>
        {src && !failed && (
          <img
            src={src}
            alt={name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>

      {/* 点击头像 → 放大为完整正方形大图 */}
      {zoomed && canZoom && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black/80 p-6"
          onClick={() => setZoomed(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={name}
              style={{ width: "88vmin", height: "88vmin" }}
              className="rounded-2xl object-cover shadow-2xl"
            />
            <p className="mt-3 text-center font-serif text-lg text-white/90">{name}</p>
            <button
              type="button"
              onClick={() => setZoomed(false)}
              aria-label="关闭"
              className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg text-white hover:bg-white/30"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
