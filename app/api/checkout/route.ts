// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

// Stripe csak Node runtime-on működik
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

async function go() {
  // belépett user ellenőrzés
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
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
            unit_amount: 200,
          },
          quantity: 1,
        }],
    success_url: `${siteUrl}/vip?success=1`,
    cancel_url: `${siteUrl}/vip?canceled=1`,
    metadata: { user_id: user.id, vip_days: '7' },
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}

export async function GET()  { return go(); }
export async function POST() { return go(); }
