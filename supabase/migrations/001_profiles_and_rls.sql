-- Brightloop access & profile authorization
-- Run this migration as the database owner / Supabase admin.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'app_role'
  ) then
    create type public.app_role as enum ('admin', 'staff', 'customer');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text,
  last_name text,
  company_name text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Ordinary users only get access to their own non-role profile fields. Role changes are handled
-- by a dedicated service-role-only backend function, not by table grants or custom bypasses.
revoke all on table public.profiles from public;
revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;

grant select on table public.profiles to authenticated;
grant update (
  first_name,
  last_name,
  company_name,
  updated_at
) on table public.profiles to authenticated;
revoke update (role) on table public.profiles from authenticated;
revoke update (role) on table public.profiles from anon;
revoke insert on table public.profiles from authenticated;
revoke insert on table public.profiles from anon;

create or replace function public.current_user_has_role(required_role public.app_role)
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = required_role
  );
$$;

revoke all on function public.current_user_has_role(public.app_role) from public;
grant execute on function public.current_user_has_role(public.app_role) to authenticated;
grant execute on function public.current_user_has_role(public.app_role) to service_role;

-- No custom GUC authorization bypass. The privileged backend role-assignment path is explicit and
-- restricted to service_role execution only.
create or replace function public.assign_profile_role(p_user_id uuid, p_new_role public.app_role)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_user_id is null then
    raise exception 'p_user_id is required.';
  end if;

  update public.profiles
  set role = p_new_role,
      updated_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'Target profile was not found.';
  end if;
end;
$$;

alter function public.assign_profile_role(uuid, public.app_role) owner to postgres;
revoke all on function public.assign_profile_role(uuid, public.app_role) from public;
revoke all on function public.assign_profile_role(uuid, public.app_role) from anon;
revoke all on function public.assign_profile_role(uuid, public.app_role) from authenticated;
grant execute on function public.assign_profile_role(uuid, public.app_role) to service_role;

create policy "profiles_self_select"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_self_update"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_admin_and_staff_read"
on public.profiles
for select
using (
  auth.uid() = id
  or public.current_user_has_role('admin')
  or public.current_user_has_role('staff')
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    company_name,
    role
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'company_name',
    'customer'::public.app_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;
grant execute on function public.handle_new_user() to service_role;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, email, first_name, last_name, company_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'first_name', ''),
  coalesce(u.raw_user_meta_data->>'last_name', ''),
  coalesce(u.raw_user_meta_data->>'company_name', ''),
  'customer'::public.app_role
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

create index if not exists idx_profiles_email on public.profiles(email);
