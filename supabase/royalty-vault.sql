-- VNC Radio → Royalty Vault: tracks and spin logs.
-- Run once in the Supabase SQL editor (Project → SQL Editor → New query → paste → Run).

create table if not exists public.tracks (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid references public.artists(id) on delete set null,
  artist_name text not null,
  title       text not null,
  isrc        text,
  created_at  timestamptz not null default now()
);
create index if not exists tracks_artist_name_idx on public.tracks (lower(artist_name));
create index if not exists tracks_isrc_idx on public.tracks (isrc);

create table if not exists public.spins (
  id             bigint generated always as identity primary key,
  track_id       uuid not null references public.tracks(id) on delete cascade,
  station        text not null,
  played_at      timestamptz not null default now(),
  ad_revenue     numeric(12,2) not null default 0,  -- artist's share of ad revenue for this spin
  stream_revenue numeric(12,2) not null default 0,  -- artist's share of subscription/stream revenue
  created_at     timestamptz not null default now()
);
create index if not exists spins_track_played_idx on public.spins (track_id, played_at);

-- Only the server (service role key) reads and writes these tables.
alter table public.tracks enable row level security;
alter table public.spins  enable row level security;
