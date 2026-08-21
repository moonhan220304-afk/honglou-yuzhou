import type { Metadata } from "next";
import PoemSocietyList from "@/components/poem-society/poem-society-list";

export const metadata: Metadata = {
  title: "海棠诗社 · 当期诗题",
  description: "以诗会友，咏物言志。当期诗题与往期诗题，长期开放，随时参与。",
};

export default function PoemSocietyPage() {
  return <PoemSocietyList />;
}
