import type { Metadata } from "next";
import DifficultyList from "@/components/poem-society/difficulty-list";

export const metadata: Metadata = {
  title: "填字",
  description: "海棠诗社填字：考对仗与炼字，抄原句填上你的字。",
};

export default function FillListPage() {
  return <DifficultyList kind="fill" />;
}
