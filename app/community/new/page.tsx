import type { Metadata } from "next";
import PostComposer from "@/components/community/post-composer";

export const metadata: Metadata = {
  title: "发帖讨论",
  description: "在红楼社发布你的话题。",
};

export default function NewPostPage() {
  return <PostComposer />;
}
