import Link from "next/link";

export interface ModuleCardProps {
  title: string;
  subtitle: string;
  href: string;
  glyph: string;
}

export default function ModuleCard({ title, subtitle, href, glyph }: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl bg-surface-warm card-print card-print--identity p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-hover"
    >
      <div className="pointer-events-none absolute -right-4 -top-6 font-serif text-[7rem] leading-none text-primary/[0.06] transition-transform duration-500 group-hover:-translate-y-2">
        {glyph}
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-lg text-primary">
        {glyph}
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{subtitle}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
        进入
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}
