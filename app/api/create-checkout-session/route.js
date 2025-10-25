import Stripe from 'stripe';

export async function POST(){
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const price = process.env.STRIPE_PRICE_ID;
  const base = process.env.APP_BASE_URL || 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price, quantity: 1 }],
    success_url: `${base}/vip/success`,
    cancel_url: `${base}/vip/cancel`,
  });
  return new Response(JSON.stringify({ url: session.url }), { headers: { 'Content-Type': 'application/json' } });
}
