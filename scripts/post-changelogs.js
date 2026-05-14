const https = require('https');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoamh0ZnN5enFyc3hiZnR3eml0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc1MDUzMSwiZXhwIjoyMDk0MzI2NTMxfQ.hqRyc1jaO31wdBMOKnvuN-CaPG7ZHso0eB1G7Oo7XTs';
const BASE = 'lhjhtfsyzqrsxbftwzit.supabase.co';
const BID = '1e30156e-5f55-4838-b540-881a17ec5c09';
const AID = '41fe0611-cb2b-4257-8612-cc1f9783d5aa';

const changelogs = [
  {
    title: "🎉 ToolHub 正式上线！",
    content: "欢迎来到 ToolHub —— 一站式工具集合 + 实时互动社区！\n\n## 🌟 首个版本功能\n\n- 🏠 首页介绍页\n- 📋 论坛板块：闲聊灌水、技术讨论、游戏娱乐、公告通知\n- 💬 板块内实时聊天（基于 Supabase Realtime）\n- 🔧 在线工具：JSON 格式化、Base64 编解码、时间戳转换、颜色转换、MD5 哈希、二维码生成\n- 👤 邮箱注册 / 登录\n\n## 🛠️ 技术栈\n\n- 前端：Next.js 15 + Tailwind CSS\n- 后端：Supabase (PostgreSQL + Auth + Realtime)\n- 部署：Netlify (免费)\n- 域名：toolhub-cn.netlify.app\n\n欢迎注册体验！"
  },
  {
    title: "🔐 GitHub OAuth 登录已上线",
    content: "现在可以用 GitHub 账号一键登录 ToolHub 了！\n\n## 新增\n\n- 🐙 GitHub OAuth 登录按钮\n- 🔑 无需记密码，GitHub 授权即登录\n\n## 修复\n\n- 数据库注册 500 错误已修复\n\n快去试试吧！"
  },
  {
    title: "👤 个人资料 + 内联工具上线",
    content: "## 🆕 个人中心\n\n- 📝 昵称修改\n- 🖼️ 头像 URL 设置\n- 🚻 性别选择\n- 🎂 年龄\n- 📍 位置 / 个人网站\n- 📄 个人简介 (200字)\n\n## 🔧 在线工具升级\n\n工具页面现在内嵌可用工具，无需登录即可使用：\n- JSON 格式化 / 压缩\n- Base64 编解码\n- 时间戳转换\n- 颜色 HEX ↔ RGB ↔ HSL\n- MD5 / SHA-256 哈希\n- 二维码生成器\n\n访问 /tools 即可体验！"
  },
  {
    title: "👥 好友系统上线",
    content: "ToolHub 社交功能来了！\n\n## 好友功能\n\n- 🔍 按用户名搜索用户\n- 🔢 按 UID 搜索（QQ 号式）\n- 📨 发送好友申请\n- ✅ 同意 / ❌ 拒绝 / 👁️ 忽略\n- 📋 好友列表管理\n\n## 用户 ID 系统\n\n每个注册用户自动分配唯一 UID，从 10000 起步递增，先到先得！\n个人资料页可查看自己的 UID。"
  },
  {
    title: "🎵 音频格式转换 + 桌面版下载",
    content: "## 🎵 音频转换工具\n\n网页版：支持上传音频文件导出为 WAV 格式\n桌面版：独立的 HTML 文件，基于 ffmpeg.wasm，支持数十种格式互转\n\n### 桌面版支持的格式\n\n输入：MP3 / WAV / OGG / FLAC / AAC / M4A / WMA / AIFF / Opus / WebM 等\n输出：任意选择的目标格式\n\n💾 下载地址：/audio-converter.html\n\n⚠️ 加密/DRM 音频无法转换"
  },
  {
    title: "📝 帖子系统大升级：评论+赞踩+图片",
    content: "## 🆕 帖子详情页\n\n现在点击板块里的帖子可以进入独立详情页！\n\n## 💬 评论功能\n\n- 帖子下方评论区\n- 支持文字 + 图片上传\n- 图片自动保存到云端\n\n## 👍 赞踩系统\n\n- 帖子 + 每条评论都有赞/踩按钮\n- 实时计票，谁投的啥一目了然\n\n## 🖼️ 图片上传\n\n- 直接粘贴或选择图片\n- 支持 PNG / JPG / GIF / WebP\n- 单文件限 5MB\n\n发帖 → 点进帖子 → 评论传图赞踩走起！"
  },
  {
    title: "👑 管理员制度上线",
    content: "## 🔒 站务公告板限制\n\n公告通知板块现在仅有管理员可发布帖子。\n\n## 👑 当前管理员\n\n- 大脸猫 (UID: 10001)\n- 流年似雪丶 (UID: 10002)\n\n## 📋 权限说明\n\n- 公告板：仅管理员可发帖/发消息\n- 其他板块：所有注册用户自由发帖\n- 管理员由数据库 role 字段控制\n\n如果需要成为管理员，请联系现有管理员。\n\n---\n\n以上就是 ToolHub 从零到现在的全部更新日志！后续每次更新都会在此板块发布公告。"
  }
];

async function post(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: BASE,
      path: '/rest/v1/threads',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'apikey': TOKEN,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  for (const c of changelogs) {
    const status = await post({ board_id: BID, author_id: AID, title: c.title, content: c.content });
    console.log(status + ' ' + c.title);
  }
  console.log('Done!');
})().catch(e => console.error(e));
