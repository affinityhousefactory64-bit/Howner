-- Howner Database Schema
-- Run this in Supabase SQL Editor

-- Enums
CREATE TYPE user_type AS ENUM ('particulier', 'artisan', 'agent', 'promoteur', 'courtier');
CREATE TYPE listing_type AS ENUM ('vente', 'location', 'neuf');
CREATE TYPE match_status AS ENUM ('pending_a', 'pending_b', 'matched', 'rejected');
CREATE TYPE swipe_direction AS ENUM ('left', 'right');
CREATE TYPE credit_transaction_type AS ENUM ('purchase', 'referral', 'signup_bonus');
CREATE TYPE ai_task_type AS ENUM ('search_buy', 'search_rent', 'search_artisan', 'bank_file', 'quote_analysis', 'property_analysis');
CREATE TYPE pro_plan AS ENUM ('free', 'artisan', 'agent', 'promoteur');

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  type user_type NOT NULL DEFAULT 'particulier',
  name TEXT NOT NULL DEFAULT '',
  credits INT NOT NULL DEFAULT 1,
  tickets INT NOT NULL DEFAULT 1,
  referral_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type listing_type NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  price INT NOT NULL,
  surface INT NOT NULL,
  rooms INT NOT NULL DEFAULT 1,
  description TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'howner',
  external_url TEXT,
  is_native BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Swipes
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES users(id),
  swiped_id UUID NOT NULL REFERENCES users(id),
  direction swipe_direction NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES users(id),
  user_b UUID NOT NULL REFERENCES users(id),
  status match_status NOT NULL DEFAULT 'pending_a',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Credit Transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount INT NOT NULL,
  type credit_transaction_type NOT NULL,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Tasks
CREATE TABLE ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type ai_task_type NOT NULL,
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pro Subscriptions
CREATE TABLE pro_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan pro_plan NOT NULL DEFAULT 'free',
  stripe_subscription_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_listings_source ON listings(source);
CREATE INDEX idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX idx_matches_users ON matches(user_a, user_b);
CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_ai_tasks_user ON ai_tasks(user_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Policies: Listings are publicly readable
CREATE POLICY "Listings are publicly readable" ON listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (auth.uid() = user_id);

-- Policies: Swipes
CREATE POLICY "Users can view own swipes" ON swipes FOR SELECT USING (auth.uid() = swiper_id);
CREATE POLICY "Users can create swipes" ON swipes FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Policies: Matches
CREATE POLICY "Users can view own matches" ON matches FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Policies: Credit Transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- Policies: AI Tasks
CREATE POLICY "Users can view own ai tasks" ON ai_tasks FOR SELECT USING (auth.uid() = user_id);

-- Policies: Pro Subscriptions
CREATE POLICY "Users can view own subscription" ON pro_subscriptions FOR SELECT USING (auth.uid() = user_id);
