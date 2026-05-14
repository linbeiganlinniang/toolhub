"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, UserCheck, UserX, Clock, Search, Users } from "lucide-react";
import Link from "next/link";

interface FriendWithProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface FriendshipWithProfile {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  profile: FriendWithProfile;
}

export default function FriendsPage() {
  const { user, profile: me } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<FriendshipWithProfile[]>([]);
  const [requests, setRequests] = useState<FriendshipWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendWithProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<"friends" | "requests">("friends");
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    // 已接受的好友
    const { data: f1 } = await supabase
      .from("friendships")
      .select("*, profile:profiles!friendships_addressee_id_fkey(id,username,avatar_url)")
      .eq("requester_id", user.id)
      .eq("status", "accepted");
    const { data: f2 } = await supabase
      .from("friendships")
      .select("*, profile:profiles!friendships_requester_id_fkey(id,username,avatar_url)")
      .eq("addressee_id", user.id)
      .eq("status", "accepted");
    const all = [...(f1 || []), ...(f2 || [])];
    setFriends(all as any);

    // 待处理请求（别人发来的）
    const { data: r } = await supabase
      .from("friendships")
      .select("*, profile:profiles!friendships_requester_id_fkey(id,username,avatar_url)")
      .eq("addressee_id", user.id)
      .eq("status", "pending");
    setRequests((r || []) as any);
    setLoading(false);
  }

  async function handleSearch() {
    if (!searchQuery.trim() || !user) return;
    setSearching(true);
    const pattern = `%${searchQuery.trim()}%`;
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", pattern)
      .neq("id", user.id)
      .limit(10);
    setSearchResults(data || []);
    setSearching(false);
  }

  async function sendRequest(addresseeId: string) {
    if (!user) return;
    const { error } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, addressee_id: addresseeId, status: "pending" });
    if (error) {
      setActionMsg(error.message.includes("duplicate") ? "❌ 已经发送过申请了" : "❌ " + error.message);
    } else {
      setActionMsg("✅ 好友申请已发送！");
      setSearchResults(searchResults.filter(r => r.id !== addresseeId));
    }
    setTimeout(() => setActionMsg(""), 3000);
  }

  async function acceptRequest(friendshipId: string) {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
    setActionMsg("✅ 已接受好友请求");
    setTimeout(() => setActionMsg(""), 2000);
    loadData();
  }

  async function rejectRequest(friendshipId: string) {
    await supabase.from("friendships").update({ status: "rejected" }).eq("id", friendshipId);
    loadData();
  }

  async function removeFriend(friendshipId: string) {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    setActionMsg("已删除好友");
    setTimeout(() => setActionMsg(""), 2000);
    loadData();
  }

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">👥 好友</h1>

      {/* 搜索添加 */}
      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-4 mb-6">
        <p className="text-sm text-[#9090a8] mb-3">搜索用户并添加好友</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#6366f1]"
            placeholder="搜索用户名..."
          />
          <button onClick={handleSearch} disabled={searching} className="px-4 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5] disabled:opacity-50 flex items-center gap-1">
            <Search size={14} /> 搜索
          </button>
        </div>

        {actionMsg && (
          <div className={`mt-3 text-sm rounded-lg px-3 py-2 ${actionMsg.startsWith("✅") ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-[#f43f5e]/10 text-[#f43f5e]"}`}>
            {actionMsg}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-[#12122a] rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-xs font-bold">
                    {r.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="text-sm">{r.username}</span>
                </div>
                <button onClick={() => sendRequest(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-[#6366f1] text-white rounded-lg text-xs hover:bg-[#4f46e5]">
                  <UserPlus size={12} /> 添加
                </button>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !searching && (
          <p className="text-sm text-[#9090a8] mt-3">未找到用户</p>
        )}
      </div>

      {/* Tab */}
      <div className="flex gap-1 bg-[#12122a] rounded-lg p-1 mb-4 w-fit">
        <button onClick={() => setTab("friends")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "friends" ? "bg-[#6366f1] text-white" : "text-[#9090a8] hover:text-white"}`}>
          我的好友 ({friends.length})
        </button>
        <button onClick={() => setTab("requests")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "requests" ? "bg-[#6366f1] text-white" : "text-[#9090a8] hover:text-white"}`}>
          好友请求 ({requests.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#6366f1]" size={28} /></div>
      ) : tab === "friends" ? (
        <div className="space-y-2">
          {friends.length === 0 && (
            <div className="text-center py-12 text-[#9090a8]">
              <Users size={40} className="mx-auto mb-3 opacity-50" />
              <p>还没有好友，上方搜索添加吧</p>
            </div>
          )}
          {friends.map((f) => (
            <div key={f.id} className="flex items-center justify-between bg-[#1a1a30] border border-[#2a2a44] rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {f.profile?.avatar_url ? <img src={f.profile.avatar_url} className="w-full h-full object-cover" alt="" /> : f.profile?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{f.profile?.username || "未知"}</p>
                  <p className="text-[10px] text-[#606080]">好友</p>
                </div>
              </div>
              <button onClick={() => removeFriend(f.id)} className="p-2 rounded-lg text-[#9090a8] hover:text-[#f43f5e] hover:bg-[#2a2a44] transition-colors" title="删除好友">
                <UserX size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {requests.length === 0 && (
            <div className="text-center py-12 text-[#9090a8]">
              <Clock size={40} className="mx-auto mb-3 opacity-50" />
              <p>暂无待处理的好友请求</p>
            </div>
          )}
          {requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-[#1a1a30] border border-[#2a2a44] rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-sm font-bold">
                  {r.profile?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">{r.profile?.username || "未知"}</p>
                  <p className="text-[10px] text-[#606080]">请求添加你为好友</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => acceptRequest(r.id)} className="p-2 rounded-lg text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors" title="接受">
                  <UserCheck size={16} />
                </button>
                <button onClick={() => rejectRequest(r.id)} className="p-2 rounded-lg text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors" title="拒绝">
                  <UserX size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-[#606080] mt-8">
        <Link href="/forum" className="hover:text-[#9090a8]">← 返回论坛</Link>
      </p>
    </div>
  );
}
