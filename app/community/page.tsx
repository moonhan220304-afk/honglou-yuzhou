import type { Metadata } from "next";
import { Suspense } from "react";
import CommunityFeed from "@/components/community/community-feed";

export const metadata: Metadata = {
  title: "社区讨论",
  description: "与同好共论红楼：发帖、盖楼、自建话题。",
};

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <CommunityFeed />
    </Suspense>
  );
}
