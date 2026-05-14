"use client";

import { useEffect, useState } from "react";
import { supabase, Tool } from "@/lib/supabase";
import { Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("全部");

  useEffect(() => {
    supabase
      .from("tools")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setTools(data || []);
        setLoading(false);
      });
  }, []);

  const categories = ["全部", ...Array.from(new Set(tools.map((t) => t.category)))];
  const filtered = category === "全部" ? tools : tools.filter((t) => t.category === category);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#6366f1]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🔧 在线工具</h1>

      {/* 分类筛选 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              category === cat ? "bg-[#6366f1] text-white" : "bg-[#1a1a30] text-[#9090a8] hover:text-white border border-[#2a2a44]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 工具卡片 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool, i) => (
          <div
            key={tool.id}
            className="bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-5 hover:border-[#6366f1]/50 hover:bg-[#1e1e36] transition-all animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="text-3xl mb-3">{tool.icon}</div>
            <h3 className="font-semibold mb-1">{tool.name}</h3>
            <p className="text-xs text-[#9090a8] mb-3 line-clamp-2">{tool.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2a44] text-[#9090a8]">
                {tool.category}
              </span>
              {tool.url ? (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#6366f1] hover:text-[#22d3ee] transition-colors"
                >
                  打开 <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-xs text-[#606080]">即将上线</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[#9090a8]">
          <p>暂无工具</p>
        </div>
      )}
    </div>
  );
}
