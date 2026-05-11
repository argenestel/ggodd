-- Run this in Supabase SQL Editor

create table if not exists public.users (
  steam_id text primary key,
  display_name text not null,
  avatar_url text,
  created_at bigint not null default extract(epoch from now())::bigint
);

create table if not exists public.markets (
  id bigserial primary key,
  market_address text unique not null,
  creator_steam_id text not null,
  streamer_steam_id text not null,
  streamer_name text,
  game_name text,
  game_app_id integer,
  achievement_id text not null,
  achievement_name text not null,
  achievement_description text,
  deadline bigint not null,
  resolved integer not null default 0,
  outcome integer,
  total_yes_sol double precision not null default 0,
  total_no_sol double precision not null default 0,
  created_at bigint not null default extract(epoch from now())::bigint
);

alter table public.markets add column if not exists streamer_name text;
alter table public.markets add column if not exists game_name text;
alter table public.markets add column if not exists game_app_id integer;
alter table public.markets add column if not exists achievement_description text;

create index if not exists idx_markets_streamer on public.markets(streamer_steam_id);
create index if not exists idx_markets_resolved on public.markets(resolved);

create table if not exists public.streamer_profiles (
  steam_id text primary key,
  display_name text not null,
  wallet_address text,
  updated_at bigint not null default extract(epoch from now())::bigint
);

create table if not exists public.pending_rewards (
  id bigserial primary key,
  market_address text not null,
  steam_id text not null,
  amount_sol double precision not null,
  status text not null check (status in ('pending', 'claimed')),
  claimed_wallet text,
  claimed_at bigint,
  created_at bigint not null default extract(epoch from now())::bigint
);

create index if not exists idx_rewards_steam_status on public.pending_rewards(steam_id, status);

create table if not exists public.steam_wallet_bindings (
  steam_id text primary key,
  wallet_address text not null,
  verified_at bigint not null default extract(epoch from now())::bigint
);

-- Optional: if RLS is enabled and you are still using publishable key,
-- create permissive policies for development only.
-- DO NOT use these policies in production.

alter table public.users enable row level security;
alter table public.markets enable row level security;
alter table public.streamer_profiles enable row level security;
alter table public.pending_rewards enable row level security;
alter table public.steam_wallet_bindings enable row level security;

do $$ begin
  create policy users_dev_all on public.users for all using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy markets_dev_all on public.markets for all using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy streamer_profiles_dev_all on public.streamer_profiles for all using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy pending_rewards_dev_all on public.pending_rewards for all using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy steam_wallet_bindings_dev_all on public.steam_wallet_bindings for all using (true) with check (true);
exception when duplicate_object then null; end $$;
