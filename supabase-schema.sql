-- ═══════════════════════════════════════════════
-- HOWNER — Supabase Schema
-- Run in: Supabase Dashboard > SQL Editor
-- DROP + RECREATE — only for fresh installs
-- ═══════════════════════════════════════════════

-- Drop old tables if they exist (dev only)
drop table if exists post_comments cascade;
drop table if exists post_likes cascade;
drop table if exists posts cascade;
drop table if exists activity_log cascade;
drop table if exists reservations cascade;
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
  is_admin boolean default false,
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
  reservation_window_hours int default 24,
  max_reservations int default 5,
  external_link text,
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
  action text not null check (action in ('listing','boost','alert','reservation','estimation','optimize_listing')),
  listing_id uuid references listings(id),
  created_at timestamptz default now()
);

-- ═══ 7. REVIEWS ═══
create table reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references users(id),
  reviewed_id uuid not null references users(id),
  listing_id uuid references listings(id),
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- ═══ 8. RESERVATIONS ═══
create table reservations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  user_id uuid not null references users(id),
  status text default 'active' check (status in ('active','contacted','expired','cancelled')),
  created_at timestamptz default now(),
  unique(listing_id, user_id)
);

-- ═══ 9. CONTEST ═══
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

-- ═══ 10. ACTIVITY LOG ═══
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action text not null,
  details jsonb,
  created_at timestamptz default now()
);

-- ═══ 11. WAITLIST INVEST ═══
create table waitlist_invest (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);

-- ═══ 12. POSTS (Social Feed) ═══
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  type text not null check (type in ('story', 'update', 'milestone', 'tip')),
  content text not null,
  media_url text,
  media_type text check (media_type in ('photo', 'video')),
  likes_count int default 0,
  comments_count int default 0,
  is_sponsored boolean default false,
  created_at timestamptz default now()
);

-- ═══ 13. POST LIKES ═══
create table post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id),
  user_id uuid not null references users(id),
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- ═══ 14. POST COMMENTS ═══
create table post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id),
  user_id uuid not null references users(id),
  content text not null,
  created_at timestamptz default now()
);

-- ═══ 15. CONVERSATIONS ═══
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references users(id),
  user_b uuid not null references users(id),
  listing_id uuid references listings(id),
  source text not null check (source in ('match', 'reservation')),
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_a, user_b, listing_id)
);

-- ═══ 16. MESSAGES ═══
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id),
  sender_id uuid not null references users(id),
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ═══ 17. ALERTS ═══
create table alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  category text,
  subcategory text,
  location text,
  price_min int,
  price_max int,
  surface_min int,
  property_type text,
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  card_number int not null unique,
  cycle int not null default 1,
  purchase_id uuid references credit_purchases(id),
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
create index idx_reservations_listing on reservations(listing_id);
create index idx_reservations_user on reservations(user_id);
create index idx_activity_log_user on activity_log(user_id);
create index idx_activity_log_recent on activity_log(created_at desc);
create index idx_waitlist_invest_email on waitlist_invest(email);
create index idx_posts_user on posts(user_id);
create index idx_posts_type on posts(type);
create index idx_posts_recent on posts(created_at desc);
create index idx_post_likes_post on post_likes(post_id);
create index idx_post_likes_user on post_likes(user_id);
create index idx_post_comments_post on post_comments(post_id);
create index idx_conversations_user_a on conversations(user_a);
create index idx_conversations_user_b on conversations(user_b);
create index idx_conversations_last_msg on conversations(last_message_at desc);
create index idx_messages_conversation on messages(conversation_id);
create index idx_messages_sender on messages(sender_id);
create index idx_messages_unread on messages(conversation_id, is_read) where is_read = false;
create index idx_alerts_user on alerts(user_id);
create index idx_alerts_active on alerts(is_active) where is_active = true;

-- ═══ ROW LEVEL SECURITY ═══
alter table users enable row level security;
alter table listings enable row level security;
alter table swipes enable row level security;
alter table matches enable row level security;
alter table credit_purchases enable row level security;
alter table credit_usage enable row level security;
alter table reviews enable row level security;
alter table reservations enable row level security;
alter table contest enable row level security;
alter table activity_log enable row level security;
alter table waitlist_invest enable row level security;
alter table posts enable row level security;
alter table post_likes enable row level security;
alter table post_comments enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table alerts enable row level security;

-- service_role bypass policies
create policy "service_all" on users for all using (true) with check (true);
create policy "service_all" on listings for all using (true) with check (true);
create policy "service_all" on swipes for all using (true) with check (true);
create policy "service_all" on matches for all using (true) with check (true);
create policy "service_all" on credit_purchases for all using (true) with check (true);
create policy "service_all" on credit_usage for all using (true) with check (true);
create policy "service_all" on reviews for all using (true) with check (true);
create policy "service_all" on reservations for all using (true) with check (true);
create policy "service_all" on contest for all using (true) with check (true);
create policy "service_all" on activity_log for all using (true) with check (true);
create policy "service_all" on waitlist_invest for all using (true) with check (true);
create policy "service_all" on posts for all using (true) with check (true);
create policy "service_all" on post_likes for all using (true) with check (true);
create policy "service_all" on post_comments for all using (true) with check (true);
create policy "service_all" on conversations for all using (true) with check (true);
create policy "service_all" on messages for all using (true) with check (true);
create policy "service_all" on alerts for all using (true) with check (true);
