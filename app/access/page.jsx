'use client';
import { useState } from 'react';

export default function Access(){
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  async function submit(e){
    e.preventDefault();
    const res = await fetch('/api/invite/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code }) });
    if (res.ok) {
      document.cookie = 'access_granted=1; Path=/; Max-Age=2592000; SameSite=Lax';
      location.href = '/';
    } else {
      setErr('Rossz kulcs.');
    }
  }
  return (
    <div className="card">
      <h1>Zárt teszt mód</h1>
      <form onSubmit={submit}>
        <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Hozzáférési kulcs" className="block w-full mb-2 p-2 border rounded" />
        <button className="px-3 py-2 border rounded">Belépés</button>
      </form>
      {err && <p className="text-red-600 mt-2">{err}</p>}
    </div>
  );
}
