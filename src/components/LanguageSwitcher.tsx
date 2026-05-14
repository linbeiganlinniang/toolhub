"use client";

import { useTranslation } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  const nextLang = locale === "zh" ? "en" : "zh";

  return (
    <button
      onClick={() => setLocale(nextLang)}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-[#b0b0c8] hover:text-white hover:bg-[#2a2a44] transition-colors"
      title={locale === "zh" ? "Switch to English" : "切换到中文"}
    >
      <span className="text-base">{locale === "zh" ? "🇨🇳" : "🇺🇸"}</span>
      <span className="hidden sm:inline text-xs">{locale === "zh" ? "中" : "EN"}</span>
    </button>
  );
}
