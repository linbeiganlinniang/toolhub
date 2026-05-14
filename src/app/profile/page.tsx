"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, LogOut } from "lucide-react";
import Link from "next/link";

const PANDA_AVATARS = [
  ...["🐼","🐻‍❄️","🐨","🐮","🐷","🐸","🐵","🐶","🐱","🦊","🐰","🐹","🐭","🐯","🐻","🦁","🐔","🐧","🐦","🐤","🦄","🐴","🐌","🐛","🦋","🐞","🐙","🦀","🐠","🐳"],
  ...["😀","😎","🤩","😇","🤪","😜","🤓","🧐","😤","😈","👻","💀","👽","🤖","🎃","🤡","👺","😺","🫠","🥳","🫡","🤠","🥸","😶‍🌫️","🫥","😏","🤯","🥶","🤗","🫣"],
  ...["🔥","💯","⚡","🌟","💎","🎯","🚀","🎸","🎮","🍕","🌈","🍀","💩","❤️","💙","💚","💛","🧡","💜","🖤"]
];

const BG_COLORS = ["#6366f1","#22d3ee","#f43f5e","#f59e0b","#22c55e","#a78bfa","#ec4899","#14b8a6","#f97316","#8b5cf6"];

function avatarUrl(emoji: string, bg: string): string {
  return btoa(JSON.stringify({ emoji, bg }));
}
function parseAvatar(raw: string): { emoji: string; bg: string } {
  try { const d = JSON.parse(atob(raw)); if (d.emoji) return d; } catch {}
  if (raw.startsWith('http')) return { emoji: "🐼", bg: "#6366f1" };
  return { emoji: "🐼", bg: "#6366f1" };
}

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🐼");
  const [selectedBg, setSelectedBg] = useState("#6366f1");
  const [showAvatars, setShowAvatars] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setGender(profile.gender || "");
      setAge(profile.age?.toString() || "");
      setWebsite(profile.website || "");
      setLocation(profile.location || "");
      if (profile.avatar_url) {
        const p = parseAvatar(profile.avatar_url);
        setSelectedEmoji(p.emoji);
        setSelectedBg(p.bg);
      }
    }
  }, [profile, authLoading, user]);

  if (authLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#6366f1]" size={32} /></div>;
  if (!user) return null;

  async function handleSave() {
    setSaving(true); setMessage("");
    const av = avatarUrl(selectedEmoji, selectedBg);
    const { error } = await updateProfile({ username: username.trim(), bio: bio.trim(), gender, age: age ? parseInt(age) : null, website: website.trim(), location: location.trim(), avatar_url: av });
    setMessage(error ? "❌ " + error : "✅ 保存成功！");
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-2">👤 个人资料</h1>
      {profile?.display_id && <p className="text-sm text-[#22d3ee] font-mono mb-6">UID: {profile.display_id}</p>}

      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowAvatars(!showAvatars)} className="flex-shrink-0 relative group">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border-2 border-[#3a3a50] hover:border-[#6366f1] transition-colors" style={{ background: selectedBg }}>
              {selectedEmoji}
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-[#2a2a44] px-2 py-0.5 rounded-full text-[#9090a8]">更换</span>
          </button>
          <div>
            <p className="text-sm font-medium">点击头像更换</p>
            <p className="text-[10px] text-[#606080]">90 种熊猫头 & 表情可选</p>
          </div>
        </div>

        {showAvatars && (
          <div className="border border-[#2a2a44] rounded-xl p-4 space-y-3 animate-fade-in">
            <p className="text-xs text-[#9090a8]">选颜色</p>
            <div className="flex gap-2 flex-wrap">
              {BG_COLORS.map(c => (
                <button key={c} onClick={() => setSelectedBg(c)} className="w-8 h-8 rounded-full border-2 transition-colors" style={{ background: c, borderColor: selectedBg === c ? "#fff" : "transparent" }} />
              ))}
            </div>
            <p className="text-xs text-[#9090a8]">选头像</p>
            <div className="grid grid-cols-10 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {PANDA_AVATARS.map(e => (
                <button key={e} onClick={() => { setSelectedEmoji(e); setShowAvatars(false); }} className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${selectedEmoji === e ? "bg-white/20 ring-2 ring-white" : "hover:bg-white/10"}`} title={e}>
                  {e}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAvatars(false)} className="text-xs text-[#9090a8] hover:text-white w-full text-center py-1">关闭面板</button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs text-[#9090a8] mb-1">昵称</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]" maxLength={30} /></div>
          <div><label className="block text-xs text-[#9090a8] mb-1">性别</label><select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]"><option value="">不透露</option><option value="男">男</option><option value="女">女</option><option value="其他">其他</option></select></div>
          <div><label className="block text-xs text-[#9090a8] mb-1">年龄</label><input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]" min={1} max={150} placeholder="选填" /></div>
          <div><label className="block text-xs text-[#9090a8] mb-1">位置</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]" placeholder="城市 / 地区" /></div>
        </div>

        <div><label className="block text-xs text-[#9090a8] mb-1">个人网站</label><input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]" placeholder="https://your-site.com" /></div>
        <div><label className="block text-xs text-[#9090a8] mb-1">个人简介</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1] resize-none" rows={3} maxLength={200} placeholder="介绍一下自己..." /><p className="text-[10px] text-[#606080] text-right mt-1">{bio.length}/200</p></div>

        {message && <div className={`text-sm rounded-lg px-4 py-2 ${message.startsWith("✅") ? "bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]" : "bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e]"}`}>{message}</div>}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-[#6366f1] text-white rounded-lg font-medium hover:bg-[#4f46e5] disabled:opacity-50 transition-colors">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 保存</button>
          <button onClick={() => { signOut(); router.push("/"); }} className="flex items-center gap-2 px-6 py-2.5 border border-[#3a3a50] text-[#9090a8] rounded-lg hover:text-white hover:border-[#6366f1] transition-colors"><LogOut size={16} /> 退出登录</button>
        </div>
      </div>
      <p className="text-center text-xs text-[#606080] mt-6"><Link href="/forum" className="hover:text-[#9090a8]">← 返回论坛</Link></p>
    </div>
  );
}
