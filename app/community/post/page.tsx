import type { Metadata } from "next";
import { Suspense } from "react";
import PostDetail from "@/components/community/post-detail";

export const metadata: Metadata = {
  title: "帖子详情",
  description: "红楼社社区讨论详情与盖楼回复。",
};

export default function PostPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <PostDetail />
    </Suspense>
  );
}
