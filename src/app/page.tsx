import Link from "next/link";
import { MessageSquare, Wrench, Zap, Users, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16 animate-fade-in">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-[#6366f1] via-[#a78bfa] to-[#22d3ee] bg-clip-text text-transparent">
          ToolHub
        </h1>
        <p className="text-xl text-[#9090a8] max-w-2xl mx-auto">
          一站式工具集合 + 实时互动社区。工具趁手，聊得尽兴。
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link href="/tools" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#4f46e5] transition-colors shadow-lg shadow-[#6366f1]/25">
            <Wrench size={20} /> 探索工具
          </Link>
          <Link href="/forum" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#3a3a50] text-[#c0c0d8] font-medium hover:bg-[#2a2a44] transition-colors">
            <MessageSquare size={20} /> 进入论坛
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid sm:grid-cols-3 gap-6 mb-16">
        {[
          { icon: <Wrench size={28} />, title: "实用工具", desc: "JSON 格式化、Base64、时间戳转换…更多工具持续添加", color: "#6366f1" },
          { icon: <MessageSquare size={28} />, title: "实时论坛", desc: "分板块讨论，板块内实时群聊，消息即时送达", color: "#22d3ee" },
          { icon: <Users size={28} />, title: "社区互动", desc: "发帖、回复、实时聊天，技术宅的快乐老家", color: "#a78bfa" },
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

      {/* CTA */}
      <div className="text-center bg-gradient-to-r from-[#6366f1]/10 to-[#22d3ee]/10 border border-[#2a2a44] rounded-2xl p-10 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap size={24} className="text-[#22d3ee]" />
          <h2 className="text-2xl font-bold">免费 · 开源 · 零成本上线</h2>
        </div>
        <p className="text-[#9090a8] mb-6 max-w-lg mx-auto">
          基于 Cloudflare + Vercel + Supabase 构建，免费额度足够支撑数千用户。
        </p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#4f46e5] transition-colors">
          立即加入 <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
