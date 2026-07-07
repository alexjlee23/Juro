-- Reports table for community content moderation (store compliance: UGC reporting).
-- Run once in Supabase Dashboard → SQL Editor.
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reason text not null check (reason in ('spam', 'abuse', 'scam', 'privacy', 'other')),
  reporter_id uuid references profiles(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table reports enable row level security;

-- Anyone (including guests) may file a report; nobody can read them via the API.
drop policy if exists "anyone can insert reports" on reports;
create policy "anyone can insert reports" on reports
  for insert to anon, authenticated with check (true);
