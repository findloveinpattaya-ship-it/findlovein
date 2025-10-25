'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { t } from '@/lib/i18n';

export default function Header() {
  const [session, setSession] = useState(null);
  const [lang, setLang] = useState('hu');

  useEffect(() => {
    const l = localStorage.getItem('lang') || 'hu';
    setLang(l);
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  function switchLang() {
    const n = lang === 'hu' ? 'en' : 'hu';
    localStorage.setItem('lang', n);
    setLang(n);
    location.reload();
  }

  const L = (key)=> t(lang, key);

  return (
    <header className="p-4 border-b flex items-center justify-between">
      <Link href="/" className="font-bold">{/* eslint-disable-next-line @next/next/no-img-element */}
        <span>🇹🇭</span> {/**/} <span className="ml-2">FindLoveIn</span>
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/">{/* @ts-ignore */}{/* await */}</Link>
        <Link href="/profile">{/* ... */}</Link>
        <Link href="/chat">{/* ... */}</Link>
        <Link href="/vip">{/* ... */}</Link>
        <button onClick={switchLang} className="px-2 py-1 border rounded">{lang.toUpperCase()}</button>
        {session ? (
          <button onClick={()=>supabase.auth.signOut()} className="px-3 py-1 border rounded">Kijelentkezés</button>
        ) : (
          <>
            <Link href="/login" className="px-3 py-1 border rounded">Bejelentkezés</Link>
            <Link href="/signup" className="px-3 py-1 border rounded">Regisztráció</Link>
          </>
        )}
      </nav>
    </header>
  );
}
