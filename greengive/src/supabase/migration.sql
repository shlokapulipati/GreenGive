-- =============================================================
-- GreenGive · Golf Charity Platform · Supabase Schema
-- Run this in Supabase SQL Editor → New Query
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- PROFILES (extends Supabase auth.users)
-- =============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  charity_id UUID,
  charity_pct NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  subscription_status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'lapsed')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  stripe_customer_id TEXT UNIQUE,
  stripe_sub_id TEXT UNIQUE,
  renewal_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, charity_id, charity_pct)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    (NEW.raw_user_meta_data->>'charity_id')::UUID,
    COALESCE((NEW.raw_user_meta_data->>'charity_pct')::NUMERIC, 10.00)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================
-- CHARITIES
-- =============================================================
CREATE TABLE charities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  goal_amount NUMERIC(12,2) DEFAULT 50000,
  raised_amount NUMERIC(12,2) DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active charities"
  ON charities FOR SELECT USING (active = TRUE);

CREATE POLICY "Admins can manage charities"
  ON charities FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================
-- CHARITY EVENTS
-- =============================================================
CREATE TABLE charity_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  charity_id UUID REFERENCES charities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE charity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view charity events" ON charity_events FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage charity events" ON charity_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- FK: profiles.charity_id → charities.id
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_charity
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL;

-- =============================================================
-- SCORES (rolling 5-score system)
-- =============================================================
CREATE TABLE scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores"
  ON scores FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores"
  ON scores FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scores"
  ON scores FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage all scores"
  ON scores FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Enforce rolling 5: auto-delete oldest when 5 exist
CREATE OR REPLACE FUNCTION enforce_rolling_scores()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
  oldest_id UUID;
BEGIN
  SELECT COUNT(*) INTO score_count FROM scores WHERE user_id = NEW.user_id;
  IF score_count >= 5 THEN
    SELECT id INTO oldest_id FROM scores
      WHERE user_id = NEW.user_id
      ORDER BY played_at ASC, created_at ASC
      LIMIT 1;
    DELETE FROM scores WHERE id = oldest_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER rolling_scores_trigger
  BEFORE INSERT ON scores
  FOR EACH ROW EXECUTE FUNCTION enforce_rolling_scores();

-- =============================================================
-- DRAWS
-- =============================================================
CREATE TABLE draws (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  month TEXT NOT NULL UNIQUE,
  numbers INTEGER[] DEFAULT '{}',
  logic_type TEXT NOT NULL DEFAULT 'random'
    CHECK (logic_type IN ('random', 'weighted_frequent', 'weighted_rare')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'simulation', 'published')),
  jackpot_amount NUMERIC(12,2) DEFAULT 0,
  jackpot_rollover BOOLEAN DEFAULT FALSE,
  total_pool NUMERIC(12,2) DEFAULT 0,
  active_subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published draws"
  ON draws FOR SELECT USING (status = 'published');

CREATE POLICY "Subscribers can view draws"
  ON draws FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND subscription_status = 'active')
  );

CREATE POLICY "Admins can manage draws"
  ON draws FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================
-- DRAW ENTRIES
-- =============================================================
CREATE TABLE draw_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_numbers INTEGER[] NOT NULL,
  matched_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON draw_entries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage entries"
  ON draw_entries FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================
-- PRIZES
-- =============================================================
CREATE TABLE prizes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL CHECK (tier IN (3, 4, 5)),
  pool_amount NUMERIC(12,2) NOT NULL,
  winner_count INTEGER DEFAULT 0,
  per_winner_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view prizes" ON prizes FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage prizes" ON prizes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================================
-- WINNERS
-- =============================================================
CREATE TABLE winners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL CHECK (tier IN (3, 4, 5)),
  amount NUMERIC(12,2) NOT NULL,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'rejected', 'paid')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own winnings"
  ON winners FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload proof"
  ON winners FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage winners"
  ON winners FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================
-- SUBSCRIPTIONS LOG
-- =============================================================
CREATE TABLE subscription_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  stripe_sub_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL,
  amount NUMERIC(10,2),
  event_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON subscription_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================================
-- SEED DATA — charities
-- =============================================================
INSERT INTO charities (name, description, goal_amount, raised_amount, featured) VALUES
  ('Children''s Hospital Fund', 'Providing life-saving medical equipment and treatment for children across the UK.', 50000, 12400, TRUE),
  ('Reforestation UK', 'Planting 1 million trees across Britain to restore natural habitats and fight climate change.', 30000, 8200, TRUE),
  ('Youth Sports Access', 'Breaking down barriers so every young person can participate in sport, regardless of background.', 25000, 6900, FALSE),
  ('Mental Health Foundation', 'Funding community mental health programs and crisis support across the country.', 40000, 15600, FALSE),
  ('Food Bank Network', 'Supporting local food banks to ensure no family goes hungry.', 20000, 9800, FALSE),
  ('Veterans Support Trust', 'Helping former service members transition back to civilian life with dignity.', 35000, 11200, FALSE);

-- =============================================================
-- STORAGE BUCKETS (run separately in Supabase dashboard)
-- =============================================================
-- Create bucket: winner-proofs (private)
-- Create bucket: charity-images (public)