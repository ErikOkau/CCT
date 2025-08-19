-- Supabase Database Schema for CCT Guild Battle Analyzer
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'officer', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battle data table
CREATE TABLE IF NOT EXISTS public.battle_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  player_name TEXT NOT NULL,
  player_level INTEGER,
  player_title TEXT,
  guild_rank TEXT DEFAULT 'Member',
  red_velvet_damage BIGINT DEFAULT 0,
  red_velvet_battles INTEGER DEFAULT 0,
  red_velvet_avg_damage_per_ticket INTEGER DEFAULT 0,
  avatar_damage BIGINT DEFAULT 0,
  avatar_battles INTEGER DEFAULT 0,
  avatar_avg_damage_per_ticket INTEGER DEFAULT 0,
  living_abyss_damage BIGINT DEFAULT 0,
  living_abyss_battles INTEGER DEFAULT 0,
  living_abyss_avg_damage_per_ticket INTEGER DEFAULT 0,
  total_damage BIGINT GENERATED ALWAYS AS (
    red_velvet_damage + avatar_damage + living_abyss_damage
  ) STORED,
  total_battles INTEGER GENERATED ALWAYS AS (
    red_velvet_battles + avatar_battles + living_abyss_battles
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_battle_data_season ON public.battle_data(season);
CREATE INDEX IF NOT EXISTS idx_battle_data_player_name ON public.battle_data(player_name);
CREATE INDEX IF NOT EXISTS idx_battle_data_total_damage ON public.battle_data(total_damage DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_data ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for battle_data table
CREATE POLICY "Authenticated users can view battle data" ON public.battle_data
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert battle data" ON public.battle_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update battle data" ON public.battle_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete battle data" ON public.battle_data
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_battle_data_updated_at
  BEFORE UPDATE ON public.battle_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Note: Sample data will be created automatically when users sign up
-- through the trigger function handle_new_user()
