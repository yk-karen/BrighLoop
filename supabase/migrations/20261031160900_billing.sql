create extension if not exists "pgcrypto";

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year')),
  trial_days integer not null default 0 check (trial_days >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tax_rates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  percentage numeric(5,2) not null check (percentage >= 0 and percentage <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric(12,2) not null check (value >= 0),
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete restrict,
  plan_id uuid not null references public.plans(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  status text not null default 'active' check (status in ('trialing', 'active', 'paused', 'past_due', 'canceled')),
  discount_id uuid references public.discounts(id) on delete set null,
  tax_rate_id uuid references public.tax_rates(id) on delete set null,
  starts_at timestamptz not null default now(),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '1 month'),
  canceled_at timestamptz,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (customer_id, plan_id, status)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique default ('INV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_id uuid not null references auth.users(id) on delete restrict,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  status text not null default 'open' check (status in ('draft', 'open', 'paid', 'void', 'uncollectible')),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  currency text not null default 'USD',
  issued_at timestamptz not null default now(),
  due_at timestamptz not null default (now() + interval '14 days'),
  period_start timestamptz not null default now(),
  period_end timestamptz not null default (now() + interval '1 month'),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists invoices_subscription_period_idx
  on public.invoices (subscription_id, period_start)
  where subscription_id is not null;

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_amount numeric(12,2) not null check (unit_amount >= 0),
  total numeric(12,2) not null check (total >= 0)
);

create table if not exists public.quotation_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  plan_id uuid not null references public.plans(id) on delete restrict,
  discount_id uuid references public.discounts(id) on delete set null,
  tax_rate_id uuid references public.tax_rates(id) on delete set null,
  terms text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.billing_is_staff()
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'), false);
$$;

alter table public.plans enable row level security;
alter table public.tax_rates enable row level security;
alter table public.discounts enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.quotation_templates enable row level security;

drop policy if exists "authenticated can read active billing setup" on public.plans;
create policy "authenticated can read active billing setup" on public.plans for select to authenticated using (active or public.billing_is_staff());
drop policy if exists "staff manage billing setup" on public.plans;
create policy "staff manage billing setup" on public.plans for all to authenticated using (public.billing_is_staff()) with check (public.billing_is_staff());
drop policy if exists "authenticated can read active tax rates" on public.tax_rates;
create policy "authenticated can read active tax rates" on public.tax_rates for select to authenticated using (active or public.billing_is_staff());
drop policy if exists "staff manage tax rates" on public.tax_rates;
create policy "staff manage tax rates" on public.tax_rates for all to authenticated using (public.billing_is_staff()) with check (public.billing_is_staff());
drop policy if exists "authenticated can read active discounts" on public.discounts;
create policy "authenticated can read active discounts" on public.discounts for select to authenticated using (active or public.billing_is_staff());
drop policy if exists "staff manage discounts" on public.discounts;
create policy "staff manage discounts" on public.discounts for all to authenticated using (public.billing_is_staff()) with check (public.billing_is_staff());

drop policy if exists "customers and staff read subscriptions" on public.subscriptions;
create policy "customers and staff read subscriptions" on public.subscriptions for select to authenticated using (customer_id = auth.uid() or public.billing_is_staff());
drop policy if exists "staff create subscriptions" on public.subscriptions;
create policy "staff create subscriptions" on public.subscriptions for insert to authenticated with check (public.billing_is_staff() or customer_id = auth.uid());
drop policy if exists "staff update subscriptions" on public.subscriptions;
create policy "staff update subscriptions" on public.subscriptions for update to authenticated using (public.billing_is_staff() or customer_id = auth.uid()) with check (public.billing_is_staff() or customer_id = auth.uid());
drop policy if exists "customers and staff read invoices" on public.invoices;
create policy "customers and staff read invoices" on public.invoices for select to authenticated using (customer_id = auth.uid() or public.billing_is_staff());
drop policy if exists "customers create own invoices" on public.invoices;
create policy "customers create own invoices" on public.invoices for insert to authenticated with check (customer_id = auth.uid() or public.billing_is_staff());
drop policy if exists "staff manage invoices" on public.invoices;
create policy "staff manage invoices" on public.invoices for all to authenticated using (public.billing_is_staff()) with check (public.billing_is_staff());
drop policy if exists "customers read invoice items" on public.invoice_items;
create policy "customers read invoice items" on public.invoice_items for select to authenticated using (exists (select 1 from public.invoices i where i.id = invoice_id and (i.customer_id = auth.uid() or public.billing_is_staff())));
drop policy if exists "staff manage invoice items" on public.invoice_items;
create policy "staff manage invoice items" on public.invoice_items for all to authenticated using (public.billing_is_staff() or exists (select 1 from public.invoices i where i.id = invoice_id and i.customer_id = auth.uid())) with check (public.billing_is_staff() or exists (select 1 from public.invoices i where i.id = invoice_id and i.customer_id = auth.uid()));
drop policy if exists "staff manage quotation templates" on public.quotation_templates;
create policy "staff manage quotation templates" on public.quotation_templates for all to authenticated using (public.billing_is_staff()) with check (public.billing_is_staff());

create or replace function public.create_subscription_with_invoice(
  p_customer_id uuid, p_plan_id uuid, p_quantity integer default 1,
  p_discount_id uuid default null, p_tax_rate_id uuid default null,
  p_starts_at timestamptz default now(), p_notes text default null,
  p_created_by uuid default null
) returns jsonb language plpgsql security invoker set search_path = public
as $$
declare
  v_plan plans%rowtype;
  v_discount discounts%rowtype;
  v_tax tax_rates%rowtype;
  v_subscription subscriptions%rowtype;
  v_invoice invoices%rowtype;
  v_subtotal numeric(12,2);
  v_discount_amount numeric(12,2) := 0;
  v_tax_amount numeric(12,2) := 0;
  v_total numeric(12,2);
  v_period_end timestamptz;
begin
  if not (public.billing_is_staff() or p_customer_id = auth.uid()) then
    raise exception 'Not authorized to create this subscription';
  end if;
  select * into v_plan from plans where id = p_plan_id and active;
  if not found then raise exception 'Plan is not active'; end if;
  if p_quantity < 1 then raise exception 'Quantity must be positive'; end if;
  if p_discount_id is not null then
    select * into v_discount from discounts where id = p_discount_id and active and (expires_at is null or expires_at > now());
    if not found then raise exception 'Discount is not active'; end if;
  end if;
  if p_tax_rate_id is not null then
    select * into v_tax from tax_rates where id = p_tax_rate_id and active;
    if not found then raise exception 'Tax rate is not active'; end if;
  end if;
  v_subtotal := round(v_plan.amount * p_quantity, 2);
  if v_discount.id is not null then
    if v_discount.type = 'percentage' then v_discount_amount := round(v_subtotal * least(v_discount.value, 100) / 100, 2);
    else v_discount_amount := least(v_subtotal, v_discount.value);
    end if;
  end if;
  if v_tax.id is not null then v_tax_amount := round((v_subtotal - v_discount_amount) * v_tax.percentage / 100, 2); end if;
  v_total := v_subtotal - v_discount_amount + v_tax_amount;
  v_period_end := case when v_plan.billing_interval = 'year' then p_starts_at + interval '1 year' else p_starts_at + interval '1 month' end;
  insert into subscriptions (customer_id, plan_id, quantity, status, discount_id, tax_rate_id, starts_at, current_period_start, current_period_end, notes, created_by)
  values (p_customer_id, p_plan_id, p_quantity, case when v_plan.trial_days > 0 then 'trialing' else 'active' end, p_discount_id, p_tax_rate_id, p_starts_at, p_starts_at, v_period_end, p_notes, p_created_by)
  returning * into v_subscription;
  insert into invoices (customer_id, subscription_id, subtotal, discount_amount, tax_amount, total, currency, period_start, period_end)
  values (p_customer_id, v_subscription.id, v_subtotal, v_discount_amount, v_tax_amount, v_total, v_plan.currency, p_starts_at, v_period_end)
  returning * into v_invoice;
  insert into invoice_items (invoice_id, description, quantity, unit_amount, total)
  values (v_invoice.id, v_plan.name, p_quantity, v_plan.amount, v_subtotal);
  return jsonb_build_object('subscription_id', v_subscription.id, 'invoice_id', v_invoice.id, 'total', v_total);
exception when unique_violation then
  raise exception 'An equivalent subscription or invoice already exists';
end;
$$;

create or replace function public.generate_recurring_invoices(p_as_of timestamptz default now())
returns integer language plpgsql security definer set search_path = public
as $$
declare
  v_subscription subscriptions%rowtype;
  v_plan plans%rowtype;
  v_discount discounts%rowtype;
  v_tax tax_rates%rowtype;
  v_period_end timestamptz;
  v_subtotal numeric(12,2);
  v_discount_amount numeric(12,2);
  v_tax_amount numeric(12,2);
  v_total numeric(12,2);
  v_invoice_id uuid;
  v_created integer := 0;
  v_inserted integer;
begin
  perform pg_advisory_xact_lock(hashtext('brightloop-recurring-billing'));
  for v_subscription in
    select * from subscriptions
    where status in ('trialing', 'active')
      and current_period_end <= p_as_of
    for update
  loop
    select * into v_plan from plans where id = v_subscription.plan_id and active;
    if not found then continue; end if;
    select * into v_discount from discounts where id = v_subscription.discount_id and active and (expires_at is null or expires_at > p_as_of);
    select * into v_tax from tax_rates where id = v_subscription.tax_rate_id and active;
    v_subtotal := round(v_plan.amount * v_subscription.quantity, 2);
    v_discount_amount := case
      when v_discount.id is null then 0
      when v_discount.type = 'percentage' then round(v_subtotal * least(v_discount.value, 100) / 100, 2)
      else least(v_subtotal, v_discount.value)
    end;
    v_tax_amount := case when v_tax.id is null then 0 else round((v_subtotal - v_discount_amount) * v_tax.percentage / 100, 2) end;
    v_total := v_subtotal - v_discount_amount + v_tax_amount;
    v_period_end := case when v_plan.billing_interval = 'year' then v_subscription.current_period_end + interval '1 year' else v_subscription.current_period_end + interval '1 month' end;
    insert into invoices (customer_id, subscription_id, subtotal, discount_amount, tax_amount, total, currency, period_start, period_end)
    values (v_subscription.customer_id, v_subscription.id, v_subtotal, v_discount_amount, v_tax_amount, v_total, v_plan.currency, v_subscription.current_period_end, v_period_end)
    on conflict (subscription_id, period_start) do nothing
    returning id into v_invoice_id;
    get diagnostics v_inserted = row_count;
    if v_inserted = 1 then
      insert into invoice_items (invoice_id, description, quantity, unit_amount, total)
      values (v_invoice_id, v_plan.name, v_subscription.quantity, v_plan.amount, v_subtotal);
      update subscriptions set current_period_start = current_period_end, current_period_end = v_period_end,
        status = case when status = 'trialing' then 'active' else status end
        where id = v_subscription.id;
      v_created := v_created + 1;
    end if;
  end loop;
  return v_created;
end;
$$;
