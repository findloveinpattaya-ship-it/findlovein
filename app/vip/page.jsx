'use client';
import { useState } from 'react';

export default function VIP(){
  const [loading, setLoading] = useState(false);
  async function buy(){
    setLoading(true);
    const res = await fetch('/api/create-checkout-session', { method:'POST' });
    const data = await res.json();
    if (data.url) location.href = data.url; else setLoading(false);
  }
  return (
    <div className="card">
      <h1>VIP előfizetés</h1>
      <p>2 € / 7 nap</p>
      <button className="px-3 py-2 border rounded" disabled={loading} onClick={buy}>
        {loading? 'Továbbítás Stripe-ra...' : 'Vásárlás Stripe-on'}
      </button>
    </div>
  );
}
