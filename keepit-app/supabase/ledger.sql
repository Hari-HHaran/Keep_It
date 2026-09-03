-- ============================================================
-- KEEPIT AUTOMATIC HOUSEHOLD LEDGER
-- ============================================================

-- ------------------------------------------------------------
-- 1. Extend existing bank_accounts table
-- ------------------------------------------------------------

alter table public.bank_accounts
add column if not exists provider text;

alter table public.bank_accounts
add column if not exists provider_account_id text;

alter table public.bank_accounts
add column if not exists sync_status text default 'never_synced';

alter table public.bank_accounts
add column if not exists sync_error text;

alter table public.bank_accounts
add column if not exists is_active boolean default true;

alter table public.bank_accounts
add column if not exists currency text default 'SGD';

alter table public.bank_accounts
add column if not exists updated_at timestamptz default now();


-- Allow more account types for the household ledger.

alter table public.bank_accounts
drop constraint if exists bank_accounts_account_type_check;

alter table public.bank_accounts
add constraint bank_accounts_account_type_check
check (
  account_type in (
    'savings',
    'current',
    'wallet',
    'card',
    'paynow',
    'paylah'
  )
);


-- ------------------------------------------------------------
-- 2. Ledger transactions
-- ------------------------------------------------------------

create table if not exists public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),

  household_id uuid not null
    references public.households(id)
    on delete cascade,

  member_id uuid not null
    references public.household_members(id)
    on delete cascade,

  account_id uuid
    references public.bank_accounts(id)
    on delete set null,

  recipient_member_id uuid
    references public.household_members(id)
    on delete set null,

  transaction_date timestamptz not null default now(),

  description text not null,

  merchant_name text,

  merchant_address text,

  google_place_id text,

  google_primary_type text,

  google_types text[],

  amount numeric(12,2) not null
    check (amount >= 0),

  direction text not null
    check (direction in ('income', 'expense')),

  category text not null default 'uncategorised',

  purpose text,

  counterparty_name text,

  source text not null
    check (
      source in (
        'bank',
        'card',
        'paynow',
        'paylah',
        'ocr',
        'manual'
      )
    ),

  source_reference text,

  sync_status text not null default 'complete'
    check (
      sync_status in (
        'pending',
        'complete',
        'failed',
        'fallback'
      )
    ),

  fallback_source text,

  categorisation_confidence numeric(4,3),

  categorisation_method text,

  receipt_storage_path text,

  raw_data jsonb,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 3. Prevent duplicate automatically synced transactions
-- ------------------------------------------------------------

create unique index if not exists
ledger_transactions_source_reference_unique
on public.ledger_transactions (
  source,
  source_reference
)
where source_reference is not null;


-- ------------------------------------------------------------
-- 4. Ledger synchronisation runs
-- ------------------------------------------------------------

create table if not exists public.ledger_sync_runs (
  id uuid primary key default gen_random_uuid(),

  household_id uuid not null
    references public.households(id)
    on delete cascade,

  account_id uuid
    references public.bank_accounts(id)
    on delete cascade,

  provider text,

  started_at timestamptz not null default now(),

  completed_at timestamptz,

  status text not null default 'running'
    check (
      status in (
        'running',
        'success',
        'failed',
        'partial'
      )
    ),

  transactions_received integer default 0,

  transactions_created integer default 0,

  error_message text,

  fallback_required boolean default false,

  created_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 5. Enable Row Level Security
-- ------------------------------------------------------------

alter table public.ledger_transactions
enable row level security;

alter table public.ledger_sync_runs
enable row level security;


-- ------------------------------------------------------------
-- 6. Household members can view their household transactions
-- ------------------------------------------------------------

drop policy if exists
"Household members can view ledger transactions"
on public.ledger_transactions;

create policy
"Household members can view ledger transactions"
on public.ledger_transactions
for select
to authenticated
using (
  exists (
    select 1
    from public.household_members hm
    where hm.household_id = ledger_transactions.household_id
      and hm.user_id = auth.uid()
  )
);


-- ------------------------------------------------------------
-- 7. Household members can view sync information
-- ------------------------------------------------------------

drop policy if exists
"Household members can view ledger sync runs"
on public.ledger_sync_runs;

create policy
"Household members can view ledger sync runs"
on public.ledger_sync_runs
for select
to authenticated
using (
  exists (
    select 1
    from public.household_members hm
    where hm.household_id = ledger_sync_runs.household_id
      and hm.user_id = auth.uid()
  )
);


-- ------------------------------------------------------------
-- 8. Useful indexes
-- ------------------------------------------------------------

create index if not exists
ledger_transactions_household_id_idx
on public.ledger_transactions(household_id);

create index if not exists
ledger_transactions_member_id_idx
on public.ledger_transactions(member_id);

create index if not exists
ledger_transactions_account_id_idx
on public.ledger_transactions(account_id);

create index if not exists
ledger_transactions_date_idx
on public.ledger_transactions(transaction_date desc);

create index if not exists
ledger_transactions_category_idx
on public.ledger_transactions(category);

create index if not exists
ledger_sync_runs_household_id_idx
on public.ledger_sync_runs(household_id);

create index if not exists
ledger_sync_runs_account_id_idx
on public.ledger_sync_runs(account_id);


-- ------------------------------------------------------------
-- 9. Automatic updated_at
-- ------------------------------------------------------------

create or replace function public.update_ledger_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


drop trigger if exists
ledger_transactions_updated_at
on public.ledger_transactions;

create trigger
ledger_transactions_updated_at
before update on public.ledger_transactions
for each row
execute function public.update_ledger_updated_at();


drop trigger if exists
bank_accounts_updated_at
on public.bank_accounts;

create trigger
bank_accounts_updated_at
before update on public.bank_accounts
for each row
execute function public.update_ledger_updated_at();