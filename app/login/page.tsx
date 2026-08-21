import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "登录",
  description: "登录红楼社，参与社区讨论。",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
