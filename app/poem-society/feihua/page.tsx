import type { Metadata } from "next";
import DifficultyList from "@/components/poem-society/difficulty-list";

export const metadata: Metadata = {
  title: "飞花接句",
  description: "海棠诗社飞花接句：出上句，接下句，以诗会友。",
};

export default function FeihuaListPage() {
  return <DifficultyList kind="feihua" />;
}
