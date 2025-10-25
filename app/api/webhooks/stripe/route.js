import Stripe from 'stripe';

export async function POST(req){
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  let event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    event = Stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  // MVP: csak napló
  console.log('Stripe event', event.type);
  return new Response('ok');
}

export const config = { api: { bodyParser: false } };
