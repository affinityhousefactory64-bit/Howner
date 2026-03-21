-- ═══════════════════════════════════════════════
-- HOWNER — Supabase Schema
-- Run in: Supabase Dashboard > SQL Editor
-- DROP + RECREATE — only for fresh installs
-- ═══════════════════════════════════════════════

-- Drop old tables if they exist (dev only)
drop table if exists activity_log cascade;
drop table if exists reviews cascade;
drop table if exists credit_usage cascade;
drop table if exists credit_purchases cascade;
drop table if exists swipes cascade;
drop table if exists matches cascade;
drop table if exists listings cascade;
drop table if exists contest cascade;
drop table if exists users cascade;

-- ═══ 1. USERS ═══
create table users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text default '',
  type text default 'particulier' check (type in ('particulier','pro')),
  pro_category text check (pro_category in ('agent','artisan','courtier','promoteur','diagnostiqueur','demenageur','architecte')),
  pro_specialty text,
  pro_zone text,
  pro_photo text,
  pro_rating decimal,
  pro_transactions int default 0,
  credits integer default 0,
  tickets integer default 1,
  free_listing_used boolean default false,
  referral_code text unique not null,
  referred_by uuid references users(id),
  created_at timestamptz default now()
);

-- ═══ 2. LISTINGS ═══
create table listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  category text not null check (category in ('immo','service','demande')),
  subcategory text not null check (subcategory in ('vente','location','recherche_achat','recherche_location','offre_service','recherche_service')),
  title text not null,
  description text default '',
  location text default '',
  price integer,
  surface integer,
  rooms integer,
  is_boosted boolean default false,
  boost_expires_at timestamptz,
  alert_active boolean default false,
  alert_expires_at timestamptz,
  created_at timestamptz default now()
);

-- ═══ 3. SWIPES ═══
create table swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references users(id),
  swiped_id uuid not null references users(id),
  direction text not null check (direction in ('left','right')),
  created_at timestamptz default now(),
  unique(swiper_id, swiped_id)
);

-- ═══ 4. MATCHES ═══
create table matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references users(id),
  user_b uuid not null references users(id),
  created_at timestamptz default now()
);

-- ═══ 5. CREDIT PURCHASES ═══
create table credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  pack_type text not null,
  credits integer not null,
  tickets integer not null,
  amount_cents integer not null,
  stripe_payment_id text,
  created_at timestamptz default now()
);

-- ═══ 6. CREDIT USAGE ═══
create table credit_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  action text not null check (action in ('listing','boost','alert')),
  listing_id uuid references listings(id),
  created_at timestamptz default now()
);

-- ═══ 7. REVIEWS ═══
create table reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references users(id),
  reviewed_id uuid not null references users(id),
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- ═══ 8. CONTEST ═══
create table contest (
  id uuid primary key default gen_random_uuid(),
  cycle int default 1,
  total_tickets int default 0,
  total_revenue_cents int default 0,
  target_tickets int default 200000,
  target_revenue_cents int default 160000000,
  status text default 'active',
  created_at timestamptz default now()
);

-- ═══ 9. ACTIVITY LOG ═══
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action text not null,
  details jsonb,
  created_at timestamptz default now()
);

-- ═══ INDEXES ═══
create index idx_users_phone on users(phone);
create index idx_users_referral on users(referral_code);
create index idx_listings_user on listings(user_id);
create index idx_listings_category on listings(category);
create index idx_listings_boosted on listings(is_boosted) where is_boosted = true;
create index idx_swipes_swiper on swipes(swiper_id);
create index idx_swipes_swiped on swipes(swiped_id);
create index idx_matches_users on matches(user_a, user_b);
create index idx_credit_purchases_user on credit_purchases(user_id);
create index idx_credit_usage_user on credit_usage(user_id);
create index idx_reviews_reviewed on reviews(reviewed_id);
create index idx_reviews_reviewer on reviews(reviewer_id);
create index idx_activity_log_user on activity_log(user_id);
create index idx_activity_log_recent on activity_log(created_at desc);

-- ═══ ROW LEVEL SECURITY ═══
alter table users enable row level security;
alter table listings enable row level security;
alter table swipes enable row level security;
alter table matches enable row level security;
alter table credit_purchases enable row level security;
alter table credit_usage enable row level security;
alter table reviews enable row level security;
alter table contest enable row level security;
alter table activity_log enable row level security;

-- service_role bypass policies
create policy "service_all" on users for all using (true) with check (true);
create policy "service_all" on listings for all using (true) with check (true);
create policy "service_all" on swipes for all using (true) with check (true);
create policy "service_all" on matches for all using (true) with check (true);
create policy "service_all" on credit_purchases for all using (true) with check (true);
create policy "service_all" on credit_usage for all using (true) with check (true);
create policy "service_all" on reviews for all using (true) with check (true);
create policy "service_all" on contest for all using (true) with check (true);
create policy "service_all" on activity_log for all using (true) with check (true);
