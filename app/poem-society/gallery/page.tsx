import type { Metadata } from "next";
import PoemGallery from "@/components/poem-society/poem-gallery";

export const metadata: Metadata = {
  title: "红楼诗刊",
  description: "海棠诗社佳作集：各期诗题按热度遴选魁首、榜眼、探花。",
};

export default function PoemGalleryPage() {
  return <PoemGallery />;
}
