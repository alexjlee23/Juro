-- fix-post-comment-counts.sql
-- Zeroes out comment_count on all 203 additional posts (b0000038–b0000240)
-- from seed-community-more.sql and seed-community-more2.sql.
-- These posts have no actual comment rows, so the counts shown on cards were lies.
-- Run AFTER seed-all-comments.sql (which handles the original 37 posts correctly).
-- Safe to re-run (idempotent).

UPDATE public.posts
SET comment_count = 0
WHERE id = ANY(
  SELECT (
    'b' || LPAD(n::text, 7, '0') || '-0000-0000-0000-' || LPAD(n::text, 12, '0')
  )::uuid
  FROM generate_series(38, 240) n
);
