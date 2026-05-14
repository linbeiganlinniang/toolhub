"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Wrench, MessageSquare, LogIn, LogOut, Users, UserCircle, Crown } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#16162a] border-b border-[#2a2a44] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#22d3ee] bg-clip-text text-transparent">ToolHub</Link>
          <div className="hidden sm:flex items-center gap-1">
            <Link href="/forum" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors"><MessageSquare size={16} /> {t("nav.forum")}</Link>
            <Link href="/tools" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors"><Wrench size={16} /> {t("nav.tools")}</Link>
            {user && (<>
              <Link href="/friends" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors"><Users size={16} /> {t("nav.friends")}</Link>
              <Link href="/vip" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#f59e0b] hover:bg-[#2a2a44] transition-colors"><Crown size={16} /> {t("nav.vip")}</Link>
            </>)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-[#2a2a44] transition-colors">
              <UserAvatar url={profile?.avatar_url || null} size={28} />
              <span className="hidden sm:inline text-[#c0c0d8]">{profile?.username || "用户"}</span>
            </button>
          ) : (
            <Link href="/auth/login" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#6366f1] text-white text-sm hover:bg-[#4f46e5] transition-colors"><LogIn size={16} /> {t("nav.login")}</Link>
          )}
          {menuOpen && user && (
            <div className="absolute right-0 top-12 w-48 bg-[#1e1e32] border border-[#2a2a44] rounded-lg shadow-xl overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-[#2a2a44]"><p className="text-sm font-medium">{profile?.username}</p><p className="text-xs text-[#9090a8]">{user.email}</p></div>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#c0c0d8] hover:bg-[#2a2a44] transition-colors"><UserCircle size={16} /> {t("nav.profile")}</Link>
              <button onClick={() => { signOut(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#f43f5e] hover:bg-[#2a2a44] transition-colors"><LogOut size={16} /> {t("nav.logout")}</button>
            </div>
          )}
        </div>
      </div>
      <div className="sm:hidden flex border-t border-[#2a2a44]">
        <Link href="/forum" className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors"><MessageSquare size={14} /> {t("nav.forum")}</Link>
        <Link href="/tools" className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors"><Wrench size={14} /> {t("nav.tools")}</Link>
        {user && (<>
          <Link href="/friends" className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors"><Users size={14} /> {t("nav.friends")}</Link>
          <Link href="/vip" className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors"><Crown size={14} /> {t("nav.vip")}</Link>
        </>)}
      </div>
    </nav>
  );
}
