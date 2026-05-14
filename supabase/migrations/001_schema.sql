-- 板块
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '📋',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 主题帖
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 实时消息 (聊天 + 帖子回复)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 用户资料
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 工具
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '其他',
  icon TEXT DEFAULT '🔧',
  url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_threads_board ON threads(board_id, created_at DESC);
CREATE INDEX idx_messages_board ON messages(board_id, created_at DESC);
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at ASC);

-- RLS: 公开可读，认证可写
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- boards: 所有人可读
CREATE POLICY "boards_read" ON boards FOR SELECT USING (true);

-- threads: 所有人可读
CREATE POLICY "threads_read" ON threads FOR SELECT USING (true);
CREATE POLICY "threads_insert" ON threads FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "threads_update" ON threads FOR UPDATE USING (auth.uid() = author_id);

-- messages: 所有人可读
CREATE POLICY "messages_read" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = author_id);

-- profiles: 所有人可读，本人可改
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- tools: 所有人可读
CREATE POLICY "tools_read" ON tools FOR SELECT USING (true);

-- Supabase Realtime 开启
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 示例数据
INSERT INTO boards (name, slug, description, icon, sort_order) VALUES
  ('💬 闲聊灌水', 'general', '随便聊聊，交个朋友', '💬', 1),
  ('🔧 技术讨论', 'tech', '编程、开发、技术话题', '🔧', 2),
  ('🎮 游戏娱乐', 'gaming', '游戏攻略、开黑组队', '🎮', 3),
  ('📢 公告通知', 'announcements', '站务公告，重要通知', '📢', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tools (name, slug, description, category, icon, sort_order) VALUES
  ('JSON 格式化', 'json-formatter', 'JSON 美化、压缩、校验', '开发工具', '{ }', 1),
  ('Base64 编解码', 'base64', 'Base64 编码与解码', '开发工具', '64', 2),
  ('Markdown 预览', 'markdown-preview', '实时 Markdown 编辑预览', '写作工具', 'MD', 3),
  ('颜色转换', 'color-converter', 'HEX/RGB/HSL 互转', '设计工具', '🎨', 4),
  ('时间戳转换', 'timestamp', 'Unix 时间戳与日期互转', '开发工具', '🕐', 5),
  ('二维码生成', 'qr-generator', '在线生成二维码', '实用工具', '📱', 6)
ON CONFLICT (slug) DO NOTHING;
