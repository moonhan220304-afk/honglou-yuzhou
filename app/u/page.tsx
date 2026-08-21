import type { Metadata } from "next";
import { Suspense } from "react";
import UserPublicPage from "@/components/user-public-page";

export const metadata: Metadata = {
  title: "用户主页",
  description: "红楼社同好的个人主页：等级、积分与 TA 发布的内容。",
};

/**
 * 用户公开主页。
 * 注意：本项目为静态导出（output:"export"），数据库用户 id 无法在构建期枚举，
 * 因此不采用 /u/[id] 路径参数（会因缺少 generateStaticParams 导致构建失败），
 * 与 /community/post/?id= 一致改用查询参数：/u?id=123。
 */
export default function UserPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <UserPublicPage />
    </Suspense>
  );
}
