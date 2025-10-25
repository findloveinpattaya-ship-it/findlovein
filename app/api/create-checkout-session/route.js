// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

// FONTOS: Node runtime kell Stripe-hoz
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST() {
  try {
    // Supabase user lekérés (be vagy-e jelentkezve)
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      { cookies: { get: (n) => cookieStore.get(n)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });

    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    const priceId = process.env.STRIPE_PRICE_ID; // ha nincs, price_data lesz 2 EUR-ral

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email || undefined,
      line_items: priceId ? [
        { price: priceId, quantity: 1 }
      ] : [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'FindLoveIn VIP – 7 nap' },
            unit_amount: 200, // 2 €
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/vip?success=1`,
      cancel_url: `${siteUrl}/vip?canceled=1`,
      metadata: {
        user_id: user.id,
        vip_days: '7',
      },
    });

    if (!session?.url) {
      return NextResponse.json({ error: 'stripe_session_missing_url' }, { status: 500 });
    }
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'checkout_failed' }, { status: 500 });
  }
}
