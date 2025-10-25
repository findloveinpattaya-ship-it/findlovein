# FindLoveIn (Pattaya) — MVP (Next.js + Supabase + Stripe TEST)

Minimal, Vercelre feltölthető MVP.
- Auth: Supabase (email/jelszó)
- Szerepkör: Tag / Látogató (profilban állítható)
- Meghívókód: .env `INVITE_MASTER_CODE` alapján
- Képfeltöltés: Supabase Storage `avatars` bucket
- Chat: "Hello világ" demo
- VIP: Stripe Checkout (2 € / 7 nap) — MVP-ben a **VIP státusz kliensoldalon frissül** a sikeres fizetés után (RLS engedi a saját profil frissítését). PROD előtt szigorítsd (webhook + szerviz kulcs).

## Telepítés (Vercel)
1) **Upload Project** → ezt a ZIP-et töltsd fel.
2) A Vercelben állítsd be a környezeti változókat a `.env.example` alapján.
3) **Supabase**: EU projekt javasolt. Vidd fel az alábbi sémát és seedet:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
   - Storage: hozz létre `avatars` buckettet, `Public` hozzáféréssel.
4) **Stripe (TEST)**:
   - Hozz létre egy `Price`-t (2 € / 7 nap, recurring, 1 week),
   - Másold a `price_...` azonosítót a `STRIPE_PRICE_ID`-be.
   - Állítsd be a **Checkout** success/cancel URL-eket (Vercel domain):
     - Success: `${APP_BASE_URL}/vip/success`
     - Cancel:  `${APP_BASE_URL}/vip/cancel`
5) **Webhook (opcionális, MVP-hez nem szükséges)**:
   - URL: `${APP_BASE_URL}/api/webhooks/stripe`
   - Eventek: `checkout.session.completed`
   - **STRIPE_WEBHOOK_SECRET** értékét másold be a Vercelbe.
   - Megjegyzés: MVP-ben a webhook csak naplóz. PROD-hoz javasolt Supabase service role kulcs és szerveroldali frissítés.

## Fejlesztői futtatás
```bash
npm i
cp .env.example .env.local  # töltsd ki
npm run dev
```

## Zárt teszt mód
- Ha `.env`-ben `CLOSED_TEST=true`, a site csak kulccsal érhető el: nyitólapon kér egy hozzáférési kódot (megegyezik a `INVITE_MASTER_CODE`-del), amit sütiben tárol.

## Fordítások (HU/EN)
- A `public/translations.csv` tartalmazza a kulcsokat és HU/EN stringeket.
- Client oldali i18n töltés: `lib/i18n.js`.

## Biztonsági megjegyzések (MVP)
- A `profiles` táblán az RLS engedi a **saját profil** frissítését (pl. `vip_until`). Ez MVP-hez jó, de PROD-ban **webhook + szerveroldali** frissítést használj.
- Meghívókód jelenleg .env alapon ellenőrzött.

## Stripe ár beállítása
- Recurring, Amount: 2 EUR, Billing period: 1 week.
- A PRICE ID megy a `STRIPE_PRICE_ID` változóba.

reload
