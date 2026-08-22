import type { SVGProps } from "react";

/**
 * 线性图标集（雅致新中式：细线稿风格，stroke=currentColor）。
 * 替代早期 emoji 图标，与整体中式设计语言统一。
 * 用法：<IconHome className="h-5 w-5 text-muted" />
 */

function Svg({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h5v-5.5h4V20h5V9.5" />
  </Svg>
);

export const IconBook = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
    <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
    <path d="M9 7.5h7M9 11h4" />
  </Svg>
);

export const IconGame = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M6 6h12a4 4 0 0 1 4 4v5a3 3 0 0 1-5.2 2l-1.2-1.4H8.4L7.2 17A3 3 0 0 1 2 15v-5a4 4 0 0 1 4-4Z" />
    <path d="M7 10v3M5.5 11.5h3" />
    <path d="M16 10.5h.01M18.5 13h.01" />
  </Svg>
);

export const IconChat = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 17.5H9l-4.5 3.5v-3.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5Z" />
    <path d="M7 9.5h.01M11 9.5h.01M15 9.5h.01" />
  </Svg>
);

export const IconQuestion = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.2a2.5 2.5 0 0 1 4.9.8c0 1.6-2.5 2.2-2.5 3.5" />
    <path d="M12 16.8h.01" />
  </Svg>
);

export const IconQuill = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M20 4c-1-5-8-5-12 0L3 9l6 6 5-5" />
    <path d="M3 21s5-3 8-6l3-3" />
    <path d="M14 8l3 3" />
  </Svg>
);

export const IconUser = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c.8-3.6 3.9-5.5 7.5-5.5s6.7 1.9 7.5 5.5" />
  </Svg>
);

export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.8-3.8" />
  </Svg>
);

export const IconHeart = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M12 20.5S3.5 15.2 3.5 9.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8.5 2.2c0 6-8.5 11.3-8.5 11.3Z" />
  </Svg>
);

export const IconMessage = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 17.5H9l-4.5 3.5v-3.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5Z" />
  </Svg>
);

export const IconShare = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <circle cx="6" cy="12" r="2.2" />
    <circle cx="17.5" cy="5.5" r="2.2" />
    <circle cx="17.5" cy="18.5" r="2.2" />
    <path d="m8.1 10.8 7.4-3.6M8.1 13.2l7.4 3.6" />
  </Svg>
);

export const IconBell = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M6 9.5a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
    <path d="M10 19a2.2 2.2 0 0 0 4 0" />
  </Svg>
);

export const IconPlus = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconArrowLeft = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M14.5 5 8 11.5l6.5 6.5" />
  </Svg>
);

export const IconArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M9.5 5 16 11.5 9.5 18" />
  </Svg>
);

export const IconFlame = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M12 3.5c1 2.2 3.6 3.9 3.6 8a3.6 3.6 0 0 1-7.2 0c0-1.6.8-2.8 1.4-4 .8 1 1.6 1.6 2.2 1.6-1.5-2-2.4-4-2.4-5.6" />
  </Svg>
);

export const IconMapPin = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.4-6.5-10.5A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.5C18.5 15.6 12 21 12 21Z" />
    <circle cx="12" cy="10.2" r="2.3" />
  </Svg>
);

export const IconGrid = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
  </Svg>
);

export const IconEye = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Svg>
);
