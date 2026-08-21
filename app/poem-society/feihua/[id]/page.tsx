import type { Metadata } from "next";
import { poemTopicStaticParams } from "@/lib/poem-build";
import TopicDetail from "@/components/poem-society/topic-detail";

export async function generateStaticParams() {
  return poemTopicStaticParams("feihua");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `飞花 #${id}`, description: "海棠诗社飞花接句：出上句，接下句。" };
}

export default async function FeihuaTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TopicDetail id={Number(id)} kind="feihua" />;
}
