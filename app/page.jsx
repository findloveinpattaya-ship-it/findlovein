'use client';
import { useEffect, useState } from 'react';
import Cookies from 'cookie';
export default function Home(){
  const [ok, setOk] = useState(true);
  const closed = process.env.NEXT_PUBLIC_CLOSED_TEST || process.env.CLOSED_TEST;
  useEffect(()=>{
    const isClosed = (closed === 'true' || closed === true);
    if (!isClosed) return;
    const has = document.cookie.split('; ').find(x=>x.startsWith('access_granted='));
    setOk(!!has);
  },[]);
  if (!ok) {
    return (
      <div className="card">
        <h1>Zárt teszt mód</h1>
        <p>Kérlek, nyisd meg az <strong>/access</strong> oldalt és add meg a kulcsot.</p>
      </div>
    );
  }
  return (
    <div className="card">
      <h1>FindLoveIn (Pattaya)</h1>
      <p>MVP. Regisztrálj, tölts fel képet, csevegj „hello világ”-ig, és próbáld ki a VIP-et.</p>
    </div>
  );
}
