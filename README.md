# ToolHub - 工具集 & 实时社区

一站式在线工具集合 + 实时互动论坛，基于 **Cloudflare + Vercel + Supabase** 零费用部署。

## 🏗️ 技术栈

| 层 | 服务 | 免费额度 |
|---|------|---------|
| DNS / CDN / 防护 | **Cloudflare** | 无限流量 CDN, DDoS 防护, SSL |
| 前端托管 | **Vercel** | 100GB 带宽/月, 无限静态页面 |
| 数据库 / 认证 / 实时 | **Supabase** | 500MB 数据库, 50k 月活用户, 5GB 带宽 |

## 🚀 零费用上线步骤

### 1. Supabase 配置

1. 注册 [supabase.com](https://supabase.com)，创建项目
2. 进入 **SQL Editor** → 粘贴 `supabase/migrations/001_schema.sql` → 执行
3. 进入 **Authentication → Settings**：
   - 启用 Email 登录
   - 关闭「确认邮箱」(本地测试)或在生产环境中配置 SMTP
4. 进入 **Settings → API**，复制：
   - `Project URL`
   - `anon public key`

### 2. Vercel 部署

```bash
npm install
npm run build
```

或一键部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

在 Vercel 项目设置中添加环境变量：
- `NEXT_PUBLIC_SUPABASE_URL` = 你的 Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 Supabase anon key

### 3. Cloudflare DNS（可选，使用自定义域名）

1. 在 Cloudflare 添加你的域名
2. 添加 CNAME 记录指向 `cname.vercel-dns.com`
3. SSL/TLS 设为 **Full (strict)**

## 📁 项目结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── forum/
│   │   ├── page.tsx        # 板块列表
│   │   └── [boardId]/
│   │       └── page.tsx    # 板块详情 (帖子 + 实时聊天)
│   ├── tools/
│   │   └── page.tsx        # 工具集合
│   └── auth/
│       ├── login/page.tsx  # 登录/注册
│       └── callback/route.ts
├── components/
│   └── Navbar.tsx
├── lib/
│   ├── supabase.ts         # 数据库类型 + 客户端
│   └── auth.tsx            # Auth Context
supabase/
└── migrations/
    └── 001_schema.sql      # 数据库表 + RLS + 示例数据
```

## 🔧 功能

- **实时聊天** — 板块内即时通讯，Supabase Realtime 驱动
- **论坛帖子** — 发帖、回复，支持 Markdown
- **工具集合** — 分类浏览在线工具
- **用户认证** — 邮箱注册/登录
- **暗色主题** — 护眼暗色界面

## 📝 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
