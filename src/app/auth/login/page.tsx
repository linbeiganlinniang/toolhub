"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function LoginPage() {
  const { signIn, signUp, signInWithOAuth, user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
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
        setError(t("login.usernameRequired"));
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username.trim());
      if (error) setError(error);
      else setSuccess(t("login.registerSuccess"));
    }
    setLoading(false);
  }

  async function handleOAuth(provider: "github" | "google") {
    setOauthLoading(provider);
    try {
      await signInWithOAuth(provider);
    } catch {
      setOauthLoading(null);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1">
            {mode === "login" ? t("login.title") : t("login.registerTitle")}
          </h1>
          <p className="text-sm text-[#9090a8]">
            {mode === "login" ? t("login.subtitle") : t("login.registerSubtitle")}
          </p>
        </div>

        {/* OAuth 快捷登录 */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuth("github")}
            disabled={!!oauthLoading}
            className="w-full py-2.5 bg-[#24292e] hover:bg-[#2f363d] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-3 disabled:opacity-50 border border-[#3a3f44]"
          >
            {oauthLoading === "github" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            )}
            <span>{oauthLoading === "github" ? t("login.redirecting") : t("login.githubLogin")}</span>
          </button>

          <button
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
            className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-800 rounded-lg font-medium transition-colors flex items-center justify-center gap-3 disabled:opacity-50 border border-gray-300"
          >
            {oauthLoading === "google" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{oauthLoading === "google" ? t("login.redirecting") : t("login.googleLogin")}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#2a2a44]" />
          <span className="text-xs text-[#606080]">{t("login.orEmail")}</span>
          <div className="flex-1 h-px bg-[#2a2a44]" />
        </div>

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
              <label className="block text-sm font-medium mb-1 text-[#c0c0d8]">{t("login.username")}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
                placeholder={t("login.usernamePlaceholder")}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-[#c0c0d8]">{t("login.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
              placeholder={t("login.emailPlaceholder")}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#c0c0d8]">{t("login.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
              placeholder={t("login.passwordPlaceholder")}
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
                {mode === "login" ? t("login.loginBtn") : t("login.registerBtn")} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#9090a8]">
          {mode === "login" ? (
            <>{t("login.noAccount")}<button onClick={() => setMode("register")} className="text-[#6366f1] hover:underline">{t("login.goRegister")}</button></>
          ) : (
            <>{t("login.hasAccount")}<button onClick={() => setMode("login")} className="text-[#6366f1] hover:underline">{t("login.goLogin")}</button></>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-[#606080] mt-6">
        <Link href="/" className="hover:text-[#9090a8]">{t("login.backToHome")}</Link>
      </p>
    </div>
  );
}
