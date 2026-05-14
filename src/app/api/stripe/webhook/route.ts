import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events.
 * On payment_intent.succeeded, upgrades user's VIP level.
 * 
 * Environment variables needed:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET (whsec_... from Stripe Dashboard)
 *   SUPABASE_SERVICE_ROLE_KEY
 * 
 * Test: stripe trigger payment_intent.succeeded
 */
export async function POST(request: NextRequest) {
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!STRIPE_WEBHOOK_SECRET || !STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";

  // Verify webhook signature using raw Stripe crypto
  try {
    // Construct signature using HMAC-SHA256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(STRIPE_WEBHOOK_SECRET);
    const messageData = encoder.encode(`${sig.split(",")[0]?.split("=")[1] || ""}.${body}`);

    // Parse Stripe signature header
    const parts = sig.split(",");
    let timestamp = "";
    let expectedSig = "";
    for (const p of parts) {
      const [k, v] = p.split("=");
      if (k === "t") timestamp = v;
      if (k === "v1") expectedSig = v;
    }

    if (!expectedSig) {
      return NextResponse.json({ error: "No valid signature" }, { status: 400 });
    }

    const signedPayload = `${timestamp}.${body}`;
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(STRIPE_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false, ["sign"]
    );
    const computedSigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
    const computedSig = Array.from(new Uint8Array(computedSigBytes))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Simple comparison (constant-time not strictly required here)
    if (computedSig !== expectedSig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle the event
    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const amount = session.amount_total || session.amount || 0;

      if (userId && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        // Determine VIP level based on amount (amount is in cents)
        const amountYuan = amount / 100;
        let vipLevel = 0;
        if (amountYuan >= 99) vipLevel = 3;  // Annual gold
        else if (amountYuan >= 29.9) vipLevel = 3; // Monthly gold
        else if (amountYuan >= 9.9) vipLevel = 2; // Monthly silver

        if (vipLevel > 0) {
          const days = amountYuan >= 99 ? 365 : 30;
          const expiresAt = new Date(Date.now() + days * 86400000).toISOString();

          await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
              apikey: SUPABASE_SERVICE_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              vip_level: vipLevel,
              vip_expires_at: expiresAt,
            }),
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// Raw body is read via request.text() in App Router
