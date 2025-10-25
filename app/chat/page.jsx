'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Chat(){
  const [user, setUser] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  useEffect(()=>{ supabase.auth.getUser().then(({data})=>setUser(data.user)); },[]);
  function send(){
    if (!input) return;
    const text = input;
    setInput('');
    setMessages(m=>[...m, { me:true, text }, { me:false, text: `Hello világ, ${user?.email || 'ismeretlen'}!` }]);
  }
  if (!user) return <div className="card">Belépés szükséges.</div>;
  return (
    <div className="card">
      <h1>Chat (demo)</h1>
      <div className="mb-2" style={{minHeight:120}}>
        {messages.map((m,i)=>(
          <div key={i} className={m.me?'text-right':'text-left'}>
            <span className="inline-block px-2 py-1 my-1 rounded" style={{background:'#f3f3f3'}}>{m.text}</span>
          </div>
        ))}
      </div>
      <input className="w-full p-2 border rounded mb-2" placeholder="Írj valamit..." value={input} onChange={e=>setInput(e.target.value)} />
      <button className="px-3 py-2 border rounded" onClick={send}>Küld</button>
    </div>
  );
}
