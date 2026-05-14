"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Wrench, MessageSquare, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#16162a] border-b border-[#2a2a44] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#22d3ee] bg-clip-text text-transparent">
            ToolHub
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            <Link href="/forum" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors">
              <MessageSquare size={16} /> 论坛
            </Link>
            <Link href="/tools" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors">
              <Wrench size={16} /> 工具
            </Link>
          </div>
        </div>

        <div className="relative">
          {user ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-[#2a2a44] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-xs font-bold">
                {profile?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden sm:inline text-[#c0c0d8]">{profile?.username || "用户"}</span>
            </button>
          ) : (
            <Link href="/auth/login" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#6366f1] text-white text-sm hover:bg-[#4f46e5] transition-colors">
              <LogIn size={16} /> 登录
            </Link>
          )}

          {menuOpen && user && (
            <div className="absolute right-0 top-12 w-48 bg-[#1e1e32] border border-[#2a2a44] rounded-lg shadow-xl overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-[#2a2a44]">
                <p className="text-sm font-medium">{profile?.username}</p>
                <p className="text-xs text-[#9090a8]">{user.email}</p>
              </div>
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#f43f5e] hover:bg-[#2a2a44] transition-colors"
              >
                <LogOut size={16} /> 退出登录
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 移动端导航 */}
      <div className="sm:hidden flex border-t border-[#2a2a44]">
        <Link href="/forum" className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors">
          <MessageSquare size={14} /> 论坛
        </Link>
        <Link href="/tools" className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors">
          <Wrench size={14} /> 工具
        </Link>
      </div>
    </nav>
  );
}
