"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase, Profile } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Loader2, ArrowLeft, UserPlus, UserCheck, UserX, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";

interface FriendStatus { status: string; friendshipId: string | null; }

export default function UserPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending_sent" | "pending_received" | "accepted">("none");
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    if (!userId) return;
    loadProfile();
    if (user && user.id !== userId) loadFriendStatus();
  }, [userId, user]);

  async function loadProfile() {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setLoading(false);
  }

  async function loadFriendStatus() {
    if (!user) return;
    const { data } = await supabase.from("friendships").select("*").or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`);
    if (!data || data.length === 0) { setFriendStatus("none"); return; }
    const f = data[0];
    if (f.status === "accepted") setFriendStatus("accepted");
    else if (f.requester_id === user.id) setFriendStatus("pending_sent");
    else setFriendStatus("pending_received");
    setFriendshipId(f.id);
  }

  async function sendRequest() {
    if (!user) return;
    const { error } = await supabase.from("friendships").insert({ requester_id: user.id, addressee_id: userId, status: "pending" });
    if (error) { setActionMsg(error.message.includes("duplicate") ? "❌ 已发送过申请" : "❌ " + error.message); }
    else { setFriendStatus("pending_sent"); setActionMsg("✅ 好友申请已发送！"); }
    setTimeout(() => setActionMsg(""), 3000);
  }

  async function acceptRequest() {
    if (!friendshipId) return;
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
    setFriendStatus("accepted");
    setActionMsg("✅ 已接受好友请求");
    setTimeout(() => setActionMsg(""), 2000);
  }

  async function removeFriend() {
    if (!friendshipId) return;
    await supabase.from("friendships").delete().eq("id", friendshipId);
    setFriendStatus("none");
    setFriendshipId(null);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#6366f1]" size={32} /></div>;
  if (!profile) return <div className="text-center py-20 text-[#9090a8]"><p>用户不存在</p><Link href="/forum" className="text-[#6366f1] mt-2 inline-block">← 返回论坛</Link></div>;

  const isMe = user?.id === userId;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <Link href="/forum" className="inline-flex items-center gap-1 text-sm text-[#9090a8] hover:text-white mb-6"><ArrowLeft size={16} /> 返回论坛</Link>

      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-[#6366f1]/20 to-[#22d3ee]/20 p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 overflow-hidden">
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" /> : profile.username?.[0]?.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          {profile.display_id && <p className="text-sm text-[#22d3ee] font-mono mt-1">UID: {profile.display_id}</p>}
          {profile.role === "admin" && <span className="inline-block mt-2 px-3 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] text-xs rounded-full">管理员</span>}
        </div>

        {/* 操作按钮 */}
        <div className="px-6 py-4 border-b border-[#2a2a44] flex justify-center gap-3">
          {isMe ? (
            <Link href="/profile" className="px-4 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5]">编辑资料</Link>
          ) : friendStatus === "none" && (
            <button onClick={sendRequest} className="flex items-center gap-1.5 px-5 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5]"><UserPlus size={16} /> 添加好友</button>
          )}
          {friendStatus === "pending_sent" && (
            <button disabled className="flex items-center gap-1.5 px-5 py-2 border border-[#3a3a50] text-[#9090a8] rounded-lg text-sm"><Clock size={16} /> 已发送申请</button>
          )}
          {friendStatus === "pending_received" && (
            <button onClick={acceptRequest} className="flex items-center gap-1.5 px-5 py-2 bg-[#22c55e] text-white rounded-lg text-sm hover:bg-[#16a34a]"><UserCheck size={16} /> 接受好友请求</button>
          )}
          {friendStatus === "accepted" && (<>
            <Link href={`/messages/${userId}`} className="flex items-center gap-1.5 px-5 py-2 bg-[#22c55e] text-white rounded-lg text-sm hover:bg-[#16a34a]"><MessageCircle size={16} /> 发私信</Link>
            <button onClick={removeFriend} className="flex items-center gap-1.5 px-5 py-2 border border-[#3a3a50] text-[#f43f5e] rounded-lg text-sm hover:bg-[#f43f5e]/10"><UserX size={16} /> 删除好友</button>
          </>)}
        </div>

        {actionMsg && <div className={`mx-6 mt-3 text-sm rounded-lg px-3 py-2 ${actionMsg.startsWith("✅") ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-[#f43f5e]/10 text-[#f43f5e]"}`}>{actionMsg}</div>}

        {/* 信息 */}
        <div className="p-6 space-y-4">
          {profile.bio && (
            <div>
              <p className="text-xs text-[#606080] mb-1">个人简介</p>
              <p className="text-sm text-[#c0c0d8]">{profile.bio}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {profile.gender && <div><p className="text-xs text-[#606080]">性别</p><p className="text-sm">{profile.gender}</p></div>}
            {profile.age && <div><p className="text-xs text-[#606080]">年龄</p><p className="text-sm">{profile.age}</p></div>}
            {profile.location && <div><p className="text-xs text-[#606080]">位置</p><p className="text-sm">{profile.location}</p></div>}
            {profile.website && <div><p className="text-xs text-[#606080]">网站</p><a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#6366f1] hover:underline">{profile.website}</a></div>}
          </div>
          <p className="text-[10px] text-[#606080]">加入于 {new Date(profile.created_at).toLocaleDateString("zh-CN")}</p>
        </div>
      </div>
    </div>
  );
}
