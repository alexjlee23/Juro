-- Fix: grant access to comments and post_likes tables.
-- These were created via SQL editor so they received no automatic GRANTs,
-- silently blocking all reads and writes for anon/authenticated roles.
-- Run once in the Supabase SQL Editor.

-- Comments: anyone can read; authenticated users can write their own
GRANT SELECT          ON public.comments   TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.comments   TO authenticated;

-- Post likes: same pattern
GRANT SELECT          ON public.post_likes TO anon, authenticated;
GRANT INSERT, DELETE  ON public.post_likes TO authenticated;

-- Verify comments are now visible (uncomment to test after running above)
-- SET LOCAL ROLE anon;
-- SELECT count(*) FROM comments;   -- should return 99
-- RESET ROLE;
