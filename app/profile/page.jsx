'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('visitor');
  const [avatarPath, setAvatarPath] = useState('');
  const [avatarSignedUrl, setAvatarSignedUrl] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      setErr('');
      setMsg('');
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        window.location.href = '/login';
        return;
      }

      setUserId(user.id);

      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('display_name, role, avatar_url')
        .eq('id', user.id)
        .single();

      // PGRST116 = "No rows" – ilyenkor létrehozzuk
      if (profErr && profErr.code !== 'PGRST116') {
        setErr(profErr.message);
        setLoading(false);
        return;
      }

      if (!prof) {
        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert({ id: user.id, role: 'visitor' }, { onConflict: 'id' });
        if (upsertErr) setErr(upsertErr.message);
      } else {
        setName(prof.display_name || '');
        setRole(prof.role || 'visitor');
        setAvatarPath(prof.avatar_url || '');
      }

      setLoading(false);
    })();
  }, []);

  async function refreshAvatarSignedUrl(path) {
    if (!path) {
      setAvatarSignedUrl('');
      return;
    }
    const { data, error } = await supabase
      .storage
      .from('avatars')
      .createSignedUrl(path, 60 * 60);
    if (error) {
      setErr(error.message);
      setAvatarSignedUrl('');
      return;
    }
    setAvatarSignedUrl(data.signedUrl);
  }

  useEffect(() => {
    if (avatarPath) {
      refreshAvatarSignedUrl(avatarPath);
    }
  }, [avatarPath]);

  async function saveProfile(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', userId);
    if (error) setErr(error.message);
    else setMsg('Profil frissítve.');
  }

  async function uploadAvatar(e) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setErr('');
    setMsg('');

    if (file.size > 10 * 1024 * 1024) {
      setErr('A fájl túl nagy (max. 10 MB).');
      return;
    }

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase
      .storage
      .from('avatars')
      .upload(path, file, { upsert: false });

    if (uploadErr) {
      setErr(uploadErr.message);
      return;
    }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ avatar_url: path })
      .eq('id', userId);

    if (updateErr) {
      setErr(updateErr.message);
      return;
    }

    setAvatarPath(path);
    setMsg('Kép feltöltve.');
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  if (loading) {
    return <div className="max-w-sm mx-auto mt-10 p-4">Betöltés…</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <button
          onClick={logout}
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          Kilépés
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
          {avatarSignedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSignedUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm text-gray-500">nincs kép</span>
          )}
        </div>
        <label className="text-sm">
          <span className="block mb-1">Új profilkép</span>
          <input type="file" accept="image/*" onChange={uploadAvatar} />
        </label>
      </div>

      <form onSubmit={saveProfile} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Megjelenő név</label>
          <input
            className="block w-full p-2 border rounded"
            placeholder="Pl. Laci"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Szerep</label>
          <input
            className="block w-full p-2 border rounded bg-gray-50"
            value={role}
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            A VIP előfizetés után ez automatikusan <b>vip</b>-re vált.
          </p>
        </div>

        <button className="w-full px-3 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600">
          Mentés
        </button>
      </form>

      {err && <p className="text-red-600 mt-3 text-center">{err}</p>}
      {msg && <p className="text-green-600 mt-3 text-center">{msg}</p>}
    </div>
  );
}
