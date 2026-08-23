export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line/60 bg-paper-deep/50 md:pl-[232px]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <p className="font-serif text-lg tracking-[0.3em] text-secondary-btn-text">
          红楼社 · 一梦红楼
        </p>
        <p className="max-w-xl text-center text-xs leading-relaxed text-muted">
          所有人物、事件、关系内容均标注章节与原文依据，可逐条溯源。
          《红楼梦》前八十回与后四十回归属均作明确标注。
        </p>
        <p className="text-xs text-muted/70">
          © 2026 红楼社 ·{" "}
          <a href="/about" className="text-muted transition-colors hover:text-primary">
            关于与版本更新
          </a>
        </p>
      </div>
    </footer>
  );
}
