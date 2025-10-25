-- Profiles tábla
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  role text check (role in ('tag','latogato')) default 'latogato',
  avatar_url text,
  vip_until timestamptz,
  created_at timestamptz default now()
);

-- Meghívók (opcionális, most .env kódot használunk)
create table if not exists public.invites (
  code text primary key,
  used_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;

-- Saját profil olvasás/írás
create policy "select own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "upsert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Sign-up után automatikusan létrehozhatod a profilt egy triggerrel (opcionális).
-- Ehhez a Supabase Auth hookokat is használhatod; MVP-ben a kliens upserteli.
