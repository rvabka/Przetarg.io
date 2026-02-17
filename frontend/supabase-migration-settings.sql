-- Migration: Add settings fields to profiles table
-- Run this in Supabase SQL Editor if you already have the profiles table

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pl';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_voivodeships TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS negative_keywords TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_daily_report BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_high_match_alerts BOOLEAN DEFAULT true;
