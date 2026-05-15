/**
 * Netlify Function: stripe-webhook
 * 
 * Handles Stripe webhook events on Netlify.
 * On payment_intent.succeeded, upgrades user's VIP level in Supabase.
 * 
 * Environment variables needed:
 *   STRIPE_WEBHOOK_SECRET (whsec_... from Stripe Dashboard)
 *   SUPABASE_URL (NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 * 
 * Deploy: netlify deploy --functions=netlify/functions
 * Test locally: netlify dev
 */

const crypto = require("crypto");

/**
 * Verify Stripe webhook signature using HMAC-SHA256
 */
function verifyStripeSignature(payload: string, sig: string, secret: string): boolean {
  const parts = sig.split(",");
  let timestamp = "";
  let expectedSig = "";
  for (const p of parts) {
    const [k, v] = p.split("=");
    if (k === "t") timestamp = v;
    if (k === "v1") expectedSig = v;
  }

  if (!timestamp || !expectedSig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const computedSig = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return computedSig === expectedSig;
}

/**
 * Update user's VIP level in Supabase
 */
async function upgradeVip(userId: string, amountYuan: number) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("[stripe-webhook] Supabase not configured");
    return;
  }

  // Determine VIP tier based on payment amount
  let vipLevel = 0;
  let days = 30;
  if (amountYuan >= 99) {
    vipLevel = 3; // Gold annual
    days = 365;
  } else if (amountYuan >= 29.9) {
    vipLevel = 3; // Gold monthly
  } else if (amountYuan >= 9.9) {
    vipLevel = 2; // Silver monthly
  }

  if (vipLevel === 0) {
    console.log(`[stripe-webhook] Amount ${amountYuan} too low for VIP upgrade`);
    return;
  }

  const expiresAt = new Date(Date.now() + days * 86400000).toISOString();

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vip_level: vipLevel,
        vip_expires_at: expiresAt,
      }),
    });

    if (!res.ok) {
      console.error(`[stripe-webhook] Supabase update failed: ${res.status} ${await res.text()}`);
    } else {
      console.log(`[stripe-webhook] Upgraded user ${userId} to level ${vipLevel}, expires ${expiresAt}`);
    }
  } catch (err) {
    console.error("[stripe-webhook] Supabase update error:", err);
  }
}

/**
 * Netlify Function handler
 */
exports.handler = async (event: any) => {
  // Only accept POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured");
    return {
      statusCode: 503,
      body: JSON.stringify({ error: "Stripe webhook secret not configured" }),
    };
  }

  const sig = event.headers["stripe-signature"] || "";
  const body = event.body; // Netlify provides raw body

  // Verify signature
  if (!verifyStripeSignature(body, sig, STRIPE_WEBHOOK_SECRET)) {
    console.error("[stripe-webhook] Invalid signature");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid signature" }),
    };
  }

  let eventData;
  try {
    eventData = JSON.parse(body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  console.log(`[stripe-webhook] Event: ${eventData.type}`);

  // Handle checkout.session.completed
  if (eventData.type === "checkout.session.completed") {
    const session = eventData.data.object;
    const userId = session.client_reference_id;
    const amountTotal = session.amount_total || 0;

    if (userId) {
      const amountYuan = amountTotal / 100;
      console.log(`[stripe-webhook] Processing payment for user ${userId}: ¥${amountYuan}`);
      await upgradeVip(userId, amountYuan);
    } else {
      console.log("[stripe-webhook] No client_reference_id, skipping VIP upgrade");
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
