"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

type ToolName = "json" | "base64" | "timestamp" | "color" | "qrcode" | "md5";

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolName>("json");
  const [copied, setCopied] = useState<string | null>(null);

  // JSON
  const [jsonInput, setJsonInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");

  // Base64
  const [b64Input, setB64Input] = useState("");
  const [b64Output, setB64Output] = useState("");
  const [b64Mode, setB64Mode] = useState<"encode" | "decode">("encode");

  // Timestamp
  const [tsInput, setTsInput] = useState("");
  const [tsOutput, setTsOutput] = useState("");

  // Color
  const [hexInput, setHexInput] = useState("#6366f1");
  const [rgbOutput, setRgbOutput] = useState("");

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleJsonFormat() {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(obj, null, 2));
    } catch {
      setJsonOutput("❌ JSON 格式错误");
    }
  }

  function handleBase64() {
    try {
      if (b64Mode === "encode") {
        setB64Output(btoa(unescape(encodeURIComponent(b64Input))));
      } else {
        setB64Output(decodeURIComponent(escape(atob(b64Input))));
      }
    } catch {
      setB64Output("❌ 输入无效");
    }
  }

  function handleTimestamp() {
    const v = tsInput.trim();
    if (!v) { setTsOutput(""); return; }
    const n = parseInt(v);
    if (!isNaN(n) && v.length >= 10) {
      const ms = v.length === 10 ? n * 1000 : n;
      const d = new Date(ms);
      setTsOutput(d.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }));
    } else {
      const d = new Date(v);
      if (isNaN(d.getTime())) { setTsOutput("❌ 格式错误"); return; }
      setTsOutput(Math.floor(d.getTime() / 1000).toString());
    }
  }

  function handleColor() {
    const h = hexInput.trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(h)) { setRgbOutput("❌ 请输入 #RRGGBB 格式"); return; }
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    setRgbOutput(`rgb(${r}, ${g}, ${b}) · hsl(${Math.round(r/2.55)}, ${Math.round(g/2.55)}%, ${Math.round(b/2.55)}%)`);
  }

  const tools: { id: ToolName; name: string; icon: string; desc: string }[] = [
    { id: "json", name: "JSON 格式化", icon: "{ }", desc: "美化、压缩、校验 JSON" },
    { id: "base64", name: "Base64 编解码", icon: "64", desc: "编码和解码 Base64 文本" },
    { id: "timestamp", name: "时间戳转换", icon: "🕐", desc: "Unix 时间戳 ↔ 日期" },
    { id: "color", name: "颜色转换", icon: "🎨", desc: "HEX ↔ RGB ↔ HSL" },
    { id: "md5", name: "MD5 加密", icon: "🔐", desc: "文本 MD5 哈希" },
    { id: "qrcode", name: "二维码生成", icon: "📱", desc: "文本转二维码" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🔧 在线工具</h1>

      {/* 工具选择 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTool === t.id ? "bg-[#6366f1] text-white" : "bg-[#1a1a30] border border-[#2a2a44] text-[#9090a8] hover:text-white hover:border-[#6366f1]"
            }`}
          >
            <span>{t.icon}</span> {t.name}
          </button>
        ))}
      </div>

      {/* 工具面板 */}
      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-6 animate-fade-in">
        {/* JSON */}
        {activeTool === "json" && (
          <div className="space-y-4">
            <h2 className="font-semibold">📋 JSON 格式化</h2>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-32 bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-[#6366f1] resize-none"
              placeholder='{"hello": "world"}'
            />
            <div className="flex gap-2">
              <button onClick={handleJsonFormat} className="px-4 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5]">格式化</button>
              <button onClick={() => { try { setJsonOutput(JSON.stringify(JSON.parse(jsonInput))); } catch { setJsonOutput("❌ 格式错误"); } }} className="px-4 py-2 border border-[#3a3a50] text-sm rounded-lg hover:border-[#6366f1]">压缩</button>
            </div>
            <div className="relative">
              <textarea readOnly value={jsonOutput} className="w-full h-40 bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm font-mono text-[#22c55e] resize-none" />
              {jsonOutput && !jsonOutput.startsWith("❌") && (
                <button onClick={() => copyText(jsonOutput, "json")} className="absolute top-2 right-2 p-1.5 rounded bg-[#2a2a44] hover:bg-[#6366f1] transition-colors">
                  {copied === "json" ? <Check size={14} className="text-[#22c55e]" /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Base64 */}
        {activeTool === "base64" && (
          <div className="space-y-4">
            <h2 className="font-semibold">🔣 Base64 编解码</h2>
            <div className="flex gap-2">
              <button onClick={() => setB64Mode("encode")} className={`px-4 py-1.5 rounded-lg text-sm ${b64Mode === "encode" ? "bg-[#6366f1] text-white" : "border border-[#3a3a50]"}`}>编码</button>
              <button onClick={() => setB64Mode("decode")} className={`px-4 py-1.5 rounded-lg text-sm ${b64Mode === "decode" ? "bg-[#6366f1] text-white" : "border border-[#3a3a50]"}`}>解码</button>
            </div>
            <textarea value={b64Input} onChange={(e) => setB64Input(e.target.value)} className="w-full h-24 bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-[#6366f1] resize-none" placeholder={b64Mode === "encode" ? "输入要编码的文本..." : "输入 Base64 字符串..."} />
            <button onClick={handleBase64} className="px-4 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5]">{b64Mode === "encode" ? "编码" : "解码"}</button>
            <div className="relative">
              <textarea readOnly value={b64Output} className="w-full h-24 bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm font-mono text-[#22c55e] resize-none" />
              {b64Output && !b64Output.startsWith("❌") && (
                <button onClick={() => copyText(b64Output, "b64")} className="absolute top-2 right-2 p-1.5 rounded bg-[#2a2a44] hover:bg-[#6366f1] transition-colors">
                  {copied === "b64" ? <Check size={14} className="text-[#22c55e]" /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        {activeTool === "timestamp" && (
          <div className="space-y-4">
            <h2 className="font-semibold">🕐 时间戳转换</h2>
            <input
              type="text"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTimestamp()}
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-[#6366f1]"
              placeholder="输入 Unix 时间戳 或 日期 (2026-05-14)..."
            />
            <div className="flex gap-2">
              <button onClick={handleTimestamp} className="px-4 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5]">转换</button>
              <button onClick={() => { setTsInput(Math.floor(Date.now() / 1000).toString()); handleTimestamp(); }} className="px-4 py-2 border border-[#3a3a50] text-sm rounded-lg hover:border-[#6366f1] flex items-center gap-1">
                <RefreshCw size={14} /> 当前时间
              </button>
            </div>
            <div className="relative">
              <input readOnly value={tsOutput} className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm font-mono text-[#22c55e]" />
              {tsOutput && !tsOutput.startsWith("❌") && (
                <button onClick={() => copyText(tsOutput, "ts")} className="absolute top-2 right-2 p-1.5 rounded bg-[#2a2a44] hover:bg-[#6366f1] transition-colors">
                  {copied === "ts" ? <Check size={14} className="text-[#22c55e]" /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Color */}
        {activeTool === "color" && (
          <div className="space-y-4">
            <h2 className="font-semibold">🎨 颜色转换</h2>
            <div className="flex items-center gap-3">
              <input type="color" value={hexInput} onChange={(e) => { setHexInput(e.target.value); setTimeout(handleColor, 50); }} className="w-12 h-12 rounded-lg border-0 cursor-pointer bg-transparent" />
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                className="flex-1 bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-[#6366f1]"
                placeholder="#6366f1"
              />
              <button onClick={handleColor} className="px-4 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5]">转换</button>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-16 rounded-lg border border-[#2a2a44]" style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(hexInput) ? hexInput : "#1a1a30" }} />
              <div className="flex-[2] relative">
                <input readOnly value={rgbOutput} className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm font-mono text-[#22c55e]" />
                {rgbOutput && !rgbOutput.startsWith("❌") && (
                  <button onClick={() => copyText(rgbOutput, "color")} className="absolute top-2 right-2 p-1.5 rounded bg-[#2a2a44] hover:bg-[#6366f1] transition-colors">
                    {copied === "color" ? <Check size={14} className="text-[#22c55e]" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MD5 */}
        {activeTool === "md5" && (
          <div className="space-y-4">
            <h2 className="font-semibold">🔐 MD5 哈希</h2>
            <textarea
              id="md5Input"
              className="w-full h-24 bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-[#6366f1] resize-none"
              placeholder="输入要加密的文本..."
            />
            <button onClick={async () => {
              const input = (document.getElementById("md5Input") as HTMLTextAreaElement)?.value || "";
              const msgUint8 = new TextEncoder().encode(input);
              const hashBuffer = await crypto.subtle.digest("MD5", msgUint8).catch(() => null);
              if (!hashBuffer) {
                (document.getElementById("md5Output") as HTMLTextAreaElement).value = "❌ MD5 不支持（浏览器限制），请使用 SHA-256：";
                const shaBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
                const shaArray = Array.from(new Uint8Array(shaBuffer));
                (document.getElementById("md5Output") as HTMLTextAreaElement).value += "\nSHA-256: " + shaArray.map(b => b.toString(16).padStart(2, "0")).join("");
                return;
              }
              const hashArray = Array.from(new Uint8Array(hashBuffer));
              (document.getElementById("md5Output") as HTMLTextAreaElement).value = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
            }} className="px-4 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5]">生成哈希</button>
            <div className="relative">
              <textarea readOnly id="md5Output" className="w-full h-24 bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm font-mono text-[#22c55e] resize-none" />
            </div>
          </div>
        )}

        {/* QR Code */}
        {activeTool === "qrcode" && (
          <div className="space-y-4">
            <h2 className="font-semibold">📱 二维码生成</h2>
            <input
              id="qrInput"
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-[#6366f1]"
              placeholder="输入网址或文本..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = (e.target as HTMLInputElement).value;
                  (document.getElementById("qrImg") as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(v)}`;
                }
              }}
            />
            <button onClick={() => {
              const v = (document.getElementById("qrInput") as HTMLInputElement)?.value || "";
              (document.getElementById("qrImg") as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(v)}`;
            }} className="px-4 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5]">生成二维码</button>
            <div className="flex justify-center">
              <img id="qrImg" alt="QR Code" className="w-48 h-48 rounded-lg bg-white p-2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
