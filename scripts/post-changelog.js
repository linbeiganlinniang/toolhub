const https = require('https');
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoamh0ZnN5enFyc3hiZnR3eml0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc1MDUzMSwiZXhwIjoyMDk0MzI2NTMxfQ.hqRyc1jaO31wdBMOKnvuN-CaPG7ZHso0eB1G7Oo7XTs';
const BASE = 'lhjhtfsyzqrsxbftwzit.supabase.co';
const BID = '1e30156e-5f55-4838-b540-881a17ec5c09';
const AID = '41fe0611-cb2b-4257-8612-cc1f9783d5aa';

const body = JSON.stringify({
  board_id: BID, author_id: AID,
  title: "🌐 多语言上线 + 💳 Stripe 支付",
  content: "## 🌐 多语言系统\n\n现在 ToolHub 支持中英文自动切换！\n\n- 根据浏览器语言自动显示中文或英文\n- 手动切换：导航栏 🇨🇳/🇺🇸 按钮\n- 翻译内容：首页、导航栏、论坛、工具、好友、私信、VIP 等几乎所有页面\n- 选择保存在浏览器，下次访问自动应用\n\n## 💳 Stripe 国际支付\n\n国外用户现在可以用信用卡直接购买 VIP 会员！\n\n- 银牌赞助 ¥9.9/月\n- 金牌赞助 ¥29.9/月\n- 金牌年付 ¥99/年\n- 支持 Visa / Mastercard / American Express 等国际卡\n\n## ⚙️ 管理者操作\n\n在 Netlify 环境变量中填以下值即可激活支付：\n\n```\nSTRIPE_SECRET_KEY=sk_live_xxx\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx\nSTRIPE_WEBHOOK_SECRET=whsec_xxx\n```\n\n注册 Stripe：https://stripe.com 然后收款到 Payoneer。"
});

const req = https.request({hostname:BASE,path:'/rest/v1/threads',method:'POST',headers:{Authorization:'Bearer '+TOKEN,apikey:TOKEN,'Content-Type':'application/json',Prefer:'return=minimal'}}, r => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>console.log(r.statusCode)); });
req.write(body); req.end();
