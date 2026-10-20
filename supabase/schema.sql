-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run.

-- ---------------------------------------------------------------
-- Resumes: one saved resume (the whole editor state) per user.
-- ---------------------------------------------------------------
create table if not exists public.resumes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.resumes enable row level security;

drop policy if exists "Users read own resume" on public.resumes;
create policy "Users read own resume" on public.resumes
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own resume" on public.resumes;
create policy "Users insert own resume" on public.resumes
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own resume" on public.resumes;
create policy "Users update own resume" on public.resumes
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own resume" on public.resumes;
create policy "Users delete own resume" on public.resumes
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.resumes to authenticated;

-- ---------------------------------------------------------------
-- AI usage: daily counters per user. Users can read their own
-- counts but can only change them through use_ai_credit().
-- ---------------------------------------------------------------
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('tailor', 'import')),
  count int not null default 0,
  primary key (user_id, day, kind)
);

alter table public.ai_usage enable row level security;

drop policy if exists "Users read own usage" on public.ai_usage;
create policy "Users read own usage" on public.ai_usage
  for select to authenticated using ((select auth.uid()) = user_id);

grant select on public.ai_usage to authenticated;

-- Free-tier daily limits. Keep in sync with FREE_LIMITS in src/lib/plans.ts.
create or replace function public.ai_limit(p_kind text)
returns int language sql immutable set search_path = '' as $$
  select case p_kind when 'tailor' then 3 when 'import' then 2 else 0 end;
$$;

create or replace function public.ai_credits_left(p_kind text)
returns int language sql stable security definer set search_path = '' as $$
  select greatest(0, public.ai_limit(p_kind) - coalesce((
    select u.count from public.ai_usage u
    where u.user_id = auth.uid() and u.day = (now() at time zone 'utc')::date and u.kind = p_kind
  ), 0));
$$;

create or replace function public.use_ai_credit(p_kind text)
returns int language plpgsql security definer set search_path = '' as $$
declare
  v_count int;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  insert into public.ai_usage (user_id, day, kind, count)
  values (auth.uid(), (now() at time zone 'utc')::date, p_kind, 1)
  on conflict (user_id, day, kind) do update set count = public.ai_usage.count + 1
  returning count into v_count;
  return greatest(0, public.ai_limit(p_kind) - v_count);
end;
$$;

revoke execute on function public.ai_credits_left(text) from public, anon;
revoke execute on function public.use_ai_credit(text) from public, anon;
grant execute on function public.ai_credits_left(text) to authenticated;
grant execute on function public.use_ai_credit(text) to authenticated;
