// app/api/stripe-debug/route.ts
import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET() {
  const vars = {
    has_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    has_PRICE_ID: !!process.env.STRIPE_PRICE_ID,
    has_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };
  return NextResponse.json({ ok: true, stripeEnv: vars }, { status: 200 });
}
