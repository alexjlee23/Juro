-- Add reply threading to comments
-- Run this once in the Supabase SQL Editor before deploying the updated app.

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- Index speeds up the per-comment reply lookups
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id)
  WHERE parent_comment_id IS NOT NULL;
