import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ToolHub",
  description: "一站式工具集合 + 实时互动社区",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
