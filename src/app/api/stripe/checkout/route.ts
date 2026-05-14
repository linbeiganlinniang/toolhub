import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for VIP membership.
 * 
 * Environment variables needed:
 *   STRIPE_SECRET_KEY (sk_test_... or sk_live_...)
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_... or pk_live_...)
 * 
 * Request body:
 *   { price: number, planName: string }
 */
export async function POST(request: NextRequest) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY env var." },
      { status: 503 }
    );
  }

  const origin = request.headers.get("origin") || "https://toolhub-cn.netlify.app";

  try {
    const { price, planName, userId, userEmail } = await request.json();

    if (!price || !planName) {
      return NextResponse.json({ error: "Missing price or planName" }, { status: 400 });
    }

    // Create Stripe Checkout Session via REST API
    const session = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "payment",
        "payment_method_types[]": "card",
        "line_items[0][price_data][currency]": "cny",
        "line_items[0][price_data][product_data][name]": planName,
        "line_items[0][price_data][unit_amount]": String(Math.round(price * 100)),
        "line_items[0][quantity]": "1",
        "success_url": `${origin}/vip?success=true`,
        "cancel_url": `${origin}/sponsor?cancelled=true`,
        "client_reference_id": userId || "",
        "customer_email": userEmail || "",
      }),
    });

    const data = await session.json();

    if (!session.ok) {
      return NextResponse.json({ error: data.error?.message || "Stripe error" }, { status: 400 });
    }

    return NextResponse.json({ url: data.url, sessionId: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
