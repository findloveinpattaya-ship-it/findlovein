'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;

    // 1) első betöltéskor: ha nincs session → login
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      const session = data?.session;
      if (!session) {
        window.location.href = '/login';
        return;
      }
      if (alive) {
        setUser(session.user);
        setLoading(false);
      }
    });

    // 2) ha közben lejár / kijelentkezik → azonnal loginra dobjuk
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) window.location.href = '/login';
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-4">Betöltés…</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Profil</h1>

      <div className="border rounded p-4 mb-4">
        <p><strong>E-mail:</strong> {user?.email}</p>
        <p className="mt-1">
          <strong>Felhasználó ID:</strong>{' '}
          <code className="break-all">{user?.id}</code>
        </p>
      </div>

      <div className="flex gap-2">
        <a href="/logout" className="px-3 py-2 border rounded">Kijelentkezés</a>
        <a href="/" className="px-3 py-2 border rounded">Főoldal</a>
      </div>

      {err && <p className="text-red-600 mt-4">{err}</p>}
    </div>
  );
}
