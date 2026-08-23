"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, sitePath } from "@/lib/api";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const search = useSearchParams();
  const next = search.get("next") || "/community";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setOk("");
    if (isLogin && (!username || !password)) return setErr("请输入用户名和密码");
    if (!isLogin && (!username || !password || !invite)) return setErr("请填写用户名、密码和邀请码");
    setBusy(true);
    try {
      if (isLogin) {
        await api("/api/login", { method: "POST", body: JSON.stringify({ username, password }) });
      } else {
        const r = await api<{ isFirst?: boolean }>("/api/register", {
          method: "POST",
          body: JSON.stringify({ username, password, invite_code: invite }),
        });
        if (r.isFirst) setOk("你注册成功，且是本站第一位用户（管理员）。欢迎！");
      }
      setTimeout(() => {
        window.location.href = sitePath(next);
      }, isLogin ? 300 : 900);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "提交失败，请重试");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-gold";

  return (
    <div className="mx-auto w-full max-w-md px-6 py-14">
      <p className="text-xs tracking-[0.3em] text-gold">{isLogin ? "WELCOME BACK" : "JOIN US"}</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">
        {isLogin ? "登录红楼社" : "注册账号"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {isLogin
          ? "登录后可以发帖、盖楼、参与讨论。"
          : "第二阶段采用邀请制：先到先得，一个邀请码只能注册一个账号，注册后无法重复使用。"}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-muted">用户名</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="2-20 位，中英文 / 数字 / 下划线"
            className={inputCls}
            maxLength={20}
            autoComplete="username"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位"
            className={inputCls}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </div>
        {!isLogin && (
          <div>
            <label className="mb-1.5 block text-xs text-muted">邀请码</label>
            <input
              value={invite}
              onChange={(e) => setInvite(e.target.value.toUpperCase())}
              placeholder="例如 HLM-XXXXXX-XXXXXX"
              className={inputCls}
            />
          </div>
        )}
        {err && (
          <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{err}</p>
        )}
        {ok && (
          <p className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">{ok}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-primary py-3 font-serif text-[15px] text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
        >
          {busy ? "请稍候…" : isLogin ? "登 录" : "注 册"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? (
          <>
            还没有账号？{" "}
            <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-primary">
              去注册（需邀请码）
            </Link>
          </>
        ) : (
          <>
            已有账号？{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-primary">
              去登录
            </Link>
          </>
        )}
      </p>
      <p className="mt-4 text-center text-xs text-muted/70">
        注册即代表同意内容自动审核、遵守社区规范
      </p>
    </div>
  );
}
