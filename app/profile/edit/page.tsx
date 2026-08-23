import type { Metadata } from "next";
import ProfileEdit from "@/components/profile-edit";

export const metadata: Metadata = {
  title: "编辑资料",
  description: "编辑你的头像与个性签名。",
};

export default function ProfileEditPage() {
  return <ProfileEdit />;
}
