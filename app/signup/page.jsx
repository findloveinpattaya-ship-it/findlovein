'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const MASTER = process.env.NEXT_PUBLIC_INVITE_MASTER_KEY || '';

export default function Signup() {
  const [invite, setInvite] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setInfo('');
    const code = (invite || '').trim();

    if (!code) { setErr('Meghívókód szükséges.'); return; }

    // Invite ellenőrzés (ha nem MASTER kulcs)
    if (!MASTER || code !== MASTER) {
      const { data, error } = await supabase.rpc('use_invite', { p_code: code });
      if (error) { setErr('Hálózati hiba az invite ellenőrzésnél.'); return; }
      const res = Array.isArray(data) ? data[0] : data;
      if (!res?.ok) {
        const map = {
          invalid_code: 'A megadott kód érvénytelen.',
          inactive_code: 'Ez a kód inaktív.',
          expired_code: 'Ez a kód lejárt.',
          exhausted_code: 'Ezt a kódot már elhasználták.',
        };
        setErr(map[res?.msg] || 'A kód nem használható.');
        return;
      }
    }

    setBusy(true);
    const { error: signErr } = await supabase.auth.signUp({ email, password });
    setBusy(false);

    if (signErr) { setErr(signErr.message); return; }

    // Free csomagban e-mail megerősítés kell → tiszta üzenet és űrlap elrejtése
    setDone(true);
    setInfo(`Elküldtük a megerősítő e-mailt a(z) ${email} címre. Kattints a levélben található linkre, majd jelentkezz be a /login oldalon.`);
  }

  async function resend() {
    setErr(''); setInfo('');
    if (!email) { setErr('Adj meg egy e-mail címet, majd próbáld újraküldeni.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setBusy(false);
    if (error) setErr(error.message);
    else setInfo('Újraküldtük a megerősítő e-mailt. Nézd meg a Beérkezett/Spam/Promóciók mappát is.');
  }

  return (
    <div className="card max-w-sm mx-auto mt-10 p-4 border rounded shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center">Regisztráció</h1>

      {!done ? (
        <form onSubmit={submit}>
          <input
            className="block w-full mb-2 p-2 border rounded"
            placeholder="Meghívókód"
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
          />
          <input
            className="block w-full mb-2 p-2 border rounded"
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="block w-full mb-3 p-2 border rounded"
            placeholder="Jelszó (min. 6 karakter)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={busy}
            className="w-full px-3 py-2 border rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-60"
          >
            {busy ? 'Feldolgozás…' : 'Regisztráció'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-green-700">{info}</p>
          <div className="flex gap-2">
            <button
              onClick={resend}
              disabled={busy}
              className="px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-60"
            >
              {busy ? 'Küldés…' : 'Megerősítő e-mail újraküldése'}
            </button>
            <a
              href="/login"
              className="px-3 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Tovább a bejelentkezéshez
            </a>
          </div>
        </div>
      )}

      {err && <p className="text-red-600 mt-2 text-center">{err}</p>}
      {!done && info && <p className="text-green-600 mt-2 text-center">{info}</p>}
    </div>
  );
}
