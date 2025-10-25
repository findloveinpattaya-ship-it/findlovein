'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);

  // bejelentkezett user lekérése
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = '/login';
        return;
      }
      setUser(data.user);
    })();
  }, []);

  // ide csak „hello világ” szintű chat lesz: lokális, nem adatbázisos
  function sendMsg(e) {
    e.preventDefault();
    if (!msg.trim()) return;
    setChat([...chat, { user: user?.email, text: msg }]);
    setMsg('');
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center">Chat (tesztverzió)</h1>

      <div className="border rounded p-3 h-64 overflow-y-auto bg-gray-50 mb-3">
        {chat.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-10">
            Írj valamit… (ez még csak helyi teszt)
          </p>
        ) : (
          chat.map((m, i) => (
            <div key={i} className="mb-2">
              <b>{m.user || 'ismeretlen'}:</b> {m.text}
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMsg} className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Írj üzenetet…"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Küldés
        </button>
      </form>
    </div>
  );
}
