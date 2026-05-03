-- Add is_report column to product_comments table for report/signalement functionality
ALTER TABLE public.product_comments ADD COLUMN IF NOT EXISTS is_report BOOLEAN DEFAULT FALSE;
