"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Crown, Heart, Copy, Check, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";

const PLANS = [
  { amount: 9.9, name: "银牌赞助 · 月", level: 2, desc: "VIP 银色徽章 + 10MB 上传", color: "#a0a0c0" },
  { amount: 29.9, name: "金牌赞助 · 月", level: 3, desc: "金色徽章 + 50MB 上传 + 专属特权", color: "#f59e0b" },
  { amount: 99, name: "金牌赞助 · 年", level: 3, desc: "金牌年付 (省 60%)", color: "#f59e0b" },
  { amount: 5, name: "小额打赏", level: 0, desc: "随缘支持，心意到了就行", color: "#6366f1" },
];

const PAYONEER_LINK = process.env.NEXT_PUBLIC_PAYONEER_LINK || "https://payoneer.com";

export default function SponsorPage() {
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState(29.9);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"choose" | "pay" | "done">("choose");
  const [copied, setCopied] = useState(false);

  const uid = profile?.display_id || 0;
  const payNote = `ToolHub-UID${uid}`;
  const finalAmount = amount || parseInt(customAmount) || 0;

  async function handlePaid() {
    if (!user) return;
    await supabase.from("sponsors").insert({
      user_id: user.id,
      amount: finalAmount,
      message: message.trim(),
    });
    setStep("done");
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-center mb-2">🤝 赞助 ToolHub</h1>
      <p className="text-sm text-[#9090a8] text-center mb-2">每一份支持都让我们走得更远</p>
      {!PAYONEER_LINK || PAYONEER_LINK === "https://payoneer.com" ? (
        <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-3 mb-6 flex items-start gap-2 text-sm text-[#f59e0b]">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>管理员暂未配置 Payoneer 收款链接。请联系 UID:10001。</span>
        </div>
      ) : null}

      {step === "choose" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {PLANS.map((p, i) => (
              <button key={i} onClick={() => { setAmount(p.amount); setCustomAmount(""); }}
                className="p-4 rounded-xl border text-left transition-all"
                style={{
                  background: amount === p.amount ? `${p.color}15` : "#1a1a30",
                  borderColor: amount === p.amount ? p.color : "#2a2a44",
                }}>
                <p className="text-sm font-bold" style={{ color: p.color }}>{p.name}</p>
                <p className="text-2xl font-bold mt-1">¥{p.amount}</p>
                <p className="text-[10px] text-[#9090a8] mt-1">{p.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="number" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
              className="flex-1 bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1]" placeholder="自定义金额..." min={1} />
            <span className="text-sm text-[#9090a8]">元</span>
          </div>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1]"
            placeholder="留言（选填，可备注你的需求）" maxLength={100} />
          <button onClick={() => setStep("pay")}
            className="w-full py-3 bg-gradient-to-r from-[#f59e0b] to-[#6366f1] text-white rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2"
            disabled={!PAYONEER_LINK || PAYONEER_LINK === "https://payoneer.com"}>
            <Heart size={16} /> 确认赞助 ¥{finalAmount}
          </button>
        </div>
      )}

      {step === "pay" && (
        <div className="text-center space-y-6">
          <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-6">
            <p className="text-sm text-[#9090a8] mb-4">
              赞助金额 <span className="text-white font-bold text-xl">¥{finalAmount}</span>
            </p>

            {/* Payoneer link */}
            <a href={PAYONEER_LINK} target="_blank" rel="noopener noreferrer"
              className="block w-full py-4 bg-[#22c55e] text-white rounded-xl font-bold text-sm hover:bg-[#16a34a] transition-colors mb-4 flex items-center justify-center gap-2">
              <ExternalLink size={16} /> 前往 Payoneer 支付
            </a>

            <div className="bg-[#12122a] rounded-lg p-4 text-left space-y-3 text-sm">
              <p className="text-[#c0c0d8] font-medium">📋 支付步骤：</p>
              <ol className="list-decimal list-inside space-y-2 text-[#9090a8] text-xs">
                <li>点击上方按钮跳转 Payoneer 支付页面</li>
                <li>输入金额 <strong className="text-white">USD ${(finalAmount / 7.2).toFixed(2)}</strong>（≈ ¥{finalAmount}）</li>
                <li>
                  附言 / 备注填写：
                  <button onClick={() => { navigator.clipboard.writeText(payNote); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 bg-[#2a2a44] rounded text-[#22d3ee] font-mono hover:bg-[#6366f1] hover:text-white">
                    {payNote} {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </li>
                <li>完成支付后回到本页面，点击下方按钮</li>
              </ol>
            </div>
          </div>
          <button onClick={handlePaid}
            className="w-full py-3 bg-[#6366f1] text-white rounded-xl font-bold text-sm hover:bg-[#4f46e5]">
            我已完成支付
          </button>
          <button onClick={() => setStep("choose")} className="text-sm text-[#9090a8] hover:text-white">← 返回选择</button>
        </div>
      )}

      {step === "done" && (
        <div className="text-center bg-[#1a1a30] border border-[#22c55e]/30 rounded-2xl p-8 space-y-4">
          <Crown className="mx-auto text-[#f59e0b]" size={48} />
          <h2 className="text-xl font-bold">感谢你的赞助！</h2>
          <p className="text-sm text-[#9090a8]">
            管理员确认后会自动激活你的 VIP 权益。<br />
            通常 24 小时内生效。如有疑问请联系 UID:10001。
          </p>
          <Link href="/vip" className="inline-block px-6 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5]">
            返回会员中心
          </Link>
        </div>
      )}

      {/* 管理员说明 */}
      <details className="mt-6 text-xs text-[#606080] bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-4">
        <summary className="cursor-pointer hover:text-[#9090a8]">⚙️ 管理员配置说明</summary>
        <div className="mt-3 space-y-2">
          <p>设置 Netlify 环境变量 <code className="bg-[#12122a] px-1 rounded text-[#22d3ee]">NEXT_PUBLIC_PAYONEER_LINK</code> 为你的 Payoneer Request Payment 链接：</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>登录 Payoneer → 收款 → Request a Payment</li>
            <li>生成付款请求链接</li>
            <li>粘贴到 Netlify 环境变量中</li>
            <li>重新部署即可激活赞助按钮</li>
          </ol>
        </div>
      </details>

      <p className="text-center text-xs text-[#606080] mt-8">
        <Link href="/vip" className="hover:text-[#9090a8]">← 返回会员中心</Link>
      </p>
    </div>
  );
}
