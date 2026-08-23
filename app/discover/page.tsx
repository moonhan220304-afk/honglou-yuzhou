import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "发现",
  description: "红楼社内容聚合：人物志、大观园、诗词、问一问、海棠诗社、人格测试。",
};

const entries = [
  { href: "/characters", label: "人物志", desc: "抽卡式浏览十二钗群芳谱", en: "CHARACTERS" },
  { href: "/graph", label: "关系图谱", desc: "星图式看懂红楼人物关系", en: "RELATIONS" },
  { href: "/map", label: "大观园", desc: "一处一景，走进大观园", en: "GARDEN" },
  { href: "/questions", label: "问一问", desc: "每个问题都不止一个答案", en: "QUESTIONS" },
  { href: "/poems", label: "诗词", desc: "原文诗词，可逐条溯源", en: "POEMS" },
  { href: "/poem-society", label: "海棠诗社", desc: "咏诗、填字、飞花、佳作集", en: "POEM SOCIETY" },
  { href: "/test", label: "人格测试", desc: "测测你更像红楼里的谁", en: "TEST" },
];

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <header>
        <p className="text-xs tracking-[0.3em] text-gold">DISCOVER</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">发现</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">
          人物、地点、诗词、问题、诗社——红楼社的全部内容入口，都在这里。
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {entries.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className="card-print card-print--identity flex flex-col rounded-2xl bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
          >
            <p className="text-[10px] tracking-[0.2em] text-gold">{e.en}</p>
            <p className="mt-2 font-serif text-base font-semibold text-ink">{e.label}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{e.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
