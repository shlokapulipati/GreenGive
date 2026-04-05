-- ============================================================
-- FIX: Make handle_new_user trigger safe against invalid charity UUIDs
-- Run this in Supabase SQL Editor → New Query
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  charity_uuid UUID;
BEGIN
  BEGIN
    charity_uuid := (NEW.raw_user_meta_data->>'charity_id')::UUID;
  EXCEPTION WHEN others THEN
    charity_uuid := NULL;
  END;

  INSERT INTO profiles (id, email, full_name, charity_id, charity_pct)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    charity_uuid,
    COALESCE((NEW.raw_user_meta_data->>'charity_pct')::NUMERIC, 10.00)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
