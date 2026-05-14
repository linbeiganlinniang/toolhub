"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Camera, Save, LogOut } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
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
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile, authLoading, user]);

  if (authLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#6366f1]" size={32} /></div>;
  if (!user) return null;

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const { error } = await updateProfile({
      username: username.trim(),
      bio: bio.trim(),
      gender,
      age: age ? parseInt(age) : null,
      website: website.trim(),
      location: location.trim(),
      avatar_url: avatarUrl.trim() || undefined,
    });
    setMessage(error ? "❌ " + error : "✅ 保存成功！");
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-2">👤 个人资料</h1>
      {profile?.display_id && (
        <p className="text-sm text-[#22d3ee] font-mono mb-6">UID: {profile.display_id}</p>
      )}

      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-6 space-y-6">
        {/* 头像 */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              username?.[0]?.toUpperCase() || "U"
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#9090a8] mb-1">头像 URL</p>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#9090a8] mb-1">昵称</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]"
              maxLength={30}
            />
          </div>
          <div>
            <label className="block text-xs text-[#9090a8] mb-1">性别</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]"
            >
              <option value="">不透露</option>
              <option value="男">男</option>
              <option value="女">女</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#9090a8] mb-1">年龄</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]"
              min={1}
              max={150}
              placeholder="选填"
            />
          </div>
          <div>
            <label className="block text-xs text-[#9090a8] mb-1">位置</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]"
              placeholder="城市 / 地区"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#9090a8] mb-1">个人网站</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]"
            placeholder="https://your-site.com"
          />
        </div>

        <div>
          <label className="block text-xs text-[#9090a8] mb-1">个人简介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1] resize-none"
            rows={3}
            maxLength={200}
            placeholder="介绍一下自己..."
          />
          <p className="text-[10px] text-[#606080] text-right mt-1">{bio.length}/200</p>
        </div>

        {message && (
          <div className={`text-sm rounded-lg px-4 py-2 ${message.startsWith("✅") ? "bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]" : "bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e]"}`}>
            {message}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6366f1] text-white rounded-lg font-medium hover:bg-[#4f46e5] disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            保存
          </button>
          <button
            onClick={() => { signOut(); router.push("/"); }}
            className="flex items-center gap-2 px-6 py-2.5 border border-[#3a3a50] text-[#9090a8] rounded-lg hover:text-white hover:border-[#6366f1] transition-colors"
          >
            <LogOut size={16} /> 退出登录
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-[#606080] mt-6">
        <Link href="/forum" className="hover:text-[#9090a8]">← 返回论坛</Link>
      </p>
    </div>
  );
}
