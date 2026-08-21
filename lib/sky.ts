/* ---------- 天光系统：按北京时间自动日出/日间/黄昏/夜景 ---------- */

export interface SkyState {
  night: number;
  sunrise: number;
  day: number;
  dusk: number;
  stars: number;
  sun: { x: number; y: number; o: number };
  moon: { x: number; y: number; o: number };
}

function lcgSky(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const skyRnd = lcgSky(20260815);
const SKY_STARS = Array.from({ length: 64 }, () => ({
  x: skyRnd() * 100,
  y: skyRnd() * 62,
  s: skyRnd() * 1.1 + 0.4,
  o: skyRnd() * 0.65 + 0.35,
}));
export const skyBoxShadow = SKY_STARS.map(
  (st) => `${st.x}vw ${st.y}vh 0 ${st.s}px rgba(255,255,240,${st.o})`,
).join(", ");

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function computeSky(): SkyState {
  const now = new Date();
  const bj = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  const h = bj.getHours() + bj.getMinutes() / 60;
  const night = clamp01(
    h < 5 ? 1 : h < 6.5 ? (6.5 - h) / 1.5 : h > 20.5 ? 1 : h > 19 ? (h - 19) / 1.5 : 0,
  );
  const sunrise = clamp01(
    h < 5.5 ? 0 : h < 7.5 ? (h - 5.5) / 2 : h < 9 ? (9 - h) / 1.5 : 0,
  );
  const day = clamp01(
    h < 8 ? 0 : h < 9.5 ? (h - 8) / 1.5 : h < 16.5 ? 1 : h < 17.5 ? 17.5 - h : 0,
  );
  const dusk = clamp01(
    h < 16.5 ? 0 : h < 18.5 ? (h - 16.5) / 2 : h < 20 ? (20 - h) / 1.5 : 0,
  );
  const sunP = clamp01((h - 6) / 12);
  const sun = {
    x: 6 + sunP * 88,
    y: 82 - Math.sin(Math.PI * sunP) * 58,
    o: clamp01(1 - Math.abs(h - 12) / 6) * 0.95,
  };
  const mh = (h - 18 + 24) % 24;
  const moonP = clamp01(mh / 12);
  const moon = {
    x: 10 + moonP * 80,
    y: 22 - Math.sin(Math.PI * moonP) * 15,
    o: clamp01(1 - Math.abs(mh - 6) / 6),
  };
  return { night, sunrise, day, dusk, stars: night, sun, moon };
}
