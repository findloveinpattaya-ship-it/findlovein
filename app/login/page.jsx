'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  async function submit(e){
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message); else location.href='/profile';
  }
  return (
    <div className="card">
      <h1>Bejelentkezés</h1>
      <form onSubmit={submit}>
        <input className="block w-full mb-2 p-2 border rounded" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="block w-full mb-2 p-2 border rounded" placeholder="Jelszó" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="px-3 py-2 border rounded">Belépés</button>
      </form>
      {err && <p className="text-red-600 mt-2">{err}</p>}
    </div>
  );
}
