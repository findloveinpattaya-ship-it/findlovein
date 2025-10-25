'use client';

export default function VipSuccess() {
  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow text-center">
      <h1 className="text-2xl font-semibold mb-2 text-green-600">Sikeres fizetés</h1>
      <p className="mb-4">
        Köszönjük! A VIP státuszod néhány percen belül aktiválódik.
      </p>
      <a
        href="/profile"
        className="inline-block px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        Vissza a profilra
      </a>
    </div>
  );
}
