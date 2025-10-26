// app/api/stripe/webhook/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ✅ ez váltja ki a régi runtime/export config hibát

export async function POST(req) {
  try {
    // ide jön majd a Stripe webhook logika (most elég egy tesztválasz)
    const body = await req.text();
    console.log("Webhook event received:", body);
    return NextResponse.json({ ok: true, msg: "Stripe webhook received" }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
