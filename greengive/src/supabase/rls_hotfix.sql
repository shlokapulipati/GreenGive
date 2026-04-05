-- ============================================================
-- FINAL FIX: Catch-all to insert ANY missing profile
-- Run this in Supabase SQL Editor → New Query
-- ============================================================

INSERT INTO public.profiles (id, email, full_name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Also let's make sure the INSERT policy is perfectly relaxed for authenticated users taking ownership:
DROP POLICY IF EXISTS "profile_insert_own" ON profiles;
CREATE POLICY "profile_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify it worked
SELECT id, email, full_name FROM public.profiles;
