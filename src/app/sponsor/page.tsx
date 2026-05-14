"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Crown, Heart, Copy, Check } from "lucide-react";
import Link from "next/link";

const PLANS = [
  { amount: 9.9, name: "银牌赞助 · 月", level: 2, color: "#a0a0c0" },
  { amount: 29.9, name: "金牌赞助 · 月", level: 3, color: "#f59e0b" },
  { amount: 99, name: "金牌赞助 · 年", level: 3, color: "#f59e0b" },
  { amount: 5, name: "小额打赏", level: 0, color: "#6366f1" },
];

export default function SponsorPage() {
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState(29.9);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"choose" | "pay" | "done">("choose");
  const [copied, setCopied] = useState(false);

  const uid = profile?.display_id || 0;
  const payNote = `UID:${uid} ${profile?.username || ""}`;

  async function handlePaid() {
    if (!user) return;
    await supabase.from("sponsors").insert({ user_id: user.id, amount: amount || parseInt(customAmount) || 0, message: message.trim() });
    setStep("done");
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-center mb-2">🤝 赞助 ToolHub</h1>
      <p className="text-sm text-[#9090a8] text-center mb-8">每一份支持都让我们走得更远</p>

      {step === "choose" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {PLANS.map((p, i) => (
              <button key={i} onClick={() => { setAmount(p.amount); setCustomAmount(""); }} className={`p-4 rounded-xl border text-left transition-all ${amount === p.amount ? "ring-2" : "border-[#2a2a44] hover:border-[#6366f1]"}`} style={{ background: amount === p.amount ? `${p.color}10` : "#1a1a30", borderColor: amount === p.amount ? p.color : undefined }}>
                <p className="text-sm font-bold" style={{ color: p.color }}>{p.name}</p>
                <p className="text-2xl font-bold mt-1">¥{p.amount}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="number" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }} className="flex-1 bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1]" placeholder="自定义金额..." min={1} />
            <span className="text-sm text-[#9090a8]">元</span>
          </div>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1]" placeholder="留言（选填，如备注你的需求）" maxLength={100} />
          <button onClick={() => setStep("pay")} className="w-full py-3 bg-gradient-to-r from-[#f59e0b] to-[#6366f1] text-white rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2">
            <Heart size={16} /> 确认赞助 ¥{amount || customAmount || 0}
          </button>
        </div>
      )}

      {step === "pay" && (
        <div className="text-center space-y-6">
          <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-6">
            <p className="text-sm text-[#9090a8] mb-4">赞助金额 <span className="text-white font-bold text-xl">¥{amount || customAmount}</span></p>
            <div className="bg-white rounded-xl p-4 inline-block mb-4">
              <div className="w-48 h-48 bg-[#e0e0e0] rounded-lg flex items-center justify-center text-[#9090a8] text-sm">
                <div className="text-center">
                  <p className="text-4xl mb-2">📱</p>
                  <p>收款码</p>
                  <p className="text-[10px] mt-1">请用支付宝/微信扫码</p>
                  <p className="text-[10px] mt-2 text-black font-mono">备注: {payNote}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 bg-[#12122a] rounded-lg px-3 py-2 text-sm font-mono">
              <span className="text-[#e0e0f0] text-xs">{payNote}</span>
              <button onClick={() => { navigator.clipboard.writeText(payNote); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-[#6366f1] hover:text-[#22d3ee]">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-[#606080] mt-2">支付时务必填写备注，方便管理员确认</p>
          </div>
          <button onClick={handlePaid} className="w-full py-3 bg-[#22c55e] text-white rounded-xl font-bold text-sm hover:bg-[#16a34a]">我已完成支付</button>
          <button onClick={() => setStep("choose")} className="text-sm text-[#9090a8] hover:text-white">← 返回选择</button>
        </div>
      )}

      {step === "done" && (
        <div className="text-center bg-[#1a1a30] border border-[#22c55e]/30 rounded-2xl p-8 space-y-4">
          <Crown className="mx-auto text-[#f59e0b]" size={48} />
          <h2 className="text-xl font-bold">感谢你的赞助！</h2>
          <p className="text-sm text-[#9090a8]">管理员确认后会自动激活你的 VIP 权益，通常 24 小时内生效。</p>
          <Link href="/vip" className="inline-block px-6 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5]">返回会员中心</Link>
        </div>
      )}

      <p className="text-center text-xs text-[#606080] mt-8">
        <Link href="/vip" className="hover:text-[#9090a8]">← 返回会员中心</Link>
      </p>
    </div>
  );
}
