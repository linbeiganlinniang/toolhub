"use client";

export function avatarEmoji(url: string | null): { emoji: string; bg: string } {
  if (!url) return { emoji: "🐼", bg: "#6366f1" };
  try {
    const d = JSON.parse(atob(url));
    if (d.emoji) return d;
  } catch {}
  return { emoji: "🐼", bg: "#6366f1" };
}

export function isEmojiAvatar(url: string | null): boolean {
  if (!url) return true;
  try { const d = JSON.parse(atob(url)); return !!d.emoji; } catch { return false; }
}

export default function UserAvatar({ url, size = 40, className = "" }: { url: string | null; size?: number; className?: string }) {
  const isEmoji = isEmojiAvatar(url);
  const { emoji, bg } = avatarEmoji(url);
  const fontSize = Math.round(size * 0.5);
  return (
    <div
      className={`rounded-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size, background: isEmoji ? bg : undefined, fontSize }}
    >
      {isEmoji ? (
        <span>{emoji}</span>
      ) : (
        <img src={url!} alt="" className="w-full h-full object-cover" />
      )}
    </div>
  );
}
