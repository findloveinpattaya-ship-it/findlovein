'use client';
export const dynamic = 'force-dynamic';

import { useState, useTransition } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { confirmUserServer } from './actions'; // ← SERVER ACTION

const MASTER = process.env.NEXT_PUBLIC_INVITE_MASTER_KEY || '';

export default function Signup() {
  const [invite, setInvite] = useState('');
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [pending, startTransition] = useTransition();

  async function submit(e) {
    e.preventDefault();
    setErr(''); setMsg('');

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

    // Regisztráció
    const { data: signData, error: signErr } = await supabase.auth.signUp({ email, password });
    if (signErr) { setErr(signErr.message); return; }

    const userId = signData?.user?.id;
    if (!userId) { setErr('User létrejött, de azonosító nincs.'); return; }

    // SERVER: jelöljük megerősítettnek (Team csomag nélkül is)
    startTransition(async () => {
      const res = await confirmUserServer(userId);
      if (!res?.ok) {
        setErr('Regisztráció sikeres, de a megerősítés elakadt: ' + (res?.error || 'ismeretlen hiba'));
        return;
      }
      setMsg('Sikeres regisztráció! Most már bejelentkezhetsz.');
    });
  }

  return (
    <div className="card max-w-sm mx-auto mt-10 p-4 border rounded shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center">Regisztráció</h1>
      <form onSubmit={submit}>
        <input className="block w-full mb-2 p-2 border rounded" placeholder="Meghívókód"
               value={invite} onChange={(e)=>setInvite(e.target.value)} />
        <input className="block w-full mb-2 p-2 border rounded" placeholder="E-mail" type="email"
               value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="block w-full mb-3 p-2 border rounded" placeholder="Jelszó (min. 6 karakter)" type="password"
               value={password} onChange={(e)=>setPassword(e.target.value)} />

        <button disabled={pending} className="w-full px-3 py-2 border rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-60">
          {pending ? 'Feldolgozás…' : 'Regisztráció'}
        </button>
      </form>
      {err && <p className="text-red-600 mt-2 text-center">{err}</p>}
      {msg && <p className="text-green-600 mt-2 text-center">{msg}</p>}
    </div>
  );
}
