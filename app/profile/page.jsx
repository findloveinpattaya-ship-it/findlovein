'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Profile(){
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('latogato');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [vipUntil, setVipUntil] = useState(null);

  useEffect(()=>{
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      setUser(u);
      if (!u) return;
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', u.id).single();
      if (prof) {
        setUsername(prof.username || '');
        setRole(prof.role || 'latogato');
        setAvatarUrl(prof.avatar_url || '');
        setVipUntil(prof.vip_until);
      }
    });
  },[]);

  async function save(){
    if (!user) return;
    const { error } = await supabase.from('profiles').upsert({ id: user.id, username, role, avatar_url: avatarUrl });
    if (!error) alert('Mentve.');
  }

  async function upload(ev){
    const file = ev.target.files[0];
    if (!file || !user) return;
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    }
  }

  return (
    <div className="card">
      <h1>Profil</h1>
      {!user && <p>Belépés szükséges.</p>}
      {user && (
        <>
          <div className="mb-2">VIP: {vipUntil ? new Date(vipUntil).toLocaleString() : '—'}</div>
          <input className="block w-full mb-2 p-2 border rounded" placeholder="Felhasználónév" value={username} onChange={e=>setUsername(e.target.value)} />
          <select className="block w-full mb-2 p-2 border rounded" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="tag">Tag</option>
            <option value="latogato">Látogató</option>
          </select>
          <div className="mb-2">
            {avatarUrl && <img src={avatarUrl} alt="avatar" style={{maxWidth:120, borderRadius:12}} />}
          </div>
          <input type="file" onChange={upload} className="mb-2" />
          <button className="px-3 py-2 border rounded" onClick={save}>Mentés</button>
        </>
      )}
    </div>
  );
}
