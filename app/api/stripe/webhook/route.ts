// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Stripe-hoz Node runtime kell
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: Request) {
  const sig = headers().get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json({ ok: false, reason: 'missing_signature_or_secret' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = (session.metadata?.user_id as string) || null;

    if (userId) {
      const starts = new Date();
      const ends = new Date(starts.getTime() + 7 * 24 * 60 * 60 * 1000);

      const sb = supabaseAdmin();
      await sb.from('vip_access').insert({
        user_id: userId,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        status: 'active',
        stripe_payment_id: (session.payment_intent as string) || null,
        receipt_url: (session as any)?.receipt_url || null,
      });
    }
  }

  return NextResponse.json({ received: true });
}
