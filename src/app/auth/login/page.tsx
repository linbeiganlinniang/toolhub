"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { signIn, signUp, user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  if (user) {
    router.push("/forum");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else router.push("/forum");
    } else {
      if (!username.trim()) {
        setError("请输入用户名");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username.trim());
      if (error) setError(error);
      else setSuccess("注册成功！请检查邮箱确认链接（Supabase 本地开发模式下可跳过验证）。");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          {mode === "login" ? "👋 欢迎回来" : "🚀 创建账号"}
        </h1>
        <p className="text-sm text-[#9090a8] text-center mb-6">
          {mode === "login" ? "登录你的 ToolHub 账号" : "加入 ToolHub 社区"}
        </p>

        {error && (
          <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-sm rounded-lg px-4 py-2 mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-[#c0c0d8]">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                placeholder="你的昵称"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-[#c0c0d8]">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#c0c0d8]">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
              placeholder="至少 6 位"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#6366f1] text-white rounded-lg font-medium hover:bg-[#4f46e5] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {mode === "login" ? "登录" : "注册"} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#9090a8]">
          {mode === "login" ? (
            <>还没有账号？<button onClick={() => setMode("register")} className="text-[#6366f1] hover:underline">立即注册</button></>
          ) : (
            <>已有账号？<button onClick={() => setMode("login")} className="text-[#6366f1] hover:underline">去登录</button></>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-[#606080] mt-6">
        <Link href="/" className="hover:text-[#9090a8]">← 返回首页</Link>
      </p>
    </div>
  );
}
