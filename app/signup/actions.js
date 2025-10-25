'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function confirmUserServer(userId) {
  if (!userId) return { ok: false, error: 'missing-user' };

  // Supabase-js v2: admin.updateUserById + email_confirm: true
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
