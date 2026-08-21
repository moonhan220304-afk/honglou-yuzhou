/**
 * 红楼宇宙 Logo：朱红印章底 + 攒尖亭与水面倒影（大观园意象）
 */
export default function LogoMark({
  className = "",
  tone = "seal",
}: {
  className?: string;
  tone?: "seal" | "light";
}) {
  const bg = tone === "seal" ? "#A63834" : "rgba(166,56,52,0.92)";
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      aria-hidden
    >
      <rect x="1.5" y="1.5" width="37" height="37" rx="9" fill={bg} />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="9"
        fill="none"
        stroke="rgba(196,154,108,0.55)"
        strokeWidth="1"
      />
      {/* 攒尖顶 */}
      <path d="M20 6.5 28 13H12Z" fill="#F5EFE3" />
      {/* 檐 */}
      <path d="M10.5 13h19v2.2h-19Z" fill="#EDE5D2" />
      <path d="M10.5 15.2h19l-1.1 0.8h-16.8Z" fill="#F5EFE3" />
      {/* 柱 */}
      <rect x="17.2" y="15.2" width="1.6" height="5.6" fill="#F5EFE3" />
      <rect x="21.2" y="15.2" width="1.6" height="5.6" fill="#F5EFE3" />
      {/* 台基 */}
      <rect x="14.5" y="20.8" width="11" height="1.9" rx="0.6" fill="#EDE5D2" />
      {/* 水面倒影 */}
      <path
        d="M9 26.5q2.2-1.4 4.4 0t4.4 0 4.4 0 4.4 0 4.4 0"
        fill="none"
        stroke="#F5EFE3"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M11.5 30.5q2-1.2 4 0t4 0 4 0"
        fill="none"
        stroke="#F5EFE3"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
