"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 滚动驱动全景背景：<img> 直接加载（渐进显示，无 canvas 等待），
 * 随滚动用 transform 推近（scale + translateY），lerp 平滑。
 * 手机端关闭推近放大：竖屏下放大只会让画面被裁切，观感是"首页被放大"。
 */
export default function ScrollPanorama({
  src,
  zoomFrom = 1.06,
  zoomTo = 1.34,
  boost = false,
}: {
  src: string;
  zoomFrom?: number;
  zoomTo?: number;
  boost?: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const boostRef = useRef(boost);
  boostRef.current = boost;
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const zFrom = mobile ? 1 : zoomFrom;
  const zTo = mobile ? 1.04 : zoomTo;

  useEffect(() => {
    let target = 0;
    let current = 0;
    let raf = 0;

    function apply() {
      const img = imgRef.current;
      if (!img) return;
      const zoom = zFrom + (zTo - zFrom) * current;
      const ty = mobile ? 0 : -current * 4.5;
      img.style.transform = `scale(${zoom}) translateY(${ty}%)`;
    }

    function loop() {
      if (!boostRef.current) {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        current += (target - current) * 0.09;
        apply();
      }
      raf = requestAnimationFrame(loop);
    }

    apply();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [src, zFrom, zTo, mobile]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#D9D2C2]">
      <img
        ref={imgRef}
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        style={
          boost
            ? {
                transform: `scale(${zTo * 1.05})`,
                transition: "transform 3s cubic-bezier(0.22, 1, 0.36, 1)",
              }
            : {
                transform: `scale(${zFrom})`,
                transition: "none",
              }
        }
      />
    </div>
  );
}
