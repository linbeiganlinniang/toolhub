"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, UserCheck, UserX, EyeOff, Clock, Search, Hash } from "lucide-react";
import Link from "next/link";

interface ProfileInfo {
  id: string;
  username: string;
  avatar_url: string | null;
  display_id: number | null;
}

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
}

interface FriendshipWithProfile extends Friendship {
  profile: ProfileInfo;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<FriendshipWithProfile[]>([]);
  const [requests, setRequests] = useState<FriendshipWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"name" | "id">("name");
  const [searchResults, setSearchResults] = useState<ProfileInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<"friends" | "requests">("friends");
  const [actionMsg, setActionMsg] = useState("");
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    setLoading(true);

    // 所有关联我的 friendships
    const { data: all } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (!all) { setLoading(false); return; }

    // 收集所有对方 ID
    const otherIds = all.map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id);
    const uniqueIds = [...new Set(otherIds)];

    // 批量查 profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, display_id")
      .in("id", uniqueIds);

    const profileMap: Record<string, ProfileInfo> = {};
    (profiles || []).forEach(p => { profileMap[p.id] = p; });

    const enriched = all.map(f => ({
      ...f,
      profile: profileMap[f.requester_id === user.id ? f.addressee_id : f.requester_id] || { id: "", username: "未知", avatar_url: null, display_id: null }
    }));

    setFriends(enriched.filter(f => f.status === "accepted"));
    setRequests(enriched.filter(f => f.status === "pending" && f.addressee_id === user.id));
    setLoading(false);
  }

  async function handleSearch() {
    if (!searchQuery.trim() || !user) return;
    setSearching(true);
    const q = searchQuery.trim();
    if (searchMode === "id") {
      const num = parseInt(q);
      if (isNaN(num)) { setSearchResults([]); setSearching(false); return; }
      const { data } = await supabase.from("profiles").select("id,username,avatar_url,display_id").eq("display_id", num).neq("id", user.id).limit(5);
      setSearchResults(data || []);
    } else {
      const { data } = await supabase.from("profiles").select("id,username,avatar_url,display_id").ilike("username", `%${q}%`).neq("id", user.id).limit(10);
      setSearchResults(data || []);
    }
    setSearching(false);
  }

  async function sendRequest(addresseeId: string) {
    if (!user) return;
    const { error } = await supabase.from("friendships").insert({ requester_id: user.id, addressee_id: addresseeId, status: "pending" });
    setActionMsg(error ? (error.message.includes("duplicate") ? "❌ 已发送过申请" : "❌ " + error.message) : "✅ 好友申请已发送！");
    if (!error) setSearchResults(prev => prev.filter(r => r.id !== addresseeId));
    setTimeout(() => setActionMsg(""), 3000);
  }

  async function acceptRequest(friendshipId: string) {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
    setActionMsg("✅ 已接受");
    setTimeout(() => setActionMsg(""), 2000);
    loadData();
  }

  async function rejectRequest(friendshipId: string) {
    await supabase.from("friendships").update({ status: "rejected" }).eq("id", friendshipId);
    loadData();
  }

  function ignoreRequest(friendshipId: string) {
    setIgnoredIds(prev => new Set(prev).add(friendshipId));
  }

  async function removeFriend(friendshipId: string) {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    setActionMsg("已删除");
    setTimeout(() => setActionMsg(""), 2000);
    loadData();
  }

  const visibleRequests = requests.filter(r => !ignoredIds.has(r.id));

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">👥 好友</h1>

      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-4 mb-6">
        <p className="text-sm text-[#9090a8] mb-3">搜索用户并添加好友</p>
        <div className="flex gap-2 mb-2">
          <button onClick={() => setSearchMode("name")} className={`px-3 py-1 rounded text-xs ${searchMode === "name" ? "bg-[#6366f1] text-white" : "border border-[#3a3a50] text-[#9090a8]"}`}>按用户名</button>
          <button onClick={() => setSearchMode("id")} className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${searchMode === "id" ? "bg-[#6366f1] text-white" : "border border-[#3a3a50] text-[#9090a8]"}`}><Hash size={12} /> 按 UID</button>
        </div>
        <div className="flex gap-2">
          <input type={searchMode === "id" ? "number" : "text"} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="flex-1 bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#6366f1]" placeholder={searchMode === "name" ? "搜索用户名..." : "输入 UID 号码..."} />
          <button onClick={handleSearch} disabled={searching} className="px-4 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5] disabled:opacity-50 flex items-center gap-1"><Search size={14} /> 搜索</button>
        </div>

        {actionMsg && <div className={`mt-3 text-sm rounded-lg px-3 py-2 ${actionMsg.startsWith("✅") ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-[#f43f5e]/10 text-[#f43f5e]"}`}>{actionMsg}</div>}

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-[#12122a] rounded-lg px-4 py-3">
                <Link href={`/user/${r.id}`} className="flex items-center gap-3 hover:opacity-80 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-xs font-bold">{r.username?.[0]?.toUpperCase() || "?"}</div>
                  <div><span className="text-sm">{r.username}</span>{r.display_id && <span className="text-[10px] text-[#22d3ee] ml-2 font-mono">UID:{r.display_id}</span>}</div>
                </Link>
                <button onClick={() => sendRequest(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-[#6366f1] text-white rounded-lg text-xs hover:bg-[#4f46e5]"><UserPlus size={12} /> 添加</button>
              </div>
            ))}
          </div>
        )}
        {searchResults.length === 0 && searchQuery && !searching && <p className="text-sm text-[#9090a8] mt-3">未找到用户</p>}
      </div>

      <div className="flex gap-1 bg-[#12122a] rounded-lg p-1 mb-4 w-fit">
        <button onClick={() => setTab("friends")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "friends" ? "bg-[#6366f1] text-white" : "text-[#9090a8] hover:text-white"}`}>我的好友 ({friends.length})</button>
        <button onClick={() => setTab("requests")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "requests" ? "bg-[#6366f1] text-white" : "text-[#9090a8] hover:text-white"}`}>好友请求 ({visibleRequests.length})</button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#6366f1]" size={28} /></div>
      : tab === "friends" ? (
        <div className="space-y-2">
          {friends.length === 0 && <div className="text-center py-12 text-[#9090a8]"><p>还没有好友，上方搜索添加吧</p></div>}
          {friends.map((f) => (
            <div key={f.id} className="flex items-center justify-between bg-[#1a1a30] border border-[#2a2a44] rounded-xl px-4 py-3">
              <Link href={`/user/${f.profile.id}`} className="flex items-center gap-3 hover:opacity-80 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {f.profile?.avatar_url ? <img src={f.profile.avatar_url} className="w-full h-full object-cover" alt="" /> : f.profile?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{f.profile?.username || "未知"} {f.profile?.display_id && <span className="text-[10px] text-[#22d3ee] font-mono">UID:{f.profile.display_id}</span>}</p>
                  <p className="text-[10px] text-[#606080]">好友</p>
                </div>
              </Link>
              <button onClick={() => removeFriend(f.id)} className="p-2 rounded-lg text-[#9090a8] hover:text-[#f43f5e] hover:bg-[#2a2a44] transition-colors" title="删除好友"><UserX size={16} /></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {visibleRequests.length === 0 && <div className="text-center py-12 text-[#9090a8]"><Clock size={40} className="mx-auto mb-3 opacity-50" /><p>暂无待处理的好友请求</p></div>}
          {visibleRequests.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-[#1a1a30] border border-[#2a2a44] rounded-xl px-4 py-3">
              <Link href={`/user/${r.profile.id}`} className="flex items-center gap-3 hover:opacity-80 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-sm font-bold">{r.profile?.username?.[0]?.toUpperCase() || "?"}</div>
                <div>
                  <p className="text-sm font-medium">{r.profile?.username || "未知"} {r.profile?.display_id && <span className="text-[10px] text-[#22d3ee] font-mono">UID:{r.profile.display_id}</span>}</p>
                  <p className="text-[10px] text-[#606080]">请求添加你为好友</p>
                </div>
              </Link>
              <div className="flex gap-1.5">
                <button onClick={() => acceptRequest(r.id)} className="px-3 py-1.5 rounded-lg bg-[#22c55e]/20 text-[#22c55e] text-xs hover:bg-[#22c55e]/30 transition-colors flex items-center gap-1"><UserCheck size={13} /> 同意</button>
                <button onClick={() => rejectRequest(r.id)} className="px-3 py-1.5 rounded-lg bg-[#f43f5e]/20 text-[#f43f5e] text-xs hover:bg-[#f43f5e]/30 transition-colors flex items-center gap-1"><UserX size={13} /> 拒绝</button>
                <button onClick={() => ignoreRequest(r.id)} className="px-3 py-1.5 rounded-lg border border-[#3a3a50] text-[#9090a8] text-xs hover:text-white hover:border-[#6366f1] transition-colors flex items-center gap-1"><EyeOff size={13} /> 忽略</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-center text-xs text-[#606080] mt-8"><Link href="/forum" className="hover:text-[#9090a8]">← 返回论坛</Link></p>
    </div>
  );
}
