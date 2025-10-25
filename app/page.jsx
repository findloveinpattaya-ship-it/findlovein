'use client';

import { useEffect, useState } from 'react';

export default function VipPage() {
  const [status, setStatus] = useState({ active: false, until: null });

  useEffect(() => {
    fetch('/api/vip-status').then(async (r) => {
      if (r.ok) setStatus(await r.json());
    });
  }, []);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Előfizetés</h1>

      {status.active ? (
        <div className="rounded-xl border p-4">
          <div className="font-medium">VIP aktív eddig:</div>
          <div>{status.until ? new Date(status.until).toLocaleString() : '-'}</div>

          <form action="/api/create-checkout-session" method="POST" className="mt-4">
            <button type="submit" className="px-4 py-2 rounded-xl border">
              +7 nap (2 €)
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-xl border p-4">
          <div className="mb-2">VIP-od lejárt.</div>

          <form action="/api/create-checkout-session" method="POST">
            <button type="submit" className="px-4 py-2 rounded-xl border">
              Előfizetek (2 € / 7 nap)
            </button>
          </form>
        </div>
      )}

      <p className="text-sm text-gray-500">
        Nincs automatikus megújítás. A vásárlásról Stripe küld visszaigazolást/számlát.
      </p>
    </main>
  );
}
