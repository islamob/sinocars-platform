# Database Setup Guide

This document provides instructions for setting up the PostgreSQL database for the Algeria Car Pool platform using Supabase.

## Quick Setup

The database schema needs to be created before the application can function. Follow these steps:

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the "SQL Editor" section in the left sidebar
3. Create a new query

### 2. Run the Migration SQL

Copy and paste the following SQL code into the SQL editor and execute it:

```sql
-- =====================================================
-- Algeria Car Pool - Database Schema
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_person text NOT NULL,
  phone text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_type text NOT NULL CHECK (listing_type IN ('offer', 'request')),
  title text NOT NULL,
  description text NOT NULL,
  departure_city_china text NOT NULL,
  arrival_city_algeria text NOT NULL,
  port_loading text NOT NULL,
  port_arrival text NOT NULL,
  spots_count integer NOT NULL CHECK (spots_count > 0),
  car_types text NOT NULL,
  estimated_shipping_date date NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view approved listings" ON listings;
DROP POLICY IF EXISTS "Authenticated users can view own listings" ON listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can update own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
DROP POLICY IF EXISTS "Admins can update any listing" ON listings;

-- Profiles RLS Policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Listings RLS Policies
CREATE POLICY "Anyone can view approved listings"
  ON listings FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can view own listings"
  ON listings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update any listing"
  ON listings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_departure_city ON listings(departure_city_china);
CREATE INDEX IF NOT EXISTS idx_listings_arrival_city ON listings(arrival_city_algeria);
CREATE INDEX IF NOT EXISTS idx_listings_shipping_date ON listings(estimated_shipping_date);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. Verify Setup

After running the SQL, verify that:
- Two tables are created: `profiles` and `listings`
- Row Level Security (RLS) is enabled on both tables
- All policies are created successfully

You can check this in the "Table Editor" section of Supabase.

## Creating an Admin User

To create an admin user who can moderate listings:

1. First, register a normal user account through the application
2. Note the user's email address
3. Go to Supabase SQL Editor and run:

```sql
-- Replace 'admin@example.com' with the actual admin's email
UPDATE profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);
```

## Database Schema Overview

### Tables

#### `profiles`
- Stores user profile information
- Links to Supabase auth.users table
- Fields: company_name, contact_person, phone, is_admin

#### `listings`
- Stores container space advertisements
- Fields: listing_type (offer/request), title, description, cities, ports, spots_count, car_types, dates, contact info
- Status workflow: pending → approved/rejected

### Security

All tables use Row Level Security (RLS):
- **Profiles**: Users can only modify their own profiles
- **Listings**:
  - Anyone can view approved listings
  - Users can create, update, and delete their own listings
  - Admins can update any listing (for moderation)

## Troubleshooting

### Issue: "permission denied for table profiles"
- Solution: Make sure RLS policies are created correctly
- Verify you're logged in when trying to access protected data

### Issue: "foreign key violation"
- Solution: The profile must be created immediately after user signup
- This is handled automatically by the application

### Issue: Admin can't approve listings
- Solution: Make sure the user's `is_admin` field is set to `true` in the profiles table

## Email Configuration (Optional)

By default, Supabase requires email confirmation for new signups. For development/testing, you can disable this:

1. Go to Authentication → Settings in Supabase
2. Scroll to "Email Confirmations"
3. Toggle "Enable email confirmations" to OFF

For production, keep email confirmations enabled for security.

## Support

If you encounter any issues during setup, please check:
1. Your Supabase project is active
2. The environment variables in `.env` are correct
3. You have an active internet connection
4. Your Supabase project has database access enabled
