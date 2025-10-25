// app/api/create-checkout-session/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

export const runtime = 'nodejs';

// 1) Gyors "élek-e?" teszt GET-re, hogy lássuk, elér a böngésző
export async function GET() {
  return NextResponse.json({ ok: true, route: '/api/create-checkout-session', method: 'GET' });
}

// 2) A tényleges Stripe indítás POST-ra
export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY missing');

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    // Supabase user lekérés (be vagy-e jelentkezve)
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { get: (n) => cookieStore.get(n)?.value } }
    );
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) {
      const base = process.env.SITE_URL || 'http://localhost:3000';
      return NextResponse.redirect(new URL('/vip?need_login=1', base));
    }

    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    const priceId = process.env.STRIPE_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email || undefined,
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [{
            price_data: {
              currency: 'eur',
              product_data: { name: 'FindLoveIn VIP – 7 nap' },
              unit_amount: 200, // 2 €
            },
            quantity: 1,
          }],
      success_url: `${siteUrl}/vip?success=1`,
      cancel_url: `${siteUrl}/vip?canceled=1`,
      metadata: { user_id: user.id, vip_days: '7' },
    });

    if (!session?.url) throw new Error('stripe_session_missing_url');
    // 303 = átirányítás Stripe Checkoutra
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
