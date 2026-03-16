-- ═══════════════════════════════════════════════
-- HOWNER MVP — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════

-- 1. USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text default '',
  type text default 'particulier' check (type in ('particulier','artisan','agent','promoteur','courtier')),
  credits integer default 0,
  tickets integer default 0,
  referral_code text unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  referred_by uuid references users(id),
  avatar_url text,
  bio text default '',
  location text default '',
  created_at timestamptz default now()
);

-- 2. LISTINGS
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  type text not null check (type in ('vente','location','neuf')),
  title text not null,
  location text not null,
  price integer not null,
  surface integer default 0,
  rooms integer default 0,
  description text default '',
  source text default 'howner' check (source in ('howner','leboncoin','seloger','pap','bienici')),
  external_url text,
  is_native boolean default true,
  images text[] default '{}',
  dpe text default '',
  created_at timestamptz default now()
);

-- 3. SWIPES
create table if not exists swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references users(id),
  swiped_id uuid not null references users(id),
  direction text not null check (direction in ('left','right')),
  created_at timestamptz default now(),
  unique(swiper_id, swiped_id)
);

-- 4. MATCHES
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references users(id),
  user_b uuid not null references users(id),
  status text default 'matched' check (status in ('pending_a','pending_b','matched','rejected')),
  created_at timestamptz default now()
);

-- 5. CREDIT TRANSACTIONS
create table if not exists credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  amount integer default 0,
  tickets integer default 0,
  type text not null check (type in ('purchase','referral','signup_bonus','ai_usage')),
  stripe_payment_id text,
  created_at timestamptz default now()
);

-- 6. AI TASKS
create table if not exists ai_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  type text not null,
  input jsonb default '{}',
  output jsonb default '{}',
  created_at timestamptz default now()
);

-- 7. PRO SUBSCRIPTIONS
create table if not exists pro_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  plan text not null check (plan in ('free','artisan','agent','promoteur')),
  stripe_subscription_id text,
  active boolean default true,
  created_at timestamptz default now()
);

-- 8. CONTEST (tirage)
create table if not exists contest (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  villa_title text not null,
  villa_price integer not null,
  villa_location text not null,
  villa_details text default '',
  total_tickets_target integer default 200000,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 9. ACTIVITY LOG (for live ticker)
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action text not null check (action in ('signup','referral','credit_purchase','ai_usage','match','listing_created')),
  details jsonb default '{}',
  created_at timestamptz default now()
);

-- ═══ INDEXES ═══
create index if not exists idx_users_phone on users(phone);
create index if not exists idx_users_referral on users(referral_code);
create index if not exists idx_listings_type on listings(type);
create index if not exists idx_listings_location on listings(location);
create index if not exists idx_swipes_swiper on swipes(swiper_id);
create index if not exists idx_swipes_swiped on swipes(swiped_id);
create index if not exists idx_ai_tasks_user on ai_tasks(user_id);
create index if not exists idx_activity_log_recent on activity_log(created_at desc);
create index if not exists idx_credit_tx_user on credit_transactions(user_id);

-- ═══ ROW LEVEL SECURITY ═══
-- (Using service key in API routes so RLS is bypassed,
--  but enable it as good practice)
alter table users enable row level security;
alter table listings enable row level security;
alter table swipes enable row level security;
alter table matches enable row level security;
alter table credit_transactions enable row level security;
alter table ai_tasks enable row level security;
alter table pro_subscriptions enable row level security;
alter table activity_log enable row level security;

-- Service role policy (allows everything for service key)
create policy "service_all" on users for all using (true) with check (true);
create policy "service_all" on listings for all using (true) with check (true);
create policy "service_all" on swipes for all using (true) with check (true);
create policy "service_all" on matches for all using (true) with check (true);
create policy "service_all" on credit_transactions for all using (true) with check (true);
create policy "service_all" on ai_tasks for all using (true) with check (true);
create policy "service_all" on pro_subscriptions for all using (true) with check (true);
create policy "service_all" on activity_log for all using (true) with check (true);

-- ═══ SEED: Mock Listings ═══
insert into listings (type, title, location, price, surface, rooms, description, source, is_native, external_url) values
  ('vente', 'T3 lumineux centre-ville', 'Bayonne · Petit Bayonne', 245000, 68, 3, 'Bel appartement traversant, 2 chambres, cuisine équipée, cave. Proche commerces et Nive.', 'seloger', false, null),
  ('location', 'T2 meublé standing', 'Anglet · Chambre d''Amour', 890, 45, 2, 'Meublé neuf, 1 chambre, parking, à 300m de la plage. Charges comprises.', 'leboncoin', false, null),
  ('vente', 'Villa T5 piscine', 'Biarritz · Côte des Basques', 895000, 165, 5, 'Villa architecte, 5 chambres, piscine chauffée, jardin 400m², vue océan.', 'howner', true, null),
  ('neuf', 'Programme Les Allées — 4 lots', 'Bayonne · Saint-Esprit', 195000, 45, 2, 'Du T2 au T4, RT2020, PTZ éligible, livraison Q3 2027. Parking inclus.', 'howner', true, null),
  ('location', 'Maison T4 avec jardin', 'Boucau · Boucau Haut', 1350, 110, 4, '3 chambres, jardin 200m², garage, quartier calme, proche écoles.', 'pap', false, null),
  ('vente', 'T4 rénové vue Nive', 'Bayonne · Grand Bayonne', 320000, 85, 4, 'Rénové 2024, 3 chambres, terrasse 12m², parquet, DPE B.', 'bienici', false, null),
  ('vente', 'T2 investisseur', 'Anglet · 5 Cantons', 178000, 38, 2, 'Idéal investissement locatif, 1 chambre, loué 680€/mois, rentabilité 4.6%.', 'seloger', false, null),
  ('neuf', 'Résidence Océane — 8 lots', 'Biarritz · La Négresse', 285000, 62, 3, 'T3 neuf, terrasse 15m², 2 parkings, prestations haut de gamme. RE2020.', 'howner', true, null),
  ('location', 'Studio meublé étudiant', 'Bayonne · Marracq', 520, 22, 1, 'Meublé, proche fac et gare, coin cuisine, SDB neuve. Charges incluses.', 'leboncoin', false, null),
  ('vente', 'Maison T6 familiale', 'Mouguerre · Centre', 425000, 145, 6, '5 chambres, jardin 600m², garage double, vue Pyrénées. Quartier recherché.', 'pap', false, null);

-- ═══ SEED: Active Contest ═══
insert into contest (name, villa_title, villa_price, villa_location, villa_details, is_active) values
  ('Concours Villa Boucau', 'Villa Boucau', 695000, 'Boucau · Pays Basque', '149m² · 4 chambres · R+1 · Architecte intégré · Finitions Porcelanosa · Construction LSF · Livrée par Affinity Home', true);
