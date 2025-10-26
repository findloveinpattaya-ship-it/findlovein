// app/pay-test/page.jsx
"use client";
import { useState } from "react";

export default function PayTestPage() {
  const [log, setLog] = useState("");

  async function start(e) {
    e.preventDefault();
    setLog("Küldöm a kérést...");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // ha az API env-ből veszi a priceId-t, ez elég
      });

      const data = await res.json().catch(() => ({}));
      setLog(JSON.stringify(data, null, 2));

      if (res.ok && data?.url) {
        window.location.href = data.url; // átirányítás Stripe Checkout-ra
      } else {
        alert("Nem jött URL. Nézd meg a logot lent.");
      }
    } catch (err) {
      setLog("Hiba: " + (err?.message || "ismeretlen"));
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Stripe Pay – teszt</h1>
      <form onSubmit={start} className="space-y-3">
        <button className="px-4 py-2 rounded bg-black text-white">
          Indítsd a Checkoutot
        </button>
      </form>
      <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
        {log || "Még nincs log."}
      </pre>
    </main>
  );
}
