"use client";

import { useEffect, useRef } from "react";
import { sitePath } from "@/lib/api";

/** 访问统计上报：每次页面加载上报一次 */
export default function Analytics() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const payload = {
      page: `${window.location.pathname}${window.location.search}`,
      ref: document.referrer || "",
    };
    fetch(sitePath("/api/track"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
