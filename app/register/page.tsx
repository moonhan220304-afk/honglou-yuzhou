import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "注册",
  description: "凭邀请码注册红楼社账号，参与社区讨论。",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
