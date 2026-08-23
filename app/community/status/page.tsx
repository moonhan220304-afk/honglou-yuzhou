import type { Metadata } from "next";
import StatusComposerPage from "@/components/community/status-composer-page";

export const metadata: Metadata = {
  title: "发表状态",
  description: "在红楼社分享一句话心境与图片。",
};

export default function NewStatusPage() {
  return <StatusComposerPage />;
}
