"use client";

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, Board } from "@/lib/supabase";
import { Hash, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function ForumPage() {
  const { t } = useTranslation();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("boards")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setBoards(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#6366f1]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("forum.title")}</h1>
      <div className="grid gap-3">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/forum/${board.id}`}
            className="flex items-center gap-4 bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-5 hover:border-[#6366f1]/50 hover:bg-[#1e1e36] transition-all animate-fade-in"
          >
            <span className="text-3xl">{board.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{board.name}</h3>
              {board.description && (
                <p className="text-sm text-[#9090a8] truncate">{board.description}</p>
              )}
            </div>
            <Hash size={16} className="text-[#6361f1] opacity-50" />
          </Link>
        ))}
        {boards.length === 0 && (
          <div className="text-center py-12 text-[#9090a8]">
            <p>{t("forum.noBoards")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
