"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase, Board, Thread, Message, Profile } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Send, Pin, Loader2, User, MessageCircle } from "lucide-react";
import Link from "next/link";
import { RealtimeChannel } from "@supabase/supabase-js";

interface MessageWithAuthor extends Message {
  author: Profile | null;
}

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { user, profile } = useAuth();

  const [board, setBoard] = useState<Board | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<MessageWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"threads" | "chat">("chat");

  // 发帖
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // 聊天
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // 加载板块信息
  useEffect(() => {
    if (!boardId) return;
    supabase.from("boards").select("*").eq("id", boardId).single().then(({ data }) => setBoard(data));

    supabase
      .from("threads")
      .select("*")
      .eq("board_id", boardId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => setThreads(data || []));

    // 加载最近消息
    supabase
      .from("messages")
      .select("*, author:profiles(*)")
      .eq("board_id", boardId)
      .is("thread_id", null) // 只看聊天消息，不看帖子回复
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages((data as MessageWithAuthor[]) || []);
        setLoading(false);
      });
  }, [boardId]);

  // 实时订阅
  useEffect(() => {
    if (!boardId) return;

    const channel = supabase
      .channel(`board-${boardId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `board_id=eq.${boardId}` },
        (payload) => {
          const msg = payload.new as Message;
          supabase
            .from("profiles")
            .select("*")
            .eq("id", msg.author_id)
            .single()
            .then(({ data }) => {
              setMessages((prev) => [...prev, { ...msg, author: data }]);
            });
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [boardId]);

  // 滚动到底
  useEffect(() => {
    if (tab === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  // 发送聊天消息
  async function sendMessage() {
    if (!chatInput.trim() || !user || sending) return;
    setSending(true);
    const content = chatInput.trim();
    setChatInput("");
    // 乐观更新
    const tempId = `temp-${Date.now()}`;
    const tempMsg: MessageWithAuthor = {
      id: tempId,
      board_id: boardId,
      thread_id: null,
      author_id: user.id,
      content,
      image_url: null,
      created_at: new Date().toISOString(),
      author: profile,
    };
    setMessages((prev) => [...prev, tempMsg]);

    await supabase.from("messages").insert({
      board_id: boardId,
      author_id: user.id,
      content,
    });
    setSending(false);
  }

  // 发帖
  async function createThread() {
    if (!newTitle.trim() || !user) return;
    await supabase.from("threads").insert({
      board_id: boardId,
      author_id: user.id,
      title: newTitle.trim(),
      content: newContent.trim(),
    });
    setNewTitle("");
    setNewContent("");
    setShowNewThread(false);
    // 刷新帖子列表
    const { data } = await supabase
      .from("threads")
      .select("*")
      .eq("board_id", boardId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setThreads(data || []);
  }

  // 格式化时间
  const fmtTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#6366f1]" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-[#9090a8]">
        <p>板块不存在</p>
        <Link href="/forum" className="text-[#6366f1] hover:underline mt-2 inline-block">← 返回论坛</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 h-[calc(100vh-3.5rem)] flex flex-col">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/forum" className="p-1.5 rounded-lg hover:bg-[#2a2a44] transition-colors">
          <ArrowLeft size={20} className="text-[#9090a8]" />
        </Link>
        <span className="text-2xl">{board.icon}</span>
        <div>
          <h1 className="text-xl font-bold">{board.name}</h1>
          <p className="text-xs text-[#9090a8]">{board.description}</p>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-[#12122a] rounded-lg p-1 mb-4 w-fit">
        <button
          onClick={() => setTab("chat")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "chat" ? "bg-[#6366f1] text-white" : "text-[#9090a8] hover:text-white"
          }`}
        >
          💬 实时聊天
        </button>
        <button
          onClick={() => setTab("threads")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "threads" ? "bg-[#6366f1] text-white" : "text-[#9090a8] hover:text-white"
          }`}
        >
          📝 帖子
        </button>
      </div>

      {/* 聊天面板 */}
      {tab === "chat" && (
        <div className="flex-1 flex flex-col bg-[#16162a] border border-[#2a2a44] rounded-xl overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-12 text-[#9090a8]">
                <MessageCircle size={40} className="mx-auto mb-3 opacity-50" />
                <p>还没有消息，来发第一条吧！</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.author_id === user?.id;
              const showAuthor = i === 0 || messages[i - 1]?.author_id !== msg.author_id;
              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""} animate-fade-in`}>
                  {showAuthor ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {msg.author?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  ) : (
                    <div className="w-8 flex-shrink-0" />
                  )}
                  <div className={`max-w-[70%] ${isMe ? "items-end" : ""}`}>
                    {showAuthor && (
                      <p className={`text-xs text-[#9090a8] mb-0.5 ${isMe ? "text-right" : ""}`}>
                        {msg.author?.username || "未知用户"}
                      </p>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      isMe
                        ? "bg-[#6366f1] text-white rounded-tr-sm"
                        : "bg-[#2a2a44] text-[#e0e0f0] rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                    <p className={`text-[10px] text-[#606080] mt-0.5 ${isMe ? "text-right" : ""}`}>
                      {fmtTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* 输入框 */}
          <div className="border-t border-[#2a2a44] p-3">
            {user ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="输入消息，回车发送…"
                  className="flex-1 bg-[#1e1e32] border border-[#3a3a50] rounded-lg px-4 py-2 text-sm text-[#e0e0f0] placeholder-[#606080] focus:outline-none focus:border-[#6366f1] transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || sending}
                  className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f46e5] disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <Send size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center text-sm text-[#9090a8]">
                <Link href="/auth/login" className="text-[#6366f1] hover:underline">登录</Link> 后参与聊天
              </div>
            )}
          </div>
        </div>
      )}

      {/* 帖子列表 */}
      {tab === "threads" && (
        <div className="flex-1 overflow-y-auto space-y-3">
          {user && (
            <button
              onClick={() => setShowNewThread(!showNewThread)}
              className="w-full py-3 border-2 border-dashed border-[#3a3a50] rounded-xl text-sm text-[#9090a8] hover:border-[#6366f1] hover:text-[#6366f1] transition-colors"
            >
              + 发布新帖子
            </button>
          )}

          {showNewThread && (
            <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-4 space-y-3 animate-fade-in">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="帖子标题"
                className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#6366f1]"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="帖子内容（支持 Markdown）"
                rows={4}
                className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#6366f1] resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowNewThread(false)} className="px-4 py-1.5 text-sm text-[#9090a8] hover:text-white">取消</button>
                <button onClick={createThread} disabled={!newTitle.trim()} className="px-4 py-1.5 bg-[#6366f1] text-white text-sm rounded-lg hover:bg-[#4f46e5] disabled:opacity-40">
                  发布
                </button>
              </div>
            </div>
          )}

          {threads.map((thread) => (
            <Link key={thread.id} href={`/forum/${boardId}/${thread.id}`} className="block bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-4 hover:border-[#6366f1]/30 transition-colors animate-fade-in">
              <div className="flex items-start gap-2">
                {thread.is_pinned && <Pin size={14} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">{thread.title}</h3>
                  <p className="text-xs text-[#9090a8] line-clamp-2 mb-2">{thread.content}</p>
                  <p className="text-[10px] text-[#606080]">{fmtTime(thread.created_at)}</p>
                </div>
              </div>
            </Link>
          ))}

          {threads.length === 0 && !user && (
            <div className="text-center py-12 text-[#9090a8]">
              <p>暂无帖子</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
