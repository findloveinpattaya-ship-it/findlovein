'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Logout() {
  useEffect(() => {
    supabase.auth.signOut().finally(() => { window.location.href = '/'; });
  }, []);
  return <p>Kijelentkezés…</p>;
}
