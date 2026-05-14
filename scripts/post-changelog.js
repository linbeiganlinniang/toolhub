const https = require('https');
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoamh0ZnN5enFyc3hiZnR3eml0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc1MDUzMSwiZXhwIjoyMDk0MzI2NTMxfQ.hqRyc1jaO31wdBMOKnvuN-CaPG7ZHso0eB1G7Oo7XTs';
const BASE = 'lhjhtfsyzqrsxbftwzit.supabase.co';
const BID = '1e30156e-5f55-4838-b540-881a17ec5c09';
const AID = '41fe0611-cb2b-4257-8612-cc1f9783d5aa';

const body = JSON.stringify({
  board_id: BID, author_id: AID,
  title: "🛠️ 好友系统修复 + 用户主页上线",
  content: "## 🔧 好友系统修复\n\n修复了好友申请双方收不到请求的问题。\n\n## 🏠 用户主页\n\n- 点击任意用户头像/用户名即可进入对方主页\n- 查看对方的资料（头像、UID、简介、性别、年龄、位置、网站）\n- 管理员显示「管理员」徽章\n- 在对方主页可直接添加好友、接受请求、删除好友\n- 好友列表 / 搜索结果中均可点击跳转\n\n访问 /friends 体验新版好友系统！"
});

const req = https.request({hostname:BASE,path:'/rest/v1/threads',method:'POST',headers:{Authorization:'Bearer '+TOKEN,apikey:TOKEN,'Content-Type':'application/json',Prefer:'return=minimal'}}, r => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>console.log(r.statusCode)); });
req.write(body); req.end();
