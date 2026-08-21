import type { Metadata } from "next";
import { Suspense } from "react";
import PoemComposer from "@/components/poem-society/poem-composer";

export const metadata: Metadata = {
  title: "作诗",
  description: "海棠诗社作诗编辑器：写一首诗参与当期诗题。",
};

export default function ComposePoemPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <PoemComposer />
    </Suspense>
  );
}
