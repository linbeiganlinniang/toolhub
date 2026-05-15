"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Crown, Heart, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

const PLANS = [
  { amount: 9.9, nameKey: "sponsor.silverMonth", level: 2, color: "#a0a0c0" },
  { amount: 29.9, nameKey: "sponsor.goldMonth", level: 3, color: "#f59e0b" },
  { amount: 99, nameKey: "sponsor.goldYear", level: 3, color: "#f59e0b" },
  { amount: 5, nameKey: "sponsor.smallTip", level: 0, color: "#6366f1" },
];

export default function SponsorPage() {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const [amount, setAmount] = useState(29.9);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"choose" | "done">("choose");
  const [checkingOut, setCheckingOut] = useState(false);
  const [stripeError, setStripeError] = useState("");

  const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const finalAmount = amount || parseInt(customAmount) || 0;

  async function handleStripeCheckout() {
    if (!user || finalAmount <= 0) return;
    setCheckingOut(true);
    setStripeError("");

    try {
      const planName = amount > 0
        ? PLANS.find(p => p.amount === amount)?.nameKey
          ? t(PLANS.find(p => p.amount === amount)!.nameKey)
          : `${t("sponsor.customAmount")} ¥${finalAmount}`
        : `${t("sponsor.customAmount")} ¥${finalAmount}`;

      const origin = window.location.origin;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: finalAmount,
          planName,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStripeError(data.error || "Stripe error");
        setCheckingOut(false);
        return;
      }

      // Save sponsor record before redirect
      await supabase.from("sponsors").insert({
        user_id: user.id,
        amount: finalAmount,
        message: message.trim(),
      });

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      setStripeError(err.message);
      setCheckingOut(false);
    }
  }

  // Check for cancelled return from Stripe
  const [showCancelled, setShowCancelled] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "true") {
      setShowCancelled(true);
      window.history.replaceState({}, "", "/sponsor");
    }
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-center mb-2">{t("sponsor.title")}</h1>
      <p className="text-sm text-[#9090a8] text-center mb-6">{t("sponsor.subtitle")}</p>

      {showCancelled && (
        <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-3 mb-6 text-sm text-[#f59e0b] text-center">
          支付已取消。请重新选择赞助方案。
        </div>
      )}

      {STRIPE_PUBLISHABLE_KEY ? (
        /* Stripe Payment Flow */
        step === "choose" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map((p, i) => (
                <button key={i} onClick={() => { setAmount(p.amount); setCustomAmount(""); }}
                  className="p-4 rounded-xl border text-left transition-all"
                  style={{
                    background: amount === p.amount ? `${p.color}15` : "#1a1a30",
                    borderColor: amount === p.amount ? p.color : "#2a2a44",
                  }}>
                  <p className="text-sm font-bold" style={{ color: p.color }}>{t(p.nameKey)}</p>
                  <p className="text-2xl font-bold mt-1">¥{p.amount}</p>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="number" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                className="flex-1 bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1]" placeholder={t("sponsor.customAmount")} min={1} />
              <span className="text-sm text-[#9090a8]">{t("sponsor.yuan")}</span>
            </div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1]"
              placeholder={t("sponsor.message")} maxLength={100} />
            {stripeError && (
              <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] text-sm rounded-lg px-4 py-2">
                {stripeError}
              </div>
            )}
            <button onClick={handleStripeCheckout} disabled={checkingOut || finalAmount <= 0}
              className="w-full py-3 bg-gradient-to-r from-[#f59e0b] to-[#6366f1] text-white rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50">
              {checkingOut ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
              {checkingOut ? t("sponsor.processing") : `${t("sponsor.confirmSponsor")} ¥${finalAmount}`}
            </button>
            <p className="text-center text-xs text-[#606080]">
              {t("sponsor.payNote")}
            </p>
          </div>
        ) : (
          /* Thank you page after successful payment */
          <div className="text-center bg-[#1a1a30] border border-[#22c55e]/30 rounded-2xl p-8 space-y-4">
            <Crown className="mx-auto text-[#f59e0b]" size={48} />
            <h2 className="text-xl font-bold">{t("sponsor.thanksTitle")}</h2>
            <p className="text-sm text-[#9090a8]">{t("sponsor.thanksDesc")}</p>
            <Link href="/vip" className="inline-block px-6 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5]">
              {t("sponsor.backToVip")}
            </Link>
          </div>
        )
      ) : (
        /* No Stripe configured - show setup instructions */
        <div className="space-y-4">
          <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-4 text-sm text-[#f59e0b]">
            <p className="font-medium mb-1">⚠️ Stripe 尚未配置</p>
            <p className="text-xs">请在 Netlify 环境变量中设置 STRIPE_SECRET_KEY 和 NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 以启用在线支付。</p>
          </div>
          <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-6">
            <p className="text-sm text-[#9090a8] mb-4">
              赞助金额 <span className="text-white font-bold text-xl">¥{finalAmount}</span>
            </p>
            <p className="text-xs text-[#606080] mb-4">请联系管理员获取支付方式。UID: 10001</p>
            <button disabled className="w-full py-3 bg-[#2a2a44] text-[#9090a8] rounded-xl font-bold text-sm">
              Stripe 未配置
            </button>
          </div>
        </div>
      )}

      {/* 管理员说明 */}
      <details className="mt-6 text-xs text-[#606080] bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-4">
        <summary className="cursor-pointer hover:text-[#9090a8]">⚙️ Stripe 配置说明</summary>
        <div className="mt-3 space-y-2">
          <p>在 Netlify 环境变量中设置以下值即可启用 Stripe 在线支付：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><code className="bg-[#12122a] px-1 rounded text-[#22d3ee]">STRIPE_SECRET_KEY</code> — 从 Stripe Dashboard 获取</li>
            <li><code className="bg-[#12122a] px-1 rounded text-[#22d3ee]">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> — 从 Stripe Dashboard 获取</li>
            <li><code className="bg-[#12122a] px-1 rounded text-[#22d3ee]">STRIPE_WEBHOOK_SECRET</code> — 从 Stripe Dashboard Webhooks 获取</li>
          </ul>
          <p className="mt-2">设置后重新部署即可。Stripe 支持国际信用卡 / 支付宝 / 微信支付。</p>
        </div>
      </details>

      <p className="text-center text-xs text-[#606080] mt-8">
        <Link href="/vip" className="hover:text-[#9090a8]">{t("sponsor.backToVipBottom")}</Link>
      </p>
    </div>
  );
}
