'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function VIPSuccess(){
  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return;
      const until = new Date(Date.now()+7*24*60*60*1000).toISOString();
      await supabase.from('profiles').upsert({ id: u.id, vip_until: until });
    })();
  },[]);
  return <div className="card"><h1>Sikeres fizetés!</h1><p>VIP aktiválva 7 napra.</p></div>;
}
