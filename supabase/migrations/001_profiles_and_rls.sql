-- Brightloop access & profile authorization
-- Run this migration as the database owner / Supabase admin.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'staff', 'customer');

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

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plan_name text not null default 'Brightloop Pro',
  status text not null default 'active',
  billing_cycle text not null default 'monthly',
  amount numeric(12,2) not null default 149.00,
  renewal_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  invoice_number text not null,
  status text not null default 'paid',
  issue_date date,
  amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;

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

  if p_new_role not in ('admin', 'staff', 'customer') then
    raise exception 'Unsupported role assignment.';
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

create policy "subscriptions_customer_select"
on public.subscriptions
for select
using (
  profile_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
);

create policy "subscriptions_admin_staff_insert"
on public.subscriptions
for insert with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
);

-- Customers are read-only for billing data. Trusted admin/staff operations must handle
-- subscription and invoice modifications as part of the eventual billing authorization design.

create policy "subscriptions_admin_staff_update"
on public.subscriptions
for update
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
);

create policy "invoices_customer_select"
on public.invoices
for select
using (
  profile_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
);

create policy "invoices_admin_staff_insert"
on public.invoices
for insert with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
);

create policy "invoices_admin_staff_update"
on public.invoices
for update
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
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
    'customer'
  );

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

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_subscriptions_profile_id on public.subscriptions(profile_id);
create index if not exists idx_invoices_profile_id on public.invoices(profile_id);
