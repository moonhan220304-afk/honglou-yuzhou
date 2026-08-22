import type { Metadata } from "next";
import LocationCards from "@/components/location-cards";

export const metadata: Metadata = {
  title: "大观园",
  description: "十九处园景，一处一张卡片，左右滑动——谁住在这里，这里发生过什么。",
};

/** 大观园：卡片式浏览（一张地点卡居中，纯左右滑动） */
export default function MapPage() {
  return <LocationCards />;
}
