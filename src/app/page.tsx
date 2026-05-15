"use client";

import Link from "next/link";
import { MessageSquare, Wrench, Users, ArrowRight, Zap, Shield, Crown, LogIn, UserPlus, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // ========== 已登录：仪表盘 ==========
  if (user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">{t("home.heroTitle")}</h1>
        <p className="text-sm text-[#9090a8] mb-8">{t("home.heroDesc")}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { href: "/forum", icon: <MessageSquare size={24} />, label: t("nav.forum"), desc: t("home.feature2Desc"), color: "#22d3ee" },
            { href: "/tools", icon: <Wrench size={24} />, label: t("nav.tools"), desc: t("home.feature1Desc"), color: "#6366f1" },
            { href: "/friends", icon: <Users size={24} />, label: t("nav.friends"), desc: t("home.feature3Desc"), color: "#a78bfa" },
            { href: "/vip", icon: <Crown size={24} />, label: t("nav.vip"), desc: t("home.ctaDesc"), color: "#f59e0b" },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-5 hover:border-[#6366f1]/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-white" style={{ background: item.color }}>
                {item.icon}
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-white transition-colors">{item.label}</h3>
              <p className="text-xs text-[#9090a8] leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#6366f1]/10 to-[#22d3ee]/10 border border-[#2a2a44] rounded-2xl p-6">
          <p className="text-sm text-[#9090a8] text-center">
            <Sparkles size={14} className="inline mr-1 text-[#f59e0b]" />
            {t("home.ctaDesc")}
          </p>
        </div>
      </div>
    );
  }

  // ========== 未登录：介绍页 ==========
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-full px-4 py-1.5 text-xs text-[#a78bfa] mb-6">
          🐼 开源 · 免费 · 零成本
        </div>
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-[#6366f1] via-[#a78bfa] to-[#22d3ee] bg-clip-text text-transparent">
          熊猫创客
        </h1>
        <p className="text-xl text-[#9090a8] max-w-xl mx-auto mb-2">
          {t("home.heroDesc")}
        </p>
        <p className="text-sm text-[#606080] mb-8">PandaMaker — Tools, Community, Creation</p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/login" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#4f46e5] transition-colors shadow-lg shadow-[#6366f1]/25">
            <LogIn size={18} /> {t("login.loginBtn")}
          </Link>
          <Link href="/auth/login" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#3a3a50] text-[#c0c0d8] font-medium hover:bg-[#2a2a44] transition-colors">
            <UserPlus size={18} /> {t("login.registerBtn")}
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid sm:grid-cols-3 gap-6 mb-16">
        {[
          { icon: <Wrench size={28} />, title: t("home.feature1Title"), desc: t("home.feature1Desc"), color: "#6366f1" },
          { icon: <MessageSquare size={28} />, title: t("home.feature2Title"), desc: t("home.feature2Desc"), color: "#22d3ee" },
          { icon: <Users size={28} />, title: t("home.feature3Title"), desc: t("home.feature3Desc"), color: "#a78bfa" },
        ].map((f, i) => (
          <div key={i} className="bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-6 hover:border-[#6366f1]/50 transition-all animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white" style={{ background: f.color }}>
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-[#9090a8] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* VIP Tiers Preview */}
      <div className="text-center mb-10">
        <h2 className="text-xl font-bold mb-2 inline-flex items-center gap-2">
          <Crown size={22} className="text-[#f59e0b]" /> {t("vip.title")}
        </h2>
        <p className="text-sm text-[#9090a8] mb-6">{t("vip.subtitle")}</p>
        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { name: t("vip.freeMember"), price: "¥0", color: "#9090a8", desc: t("vip.free") },
            { name: t("vip.silverSponsor"), price: "¥9.9", color: "#a0a0c0", desc: t("vip.perMonth"), badge: t("vip.mostPopular") },
            { name: t("vip.goldSponsor"), price: "¥29.9", color: "#f59e0b", desc: t("vip.perMonth") },
          ].map((tier, i) => (
            <div key={i} className={`bg-[#1a1a30] border rounded-xl p-4 ${tier.badge ? "border-[#f59e0b]" : "border-[#2a2a44]"}`}>
              {tier.badge && <div className="bg-[#f59e0b] text-black text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-2 -mt-1">{tier.badge}</div>}
              <p className="text-sm font-bold" style={{ color: tier.color }}>{tier.name}</p>
              <p className="text-2xl font-bold mt-1">{tier.price}<span className="text-xs text-[#9090a8]">{tier.desc}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gradient-to-r from-[#6366f1]/10 to-[#22d3ee]/10 border border-[#2a2a44] rounded-2xl p-10 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap size={24} className="text-[#22d3ee]" />
          <h2 className="text-2xl font-bold">{t("home.ctaTitle")}</h2>
        </div>
        <p className="text-[#9090a8] mb-6 max-w-lg mx-auto">{t("home.ctaDesc")}</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#4f46e5] transition-colors">
          {t("home.joinNow")} <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
