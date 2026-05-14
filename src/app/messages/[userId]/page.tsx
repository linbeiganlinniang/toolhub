"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DM {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export default function MessagePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<DM[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [friendName, setFriendName] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (!userId || userId === user.id) { router.push("/friends"); return; }
    loadMessages();
    loadFriendName();

    // Realtime 订阅
    const channel = supabase
      .channel(`dm-${[user.id, userId].sort().join('-')}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'private_messages',
        filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${userId}),and(sender_id=eq.${userId},receiver_id=eq.${user.id}))`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as DM]);
      })
      .subscribe();
    channelRef.current = channel;

    return () => { supabase.removeChannel(channel); };
  }, [userId, user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadMessages() {
    if (!user) return;
    const { data } = await supabase
      .from("private_messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages(data || []);
    setLoading(false);
  }

  async function loadFriendName() {
    const { data } = await supabase.from("profiles").select("username").eq("id", userId).single();
    setFriendName(data?.username || "用户");
  }

  async function sendMessage() {
    if (!input.trim() || !user || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    await supabase.from("private_messages").insert({ sender_id: user.id, receiver_id: userId, content });
    setSending(false);
  }

  const fmtTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#6366f1]" size={32} /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 h-[calc(100vh-3.5rem)] flex flex-col">
      {/* 头部 */}
      <div className="flex items-center gap-3 py-3 border-b border-[#2a2a44]">
        <Link href="/friends" className="p-1.5 rounded-lg hover:bg-[#2a2a44]"><ArrowLeft size={18} className="text-[#9090a8]" /></Link>
        <Link href={`/user/${userId}`} className="flex items-center gap-2 hover:opacity-80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-xs font-bold">{friendName[0]?.toUpperCase()}</div>
          <span className="font-medium text-sm">{friendName}</span>
        </Link>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <div className="text-center py-12 text-[#9090a8]"><p className="text-sm">还没有消息，打个招呼吧 👋</p></div>}
        {messages.map((m, i) => {
          const isMe = m.sender_id === user?.id;
          const showDate = i === 0 || new Date(m.created_at).toDateString() !== new Date(messages[i - 1].created_at).toDateString();
          return (
            <div key={m.id}>
              {showDate && <p className="text-center text-[10px] text-[#606080] my-3">{new Date(m.created_at).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}</p>}
              <div className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""} animate-fade-in`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-[#6366f1] text-white rounded-tr-sm" : "bg-[#2a2a44] rounded-tl-sm"}`}>
                  {m.content}
                </div>
                <p className="text-[10px] text-[#606080] self-end">{fmtTime(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* 输入框 */}
      <div className="border-t border-[#2a2a44] p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="输入私信…"
            className="flex-1 bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1]"
          />
          <button onClick={sendMessage} disabled={!input.trim() || sending} className="px-4 py-2.5 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f46e5] disabled:opacity-40 flex items-center gap-1">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
