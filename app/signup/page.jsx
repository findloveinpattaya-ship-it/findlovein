'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setMsg('');

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setErr(error.message);
    } else {
      setMsg('Sikeres regisztráció! Nézd meg az e-mailjeidet a megerősítéshez.');
    }
  }

  return (
    <div className="card max-w-sm mx-auto mt-10 p-4 border rounded shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center">Regisztráció</h1>

      <form onSubmit={submit}>
        <input
          className="block w-full mb-2 p-2 border rounded"
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="block w-full mb-2 p-2 border rounded"
          placeholder="Jelszó (min. 6 karakter)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full px-3 py-2 border rounded bg-green-500 text-white hover:bg-green-600">
          Regisztráció
        </button>
      </form>

      {err && <p className="text-red-600 mt-2 text-center">{err}</p>}
      {msg && <p className="text-green-600 mt-2 text-center">{msg}</p>}
    </div>
  );
}
