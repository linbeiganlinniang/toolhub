"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Crown, Shield, Star, Check, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

const TIER_MAP = {
  free: { level: 1, nameKey: "vip.freeMember", icon: <Star size={24} />, price: 0, color: "#9090a8", featuresKey: "vip.freeFeatures" },
  silver: { level: 2, nameKey: "vip.silverSponsor", icon: <Shield size={24} />, price: 9.9, color: "#a0a0c0", featuresKey: "vip.silverFeatures" },
  gold: { level: 3, nameKey: "vip.goldSponsor", icon: <Crown size={24} />, price: 29.9, color: "#f59e0b", featuresKey: "vip.goldFeatures" },
};

export default function VipPage() {
  const { user, profile } = useAuth();
  const { t, ta } = useTranslation();
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState("");

  const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  async function handleStripeCheckout(price: number, planName: string) {
    setCheckingOut(planName);
    setStripeError("");

    try {
      const origin = window.location.origin;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price,
          planName,
          userId: user?.id,
          userEmail: user?.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStripeError(data.error || "Stripe error");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      setStripeError(err.message);
    } finally {
      setCheckingOut(null);
    }
  }

  // Check for successful payment return from Stripe
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setShowSuccess(true);
      // Clean URL
      window.history.replaceState({}, "", "/vip");
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("vip.title")}</h1>
        <p className="text-[#9090a8] text-sm">{t("vip.subtitle")}</p>
      </div>

      {showSuccess && (
        <div className="bg-gradient-to-r from-[#22c55e]/10 to-[#6366f1]/10 border border-[#22c55e]/30 rounded-2xl p-6 mb-8 text-center">
          <Crown className="mx-auto mb-2 text-[#f59e0b]" size={32} />
          <h2 className="text-xl font-bold text-[#22c55e]">{t("vip.thanksTitle")}</h2>
          <p className="text-sm text-[#9090a8] mt-1">{t("sponsor.thanksDesc")}</p>
        </div>
      )}

      {user && profile?.vip_level && profile.vip_level >= 2 && !showSuccess ? (
        <div className="bg-gradient-to-r from-[#f59e0b]/10 to-[#6366f1]/10 border border-[#f59e0b]/30 rounded-2xl p-6 mb-8 text-center">
          <Crown className="mx-auto mb-2 text-[#f59e0b]" size={32} />
          <h2 className="text-xl font-bold text-[#f59e0b]">{t("vip.thanksTitle")}</h2>
          <p className="text-sm text-[#9090a8] mt-1">
            {t("vip.thanksDesc")}：{Object.values(TIER_MAP).find(tier => tier.level === profile.vip_level)?.nameKey ? t(Object.values(TIER_MAP).find(tier => tier.level === profile.vip_level)!.nameKey) : ""}
            {profile.vip_expires_at && <> · {t("vip.validUntil")} {new Date(profile.vip_expires_at).toLocaleDateString("zh-CN")}</>}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {Object.values(TIER_MAP).map((tier) => (
            <div key={tier.level} className={`bg-[#1a1a30] border rounded-2xl p-6 flex flex-col ${tier.level === 3 ? "border-[#f59e0b] ring-1 ring-[#f59e0b]/30" : "border-[#2a2a44]"}`}>
              {tier.level === 3 && <div className="bg-[#f59e0b] text-black text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-3 -mt-1">{t("vip.mostPopular")}</div>}
              <div className="flex items-center gap-2 mb-3" style={{ color: tier.color }}>{tier.icon}<h2 className="font-bold text-lg">{t(tier.nameKey)}</h2></div>
              <div className="mb-4">
                <span className="text-3xl font-bold">¥{tier.price}</span>
                {tier.price > 0 && <span className="text-xs text-[#9090a8]">{t("vip.perMonth")}</span>}
                {tier.price === 0 && <span className="text-xs text-[#9090a8]"> {t("vip.free")}</span>}
              </div>
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {ta(tier.featuresKey).map((f: string, j: number) => (
                  <li key={j} className="flex items-start gap-2"><Check size={14} className="text-[#22c55e] mt-0.5 flex-shrink-0" /><span className="text-[#c0c0d8]">{f}</span></li>
                ))}
              </ul>
              {tier.price > 0 ? (
                STRIPE_PUBLISHABLE_KEY ? (
                  <button
                    onClick={() => handleStripeCheckout(tier.price, t(tier.nameKey))}
                    disabled={checkingOut === t(tier.nameKey)}
                    className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: tier.color, color: tier.level === 2 ? "#1a1a2e" : "#fff" }}
                  >
                    {checkingOut === t(tier.nameKey) ? <Loader2 size={14} className="animate-spin" /> : null}
                    {checkingOut === t(tier.nameKey) ? t("sponsor.processing") : t("vip.checkout")}
                  </button>
                ) : (
                  <Link href="/sponsor" className="w-full py-2.5 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2" style={{ background: tier.color, color: tier.level === 2 ? "#1a1a2e" : "#fff" }}>
                    {t("vip.sponsor")} <ArrowRight size={14} />
                  </Link>
                )
              ) : (
                <button disabled className="w-full py-2.5 bg-[#2a2a44] text-[#9090a8] rounded-lg text-sm">{t("vip.defaultTier")}</button>
              )}
            </div>
          ))}
        </div>
      )}

      {stripeError && (
        <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] text-sm rounded-lg px-4 py-2 mb-4 text-center">
          {stripeError}
        </div>
      )}

      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-lg mb-4">{t("vip.sponsorWall")}</h2>
        <SponsorList t={t} />
      </div>

      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-3">{t("vip.faq")}</h2>
        <div className="space-y-3 text-sm">
          <details className="text-[#9090a8]"><summary className="cursor-pointer text-[#c0c0d8] hover:text-white">{t("vip.faqPayment")}</summary><p className="mt-1 ml-4">{t("vip.faqPaymentAnswer")}</p></details>
          <details className="text-[#9090a8]"><summary className="cursor-pointer text-[#c0c0d8] hover:text-white">{t("vip.faqActivate")}</summary><p className="mt-1 ml-4">{t("vip.faqActivateAnswer")}</p></details>
          <details className="text-[#9090a8]"><summary className="cursor-pointer text-[#c0c0d8] hover:text-white">{t("vip.faqRefund")}</summary><p className="mt-1 ml-4">{t("vip.faqRefundAnswer")}</p></details>
          <details className="text-[#9090a8]"><summary className="cursor-pointer text-[#c0c0d8] hover:text-white">{t("vip.faqUsage")}</summary><p className="mt-1 ml-4">{t("vip.faqUsageAnswer")}</p></details>
        </div>
      </div>
    </div>
  );
}

function SponsorList({ t }: { t: (key: string) => string }) {
  const [sponsors, setSponsors] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("sponsors").select("*, profiles:user_id(username, display_id)").order("created_at", { ascending: false }).limit(20).then(({ data }) => setSponsors(data || []));
  }, []);
  if (sponsors.length === 0) return <p className="text-sm text-[#9090a8]">{t("vip.noSponsors")}</p>;
  return (
    <div className="space-y-2">
      {sponsors.map((s: any) => (
        <div key={s.id} className="flex items-center justify-between bg-[#12122a] rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm">{s.profiles?.username || t("vip.anonymous")}</span>
            {s.profiles?.display_id && <span className="text-[10px] text-[#22d3ee] font-mono">UID:{s.profiles.display_id}</span>}
          </div>
          <div className="flex items-center gap-3">
            {s.message && <span className="text-xs text-[#9090a8] max-w-[200px] truncate">{s.message}</span>}
            <span className="text-sm text-[#f59e0b] font-bold">¥{s.amount}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
