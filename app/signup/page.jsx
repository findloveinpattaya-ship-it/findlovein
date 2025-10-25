'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Signup(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invite, setInvite] = useState('');
  const [err, setErr] = useState('');
  async function submit(e){
    e.preventDefault();
    const res = await fetch('/api/invite/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code: invite }) });
    if (!res.ok) { setErr('Hibás meghívókód.'); return; }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setErr(error.message); else location.href='/profile';
  }
  return (
    <div className="card">
      <h1>Regisztráció</h1>
      <form onSubmit={submit}>
        <input className="block w-full mb-2 p-2 border rounded" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="block w-full mb-2 p-2 border rounded" placeholder="Jelszó" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="block w-full mb-2 p-2 border rounded" placeholder="Meghívókód" value={invite} onChange={e=>setInvite(e.target.value)} />
        <button className="px-3 py-2 border rounded">Regisztráció</button>
      </form>
      {err && <p className="text-red-600 mt-2">{err}</p>}
    </div>
  );
}
