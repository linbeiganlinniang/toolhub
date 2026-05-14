"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, Thread, Message, Profile } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, ThumbsUp, ThumbsDown, Send, ImagePlus, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

interface MessageWithAuthor extends Message {
  author: Profile | null;
}

interface VoteState {
  up: number;
  down: number;
  userVote: number;
}

export default function ThreadPage() {
  const { boardId, threadId } = useParams<{ boardId: string; threadId: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();

  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<MessageWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadVote, setThreadVote] = useState<VoteState>({ up: 0, down: 0, userVote: 0 });
  const [commentVotes, setCommentVotes] = useState<Record<string, VoteState>>({});

  // Upload
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reply
  const [replyContent, setReplyContent] = useState("");
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!threadId) return;
    loadThread();
    loadComments();
    loadVotes();
  }, [threadId]);

  async function loadThread() {
    const { data } = await supabase.from("threads").select("*").eq("id", threadId).single();
    setThread(data);
    setLoading(false);
  }

  async function loadComments() {
    const { data } = await supabase
      .from("messages")
      .select("*, author:profiles(*)")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    setComments((data || []) as any);
  }

  async function loadVotes() {
    // Load all votes for this thread + its messages
    const { data: threadVotes } = await supabase.from("votes").select("*").eq("thread_id", threadId);
    const ups = threadVotes?.filter(v => v.value === 1).length || 0;
    const downs = threadVotes?.filter(v => v.value === -1).length || 0;
    const myV = threadVotes?.find(v => v.user_id === user?.id);
    setThreadVote({ up: ups, down: downs, userVote: myV?.value || 0 });

    const cv: Record<string, VoteState> = {};
    if (comments.length) {
      const msgIds = comments.map(c => c.id);
      const { data: msgVotes } = await supabase.from("votes").select("*").in("message_id", msgIds);
      for (const c of comments) {
        const votes = msgVotes?.filter(v => v.message_id === c.id) || [];
        cv[c.id] = { up: votes.filter(v => v.value === 1).length, down: votes.filter(v => v.value === -1).length, userVote: votes.find(v => v.user_id === user?.id)?.value || 0 };
      }
    }
    setCommentVotes(cv);
  }

  async function voteThread(value: number) {
    if (!user) { router.push("/auth/login"); return; }
    if (threadVote.userVote === value) {
      await supabase.from("votes").delete().eq("thread_id", threadId).eq("user_id", user.id);
    } else {
      await supabase.from("votes").upsert({ thread_id: threadId, user_id: user.id, value }, { onConflict: "user_id,thread_id,message_id" });
    }
    loadVotes();
  }

  async function voteComment(msgId: string, value: number) {
    if (!user) { router.push("/auth/login"); return; }
    const cv = commentVotes[msgId]?.userVote || 0;
    if (cv === value) {
      await supabase.from("votes").delete().eq("message_id", msgId).eq("user_id", user.id);
    } else {
      await supabase.from("votes").upsert({ message_id: msgId, user_id: user.id, value }, { onConflict: "user_id,thread_id,message_id" });
    }
    loadVotes();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("post-images").getPublicUrl(path);
      setReplyImage(publicUrl);
    }
    setUploading(false);
  }

  async function sendReply() {
    if (!replyContent.trim() || !user || sending) return;
    setSending(true);
    await supabase.from("messages").insert({
      board_id: boardId, thread_id: threadId, author_id: user.id,
      content: replyContent.trim(), image_url: replyImage,
    });
    setReplyContent(""); setReplyImage(null);
    setSending(false);
    loadComments();
  }

  const fmtTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#6366f1]" size={32} /></div>;
  if (!thread) return <div className="text-center py-20 text-[#9090a8]"><p>帖子不存在</p><Link href={`/forum/${boardId}`} className="text-[#6366f1] mt-2 inline-block">← 返回板块</Link></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <Link href={`/forum/${boardId}`} className="inline-flex items-center gap-1 text-sm text-[#9090a8] hover:text-white mb-4">
        <ArrowLeft size={16} /> 返回板块
      </Link>

      {/* 帖子主体 */}
      <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-2xl p-6 mb-6">
        <h1 className="text-xl font-bold mb-3">{thread.title}</h1>
        <div className="whitespace-pre-wrap text-sm text-[#c0c0d8] leading-relaxed mb-4">{thread.content}</div>
        <div className="flex items-center justify-between text-xs text-[#606080]">
          <span>{fmtTime(thread.created_at)}</span>
          <div className="flex items-center gap-3">
            <button onClick={() => voteThread(1)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${threadVote.userVote === 1 ? "bg-[#22c55e]/20 text-[#22c55e]" : "hover:bg-[#2a2a44] text-[#9090a8]"}`}>
              <ThumbsUp size={14} /> {threadVote.up || ""}
            </button>
            <button onClick={() => voteThread(-1)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${threadVote.userVote === -1 ? "bg-[#f43f5e]/20 text-[#f43f5e]" : "hover:bg-[#2a2a44] text-[#9090a8]"}`}>
              <ThumbsDown size={14} /> {threadVote.down || ""}
            </button>
          </div>
        </div>
      </div>

      {/* 评论 */}
      <h2 className="font-semibold mb-4">💬 评论 ({comments.length})</h2>
      <div className="space-y-3 mb-6">
        {comments.map((c) => (
          <div key={c.id} className="bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center text-white text-[10px] font-bold">
                {c.author?.username?.[0]?.toUpperCase() || "?"}
              </div>
              <span className="text-sm font-medium">{c.author?.username || "未知"}</span>
              <span className="text-[10px] text-[#606080]">{fmtTime(c.created_at)}</span>
            </div>
            <p className="text-sm text-[#c0c0d8] mb-2 whitespace-pre-wrap">{c.content}</p>
            {c.image_url && <img src={c.image_url} className="max-h-60 rounded-lg mb-2" alt="" />}
            <div className="flex items-center gap-3">
              <button onClick={() => voteComment(c.id, 1)} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors ${(commentVotes[c.id]?.userVote || 0) === 1 ? "bg-[#22c55e]/20 text-[#22c55e]" : "text-[#9090a8] hover:text-[#22c55e]"}`}>
                <ThumbsUp size={12} /> {commentVotes[c.id]?.up || ""}
              </button>
              <button onClick={() => voteComment(c.id, -1)} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors ${(commentVotes[c.id]?.userVote || 0) === -1 ? "bg-[#f43f5e]/20 text-[#f43f5e]" : "text-[#9090a8] hover:text-[#f43f5e]"}`}>
                <ThumbsDown size={12} />
              </button>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-center text-sm text-[#9090a8] py-8">暂无评论</p>}
      </div>

      {/* 回复框 */}
      {user ? (
        <div className="bg-[#1a1a30] border border-[#2a2a44] rounded-xl p-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full bg-[#12122a] border border-[#3a3a50] rounded-lg p-3 text-sm focus:outline-none focus:border-[#6366f1] resize-none"
            rows={3}
            placeholder="写评论..."
          />
          {replyImage && (
            <div className="relative inline-block mt-2">
              <img src={replyImage} className="max-h-32 rounded-lg" alt="" />
              <button onClick={() => setReplyImage(null)} className="absolute top-1 right-1 p-1 bg-[#f43f5e] rounded-full text-white"><Trash2 size={10} /></button>
            </div>
          )}
          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-1 px-3 py-1.5 border border-[#3a3a50] rounded-lg text-xs text-[#9090a8] hover:text-white hover:border-[#6366f1] transition-colors">
                <ImagePlus size={14} /> {uploading ? "上传中…" : "图片"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
            <button onClick={sendReply} disabled={!replyContent.trim() || sending} className="flex items-center gap-1 px-4 py-1.5 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#4f46e5] disabled:opacity-40">
              <Send size={14} /> 发布
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-[#9090a8] py-4 bg-[#1a1a30] border border-[#2a2a44] rounded-xl">
          <Link href="/auth/login" className="text-[#6366f1] hover:underline">登录</Link> 后参与评论
        </div>
      )}
    </div>
  );
}
