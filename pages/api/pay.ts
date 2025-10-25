// pages/api/pay.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

function json(res: NextApiResponse, status: number, data: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(status).json(data);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return json(res, 200, { ok: true, route: "/api/pay" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET,POST,OPTIONS");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) return json(res, 500, { error: "Hiányzik a STRIPE_SECRET_KEY." });

    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });

    // --- Body (JSON vagy urlencoded) ---
    const ct = (req.headers["content-type"] || "") as string;
    let priceId: string | undefined;
    let successUrl: string | undefined;
    let cancelUrl: string | undefined;

    if (ct.includes("application/json")) {
      const b = req.body as any;
      priceId = b?.priceId;
      successUrl = b?.successUrl;
      cancelUrl = b?.cancelUrl;
    } else if (ct.includes("application/x-www-form-urlencoded")) {
      const b = req.body as any;
      priceId = b?.priceId;
      successUrl = b?.successUrl;
      cancelUrl = b?.cancelUrl;
    }

    priceId = priceId || process.env.STRIPE_PRICE_ID || undefined;
    if (!priceId) return json(res, 400, { error: "Hiányzik a priceId (body vagy STRIPE_PRICE_ID)!" });

    // --- Origin (Vercel) ---
    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "localhost:3000";
    const origin = `${proto}://${host}`;

    successUrl = successUrl || `${origin}/vip/success?session_id={CHECKOUT_SESSION_ID}`;
    cancelUrl = cancelUrl || `${origin}/vip/cancel`;

    // --- Stripe Checkout session ---
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    if (!session.url) return json(res, 500, { error: "Nincs session.url a Stripe válaszban." });

    return json(res, 200, { url: session.url, id: session.id });
  } catch (err: any) {
    console.error("Stripe /api/pay error:", err);
    return json(res, 500, { error: err?.message || "Ismeretlen hiba a /api/pay POST-ban." });
  }
}
