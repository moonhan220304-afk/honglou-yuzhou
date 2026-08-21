"use client";

import { useRouter } from "next/navigation";
import { characters, events } from "@/lib/data";
import { poems } from "@/lib/mock/relationships";

export default function WanderButton({
  label = "随缘漫游",
  className = "",
  children,
}: {
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  function wander() {
    const pool: { type: string; href: string }[] = [
      ...Object.values(characters).map((c) => ({ type: "人物", href: `/characters/${c.id}` })),
      ...Object.values(events).map((e) => ({ type: "事件", href: `/events/${e.id}` })),
      ...poems.map((p) => ({ type: "诗词", href: `/characters/${p.author_id}` })),
    ];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    router.push(pick.href);
  }

  return (
    <button
      type="button"
      onClick={wander}
      className={className}
      title="随机进入红楼世界的任意角落"
    >
      {children ?? label}
    </button>
  );
}
