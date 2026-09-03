-- KeepIt Supabase schema
-- Safe to run more than once in a fresh or existing KeepIt project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone_number text not null,
  email text,
  age integer not null check (age between 0 and 120),
  citizenship text not null check (citizenship in ('singaporean', 'pr')),
  employment_type text check (employment_type in ('regular_income', 'platform_worker', 'variable_income', 'not_applicable')),
  is_platform_worker boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  cash_balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  role text not null check (role in ('manager', 'co_manager', 'dependent')),
  phone_number text,
  email text,
  age integer check (age is null or age between 0 and 120),
  citizenship text check (citizenship is null or citizenship in ('singaporean', 'pr')),
  employment_type text check (employment_type is null or employment_type in ('regular_income', 'platform_worker', 'variable_income', 'not_applicable')),
  is_platform_worker boolean not null default false,
  vehicle_type text check (vehicle_type is null or vehicle_type in ('car_van_lorry', 'motorcycle_pmd', 'bicycle_walking_public', 'none')),
  personal_balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, user_id)
);

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  member_id uuid not null references public.household_members(id) on delete cascade,
  bank_name text not null,
  account_number text not null,
  account_type text not null check (account_type in ('savings', 'current', 'wallet')),
  balance numeric(12,2) not null default 0,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  member_id uuid not null references public.household_members(id) on delete cascade,
  title text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) not null default 0 check (current_amount >= 0),
  category_name text,
  category_icon text,
  item_url_or_photo text,
  notes text,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  member_id uuid not null references public.household_members(id) on delete cascade,
  account_id uuid references public.bank_accounts(id) on delete set null,
  recipient_id uuid references public.household_members(id) on delete set null,
  description text not null,
  amount numeric(12,2) not null check (amount <> 0),
  category text not null check (category in ('Groceries', 'Hawker & Dining', 'Pocket Money', 'Transport', 'Utilities', 'Gig Payout', 'Voucher Redemption', 'Other')),
  source text not null,
  opportunity_cost_note text,
  voucher_applicable text,
  is_gig_income boolean not null default false,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.government_vouchers (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  category text not null check (category in ('CDC_Supermarket', 'CDC_Hawker', 'Climate', 'SG60', 'Workfare_WIS')),
  total_granted numeric(12,2) not null check (total_granted >= 0),
  balance numeric(12,2) not null check (balance >= 0),
  expiry_date date not null,
  description text,
  accepted_merchants text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gig_profiles (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.household_members(id) on delete cascade,
  platform_name text not null,
  vehicle_type text not null check (vehicle_type in ('car_van_lorry', 'motorcycle_pmd', 'bicycle_walking_public', 'none')),
  feda_percentage numeric(5,2) not null default 0,
  gross_weekly_average numeric(12,2) not null default 0,
  safe_weekly_salary numeric(12,2) not null default 0,
  buffer_saved numeric(12,2) not null default 0,
  monthly_wis_eligible boolean not null default false,
  wis_monthly_amount numeric(12,2) not null default 0,
  wis_cash_split numeric(12,2) not null default 0,
  wis_medisave_split numeric(12,2) not null default 0,
  wis_payout_status jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nudges (
  id text primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  member_id uuid references public.household_members(id) on delete set null,
  type text not null check (type in ('opportunity_cost', 'voucher_expiry', 'gig_buffer', 'location_nearby')),
  title text not null,
  message text not null,
  severity text check (severity is null or severity in ('alert', 'warning', 'info')),
  action_text text,
  related_transaction_id uuid references public.transactions(id) on delete set null,
  dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.dependent_invitations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by_member_id uuid not null references public.household_members(id) on delete cascade,
  dependent_name text not null,
  dependent_phone_number text,
  dependent_email text,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Upgrade columns required by this merged build when an older KeepIt schema exists.
alter table public.households add column if not exists cash_balance numeric(12,2) not null default 0;
alter table public.household_members add column if not exists vehicle_type text;
alter table public.bank_accounts add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_members_household on public.household_members(household_id);
create index if not exists idx_members_user on public.household_members(user_id);
create index if not exists idx_accounts_household on public.bank_accounts(household_id);
create index if not exists idx_transactions_household_date on public.transactions(household_id, occurred_at desc);
create index if not exists idx_vouchers_household_expiry on public.government_vouchers(household_id, expiry_date);
create index if not exists idx_goals_member on public.savings_goals(member_id);
create index if not exists idx_nudges_household on public.nudges(household_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists households_set_updated_at on public.households;
create trigger households_set_updated_at before update on public.households for each row execute function public.set_updated_at();
drop trigger if exists members_set_updated_at on public.household_members;
create trigger members_set_updated_at before update on public.household_members for each row execute function public.set_updated_at();
drop trigger if exists accounts_set_updated_at on public.bank_accounts;
create trigger accounts_set_updated_at before update on public.bank_accounts for each row execute function public.set_updated_at();
drop trigger if exists goals_set_updated_at on public.savings_goals;
create trigger goals_set_updated_at before update on public.savings_goals for each row execute function public.set_updated_at();
drop trigger if exists vouchers_set_updated_at on public.government_vouchers;
create trigger vouchers_set_updated_at before update on public.government_vouchers for each row execute function public.set_updated_at();
drop trigger if exists gig_profiles_set_updated_at on public.gig_profiles;
create trigger gig_profiles_set_updated_at before update on public.gig_profiles for each row execute function public.set_updated_at();

-- Security-definer helpers avoid recursive RLS checks on household_members.
create or replace function public.is_household_member(target_household uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.household_members
    where household_id = target_household and user_id = auth.uid()
  );
$$;

create or replace function public.is_household_manager(target_household uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.household_members
    where household_id = target_household
      and user_id = auth.uid()
      and role in ('manager', 'co_manager')
  );
$$;

create or replace function public.is_own_member(target_member uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.household_members
    where id = target_member and user_id = auth.uid()
  );
$$;

revoke all on function public.is_household_member(uuid) from public;
revoke all on function public.is_household_manager(uuid) from public;
revoke all on function public.is_own_member(uuid) from public;
grant execute on function public.is_household_member(uuid) to authenticated;
grant execute on function public.is_household_manager(uuid) to authenticated;
grant execute on function public.is_own_member(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.savings_goals enable row level security;
alter table public.transactions enable row level security;
alter table public.government_vouchers enable row level security;
alter table public.gig_profiles enable row level security;
alter table public.nudges enable row level security;
alter table public.dependent_invitations enable row level security;

-- Remove policy names used by earlier KeepIt prototypes before installing the
-- non-recursive, role-aware policy set below.
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Household members can view household" on public.households;
drop policy if exists "Authenticated users can create households" on public.households;
drop policy if exists "Users can view their households" on public.households;
drop policy if exists "Users can create households" on public.households;
drop policy if exists "Household members can view members" on public.household_members;
drop policy if exists "Managers can create household members" on public.household_members;
drop policy if exists "Members can view household members" on public.household_members;
drop policy if exists "Managers can add household members" on public.household_members;
drop policy if exists "Household members can view linked accounts" on public.bank_accounts;
drop policy if exists "Managers can create linked accounts" on public.bank_accounts;
drop policy if exists "Members can view household accounts" on public.bank_accounts;
drop policy if exists "Managers can add household accounts" on public.bank_accounts;
drop policy if exists "Household members can view savings goals" on public.savings_goals;
drop policy if exists "Household members can create goals" on public.savings_goals;
drop policy if exists "Members can view household goals" on public.savings_goals;
drop policy if exists "Members can create goals" on public.savings_goals;
drop policy if exists "Managers can view invitations" on public.dependent_invitations;
drop policy if exists "Managers can create invitations" on public.dependent_invitations;

drop policy if exists profiles_own_all on public.profiles;
create policy profiles_own_all on public.profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists households_select on public.households;
create policy households_select on public.households for select to authenticated
  using (created_by = auth.uid() or public.is_household_member(id));
drop policy if exists households_insert on public.households;
create policy households_insert on public.households for insert to authenticated
  with check (created_by = auth.uid());
drop policy if exists households_update on public.households;
create policy households_update on public.households for update to authenticated
  using (public.is_household_manager(id)) with check (public.is_household_manager(id));

drop policy if exists members_select on public.household_members;
create policy members_select on public.household_members for select to authenticated
  using (public.is_household_member(household_id) or user_id = auth.uid());
drop policy if exists members_insert on public.household_members;
create policy members_insert on public.household_members for insert to authenticated
  with check (
    public.is_household_manager(household_id)
    or (user_id = auth.uid() and role = 'manager')
  );
drop policy if exists members_update on public.household_members;
create policy members_update on public.household_members for update to authenticated
  using (public.is_household_manager(household_id) or user_id = auth.uid())
  with check (public.is_household_manager(household_id) or user_id = auth.uid());

drop policy if exists accounts_select_private on public.bank_accounts;
create policy accounts_select_private on public.bank_accounts for select to authenticated
  using (public.is_household_manager(household_id) or public.is_own_member(member_id));
drop policy if exists accounts_manager_insert on public.bank_accounts;
create policy accounts_manager_insert on public.bank_accounts for insert to authenticated
  with check (public.is_household_manager(household_id));
drop policy if exists accounts_manager_update on public.bank_accounts;
create policy accounts_manager_update on public.bank_accounts for update to authenticated
  using (public.is_household_manager(household_id)) with check (public.is_household_manager(household_id));

drop policy if exists goals_private_select on public.savings_goals;
create policy goals_private_select on public.savings_goals for select to authenticated
  using (public.is_household_manager(household_id) or public.is_own_member(member_id));
drop policy if exists goals_write on public.savings_goals;
create policy goals_write on public.savings_goals for insert to authenticated
  with check (public.is_household_manager(household_id) or public.is_own_member(member_id));
drop policy if exists goals_update on public.savings_goals;
create policy goals_update on public.savings_goals for update to authenticated
  using (public.is_household_manager(household_id) or public.is_own_member(member_id))
  with check (public.is_household_manager(household_id) or public.is_own_member(member_id));

drop policy if exists transactions_private_select on public.transactions;
create policy transactions_private_select on public.transactions for select to authenticated
  using (public.is_household_manager(household_id) or public.is_own_member(member_id));
drop policy if exists transactions_insert on public.transactions;
create policy transactions_insert on public.transactions for insert to authenticated
  with check (public.is_household_manager(household_id) or public.is_own_member(member_id));

drop policy if exists vouchers_member_select on public.government_vouchers;
create policy vouchers_member_select on public.government_vouchers for select to authenticated
  using (public.is_household_member(household_id));
drop policy if exists vouchers_manager_insert on public.government_vouchers;
create policy vouchers_manager_insert on public.government_vouchers for insert to authenticated
  with check (public.is_household_manager(household_id));
drop policy if exists vouchers_manager_update on public.government_vouchers;
create policy vouchers_manager_update on public.government_vouchers for update to authenticated
  using (public.is_household_manager(household_id)) with check (public.is_household_manager(household_id));

drop policy if exists gig_profile_private_select on public.gig_profiles;
create policy gig_profile_private_select on public.gig_profiles for select to authenticated
  using (public.is_own_member(member_id) or exists (
    select 1 from public.household_members m
    where m.id = gig_profiles.member_id and public.is_household_manager(m.household_id)
  ));
drop policy if exists gig_profile_write on public.gig_profiles;
create policy gig_profile_write on public.gig_profiles for all to authenticated
  using (public.is_own_member(member_id)) with check (public.is_own_member(member_id));

drop policy if exists nudges_member_select on public.nudges;
create policy nudges_member_select on public.nudges for select to authenticated
  using (public.is_household_member(household_id));
drop policy if exists nudges_member_insert on public.nudges;
create policy nudges_member_insert on public.nudges for insert to authenticated
  with check (public.is_household_member(household_id));
drop policy if exists nudges_member_update on public.nudges;
create policy nudges_member_update on public.nudges for update to authenticated
  using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));

drop policy if exists invitations_manager_all on public.dependent_invitations;
create policy invitations_manager_all on public.dependent_invitations for all to authenticated
  using (public.is_household_manager(household_id)) with check (public.is_household_manager(household_id));

grant select, insert, update, delete on all tables in schema public to authenticated;
