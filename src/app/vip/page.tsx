"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Crown, Shield, Star, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const TIERS = [
  { level: 1, name: "普通会员", icon: <Star size={24} />, price: 0, color: "#9090a8", features: ["论坛发帖 & 实时聊天","基础在线工具","好友 & 私信","熊猫头头像库","1个 板块聊天"] },
  { level: 2, name: "银牌赞助", icon: <Shield size={24} />, price: 9.9, color: "#a0a0c0", features: ["全部基础功能","🎖️ 银色 VIP 徽章","附件上传 10MB","自定义头像颜色","发起投票","隐藏广告位"] },
  { level: 3, name: "金牌赞助", icon: <Crown size={24} />, price: 29.9, color: "#f59e0b", features: ["全部银牌特权","👑 金色 VIP 徽章","附件上传 50MB","专属个人主页背景","创建私密板块","专属客服通道","优先体验新功能"] },
];

export default function VipPage() {
  const { user, profile } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">💎 ToolHub 会员</h1>
        <p className="text-[#9090a8] text-sm">赞助支持 ToolHub 持续运营，解锁专属特权</p>
      </div>

      {user && profile?.vip_level && profile.vip_level >= 2 ? (
        <div className="bg-gradient-to-r from-[#f59e0b]/10 to-[#6366f1]/10 border border-[#f59e0b]/30 rounded-2xl p-6 mb-8 text-center">
          <Crown className="mx-auto mb-2 text-[#f59e0b]" size={32} />
          <h2 className="text-xl font-bold text-[#f59e0b]">感谢你的赞助！</h2>
          <p className="text-sm text-[#9090a8] mt-1">当前等级：{TIERS.find(t => t.level === profile.vip_level)?.name} · 有效期至 {new Date(profile.vip_expires_at!).toLocaleDateString("zh-CN")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {TIERS.map((tier, i) => (
            <div key={tier.level} className={`bg-[#1a1a30] border rounded-2xl p-6 flex flex-col ${tier.level === 3 ? "border-[#f59e0b] ring-1 ring-[#f59e0b]/30" : "border-[#2a2a44]"}`}>
              {tier.level === 3 && <div className="bg-[#f59e0b] text-black text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-3 -mt-1">最受欢迎</div>}
              <div className="flex items-center gap-2 mb-3" style={{ color: tier.color }}>{tier.icon}<h2 className="font-bold text-lg">{tier.name}</h2></div>
              <div className="mb-4">
                <span className="text-3xl font-bold">¥{tier.price}</span>
                {tier.price > 0 && <span className="text-xs text-[#9090a8]">/月</span>}
                {tier.price === 0 && <span className="text-xs text-[#9090a8]"> 永久免费</span>}
              </div>
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2"><Check size={14} className="text-[#22c55e] mt-0.5 flex-shrink-0" /><span className="text-[#c0c0d8]">{f}</span></li>
                ))}
              </ul>
              {tier.price > 0 ? (
                <Link href="/sponsor" className="w-full py-2.5 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2" style={{ background: tier.color, color: tier.level === 2 ? "#1a1a2e" : "#fff" }}>
                  赞助支持 <ArrowRight size={14} />
                </Link>
              ) : (
                <button disabled className="w-full py-2.5 bg-[#2a2a44] text-[#9090a8] rounded-lg text-sm">默认等级</button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-lg mb-4">🤝 赞助墙</h2>
        <SponsorList />
      </div>

      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-3">❓ 常见问题</h2>
        <div className="space-y-3 text-sm">
          <details className="text-[#9090a8]"><summary className="cursor-pointer text-[#c0c0d8] hover:text-white">如何支付？</summary><p className="mt-1 ml-4">目前支持支付宝 / 微信扫码支付。赞助页面有收款码。</p></details>
          <details className="text-[#9090a8]"><summary className="cursor-pointer text-[#c0c0d8] hover:text-white">赞助后如何激活？</summary><p className="mt-1 ml-4">赞助时备注你的 UID，管理员手动激活。或联系管理员。</p></details>
          <details className="text-[#9090a8]"><summary className="cursor-pointer text-[#c0c0d8] hover:text-white">可以退款吗？</summary><p className="mt-1 ml-4">赞助即支持，原则上不退款。如有特殊情况请联系。</p></details>
          <details className="text-[#9090a8]"><summary className="cursor-pointer text-[#c0c0d8] hover:text-white">赞助的钱花在哪里？</summary><p className="mt-1 ml-4">服务器费用、域名、API 调用费、功能开发和日常维护。</p></details>
        </div>
      </div>
    </div>
  );
}

function SponsorList() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("sponsors").select("*, profiles:user_id(username, display_id)").order("created_at", { ascending: false }).limit(20).then(({ data }) => setSponsors(data || []));
  }, []);
  if (sponsors.length === 0) return <p className="text-sm text-[#9090a8]">暂无赞助记录，成为第一个支持者吧！</p>;
  return (
    <div className="space-y-2">
      {sponsors.map((s: any) => (
        <div key={s.id} className="flex items-center justify-between bg-[#12122a] rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm">{s.profiles?.username || "匿名"}</span>
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
