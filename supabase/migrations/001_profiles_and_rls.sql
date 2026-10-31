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

create policy "profiles_self_select"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_self_update"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_self_insert"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_admin_and_staff_read"
on public.profiles
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
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

create policy "subscriptions_admin_staff_write"
on public.subscriptions
for insert with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
);

create policy "subscriptions_customer_update"
on public.subscriptions
for update
using (
  profile_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
)
with check (
  profile_id = auth.uid() or exists (
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

create policy "invoices_admin_staff_write"
on public.invoices
for insert with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
);

create policy "invoices_customer_update"
on public.invoices
for update
using (
  profile_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
)
with check (
  profile_id = auth.uid() or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, company_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'company_name',
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'customer')
  )
on conflict (id) do update set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    company_name = excluded.company_name,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_subscriptions_profile_id on public.subscriptions(profile_id);
create index if not exists idx_invoices_profile_id on public.invoices(profile_id);
