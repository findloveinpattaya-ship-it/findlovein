// app/api/pay/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs"; // Stripe-hoz Node runtime kell

// Gyors GET teszt, hogy él-e a route
export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/pay" }, { status: 200 });
}

// (Ha később űrlap/idegen origin hívná)
export async function OPTIONS() {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  return new Response(null, { status: 204, headers });
}

export async function POST(req: Request) {
  try {
    const corsHeaders = { "Access-Control-Allow-Origin": "*" };

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Hiányzik a STRIPE_SECRET_KEY." },
        { status: 500, headers: corsHeaders }
      );
    }
    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });

    // Bemenet (JSON vagy urlencoded form) – opcionális
    let priceId: string | undefined;
    let successUrl: string | undefined;
    let cancelUrl: string | undefined;

    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const body = (await req.json()) as any;
      priceId = body?.priceId;
      successUrl = body?.successUrl;
      cancelUrl = body?.cancelUrl;
    } else if (ct.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      priceId = (form.get("priceId") as string) || undefined;
      successUrl = (form.get("successUrl") as string) || undefined;
      cancelUrl = (form.get("cancelUrl") as string) || undefined;
    }

    // Ha nincs a body-ban, az env-ből vesszük
    priceId = priceId || process.env.STRIPE_PRICE_ID || undefined;
    if (!priceId) {
      return NextResponse.json(
        { error: "Hiányzik a priceId (body vagy STRIPE_PRICE_ID)!" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Domain alapú default success/cancel
    const host =
      req.headers.get("origin") ||
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host");
    const origin =
      typeof host === "string"
        ? host.startsWith("http")
          ? host
          : `https://${host}`
        : "http://localhost:3000";

    successUrl =
      successUrl || `${origin}/vip/success?session_id={CHECKOUT_SESSION_ID}`;
    cancelUrl = cancelUrl || `${origin}/vip/cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Nincs session.url a Stripe válaszban." },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { url: session.url, id: session.id },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Stripe POST error", err);
    return NextResponse.json(
      { error: err?.message || "Ismeretlen hiba a /api/pay POST-ban." },
      { status: 500 }
    );
  }
}
