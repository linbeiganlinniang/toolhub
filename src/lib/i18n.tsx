"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import zh, { type Translations } from "@/lib/translations/zh";
import en from "@/lib/translations/en";

const translations: Record<string, Translations> = { zh, en };
const supportedLocales = ["zh", "en"] as const;
type Locale = (typeof supportedLocales)[number];

interface I18nState {
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: string) => void;
}

const I18nContext = createContext<I18nState>({
  locale: "zh",
  t: (key: string) => key,
  setLocale: () => {},
});

export function useTranslation() {
  return useContext(I18nContext);
}

function detectLanguage(): Locale {
  if (typeof window === "undefined") return "zh";

  // 1. URL parameter override
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get("lang");
  if (langParam && supportedLocales.includes(langParam as Locale)) {
    return langParam as Locale;
  }

  // 2. localStorage
  try {
    const stored = localStorage.getItem("toolhub-lang");
    if (stored && supportedLocales.includes(stored as Locale)) {
      return stored as Locale;
    }
  } catch {}

  // 3. navigator.language
  const navLang = navigator.language.toLowerCase();
  if (navLang.startsWith("zh")) return "zh";
  if (navLang.startsWith("en")) return "en";

  return "zh";
}

// Resolve nested keys like "nav.forum" or "tools.json.format"
function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const keys = path.split(".");
  let current: any = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }
  return typeof current === "string" ? current : undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    setLocaleState(detectLanguage());
  }, []);

  const setLocale = useCallback((lang: string) => {
    if (supportedLocales.includes(lang as Locale)) {
      setLocaleState(lang as Locale);
      try {
        localStorage.setItem("toolhub-lang", lang);
      } catch {}
      // Update URL without reload
      const url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[locale];
      let value = getNestedValue(dict as unknown as Record<string, any>, key);
      if (value == null) {
        // Fallback to zh
        value = getNestedValue(zh as unknown as Record<string, any>, key);
      }
      if (value == null) return key;

      // Simple template replacement {{var}}
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, name) => String(params[name] ?? `{{${name}}}`));
      }
      return value;
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}
