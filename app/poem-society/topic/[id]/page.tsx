import type { Metadata } from "next";
import { poemTopicStaticParams } from "@/lib/poem-build";
import TopicDetail from "@/components/poem-society/topic-detail";

export async function generateStaticParams() {
  return poemTopicStaticParams("poem_topic");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `诗题 #${id}`, description: "海棠诗社诗题详情：写诗参与、作品流、评论与 AI 诗评。" };
}

export default async function PoemTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TopicDetail id={Number(id)} kind="poem_topic" />;
}
