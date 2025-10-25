// app/api/create-checkout-session/route.js
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ ok: true, where: '/api/create-checkout-session', method: 'GET' });
}
export async function POST() {
  return NextResponse.json({ ok: true, where: '/api/create-checkout-session', method: 'POST' });
}
