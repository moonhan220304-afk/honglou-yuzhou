import type { Metadata } from "next";
import { poemTopicStaticParams } from "@/lib/poem-build";
import TopicDetail from "@/components/poem-society/topic-detail";

export async function generateStaticParams() {
  return poemTopicStaticParams("fill");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `填字 #${id}`, description: "海棠诗社填字题目：抄原句填字，以评论参与。" };
}

export default async function FillTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TopicDetail id={Number(id)} kind="fill" />;
}
