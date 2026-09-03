create extension if not exists pgcrypto;

-- =========================================================
-- 1. USER PROFILES
-- =========================================================

create table if not exists public.profiles (
    id uuid primary key
        references auth.users(id)
        on delete cascade,

    full_name text not null,
    phone_number text not null,
    email text,

    age integer not null
        check (age >= 0 and age <= 120),

    citizenship text not null
        check (citizenship in ('singaporean', 'pr')),

    employment_type text
        check (
            employment_type in (
                'regular_income',
                'platform_worker',
                'variable_income',
                'not_applicable'
            )
        ),

    is_platform_worker boolean
        not null default false,

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now()
);


-- =========================================================
-- 2. HOUSEHOLDS
-- =========================================================

create table if not exists public.households (
    id uuid primary key
        default gen_random_uuid(),

    name text not null,

    created_by uuid not null
        references auth.users(id)
        on delete cascade,

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now()
);


-- =========================================================
-- 3. HOUSEHOLD MEMBERS
-- =========================================================

create table if not exists public.household_members (
    id uuid primary key
        default gen_random_uuid(),

    household_id uuid not null
        references public.households(id)
        on delete cascade,

    user_id uuid
        references auth.users(id)
        on delete set null,

    full_name text not null,

    role text not null
        check (
            role in (
                'manager',
                'co_manager',
                'dependent'
            )
        ),

    phone_number text,

    email text,

    age integer
        check (
            age is null
            or (age >= 0 and age <= 120)
        ),

    citizenship text
        check (
            citizenship is null
            or citizenship in (
                'singaporean',
                'pr'
            )
        ),

    employment_type text
        check (
            employment_type is null
            or employment_type in (
                'regular_income',
                'platform_worker',
                'variable_income',
                'not_applicable'
            )
        ),

    is_platform_worker boolean
        not null default false,

    personal_balance numeric(12,2)
        not null default 0,

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now()
);


-- =========================================================
-- 4. BANK / WALLET ACCOUNTS
-- =========================================================

create table if not exists public.bank_accounts (
    id uuid primary key
        default gen_random_uuid(),

    household_id uuid not null
        references public.households(id)
        on delete cascade,

    member_id uuid not null
        references public.household_members(id)
        on delete cascade,

    bank_name text not null,

    account_number text not null,

    account_type text not null
        check (
            account_type in (
                'savings',
                'current',
                'wallet'
            )
        ),

    balance numeric(12,2)
        not null default 0,

    last_synced_at timestamptz,

    created_at timestamptz
        not null default now()
);


-- =========================================================
-- 5. SAVINGS GOALS
-- =========================================================

create table if not exists public.savings_goals (
    id uuid primary key
        default gen_random_uuid(),

    household_id uuid not null
        references public.households(id)
        on delete cascade,

    member_id uuid not null
        references public.household_members(id)
        on delete cascade,

    title text not null,

    target_amount numeric(12,2)
        not null
        check (target_amount > 0),

    current_amount numeric(12,2)
        not null default 0
        check (current_amount >= 0),

    category_name text,

    category_icon text,

    item_url_or_photo text,

    notes text,

    is_completed boolean
        not null default false,

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now()
);


-- =========================================================
-- 6. DEPENDENT INVITATIONS / QR LINKING
-- =========================================================

create table if not exists public.dependent_invitations (
    id uuid primary key
        default gen_random_uuid(),

    household_id uuid not null
        references public.households(id)
        on delete cascade,

    created_by_member_id uuid not null
        references public.household_members(id)
        on delete cascade,

    dependent_name text not null,

    dependent_phone_number text,

    dependent_email text,

    dependent_age integer,

    dependent_citizenship text
        check (
            dependent_citizenship is null
            or dependent_citizenship in (
                'singaporean',
                'pr'
            )
        ),

    token text not null unique,

    status text not null default 'pending'
        check (
            status in (
                'pending',
                'accepted',
                'expired',
                'cancelled'
            )
        ),

    expires_at timestamptz not null,

    accepted_at timestamptz,

    created_at timestamptz
        not null default now()
);


-- =========================================================
-- 7. INDEXES
-- =========================================================

create index if not exists
    idx_household_members_household
on public.household_members(household_id);

create index if not exists
    idx_bank_accounts_household
on public.bank_accounts(household_id);

create index if not exists
    idx_bank_accounts_member
on public.bank_accounts(member_id);

create index if not exists
    idx_savings_goals_household
on public.savings_goals(household_id);

create index if not exists
    idx_savings_goals_member
on public.savings_goals(member_id);

create index if not exists
    idx_invitations_household
on public.dependent_invitations(household_id);

create index if not exists
    idx_invitations_token
on public.dependent_invitations(token);


-- =========================================================
-- 8. ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles
enable row level security;

alter table public.households
enable row level security;

alter table public.household_members
enable row level security;

alter table public.bank_accounts
enable row level security;

alter table public.savings_goals
enable row level security;

alter table public.dependent_invitations
enable row level security;


-- =========================================================
-- 9. PROFILE POLICIES
-- =========================================================

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
    id = (select auth.uid())
);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (
    id = (select auth.uid())
);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
    id = (select auth.uid())
)
with check (
    id = (select auth.uid())
);


-- =========================================================
-- 10. HOUSEHOLD POLICIES
-- =========================================================

create policy "Household members can view household"
on public.households
for select
to authenticated
using (
    exists (
        select 1
        from public.household_members hm
        where hm.household_id = households.id
        and hm.user_id = (select auth.uid())
    )
);

create policy "Authenticated users can create households"
on public.households
for insert
to authenticated
with check (
    created_by = (select auth.uid())
);


-- =========================================================
-- 11. HOUSEHOLD MEMBER POLICIES
-- =========================================================

create policy "Household members can view members"
on public.household_members
for select
to authenticated
using (
    exists (
        select 1
        from public.household_members current_member
        where current_member.household_id =
            household_members.household_id
        and current_member.user_id =
            (select auth.uid())
    )
);

create policy "Managers can create household members"
on public.household_members
for insert
to authenticated
with check (
    exists (
        select 1
        from public.household_members manager
        where manager.household_id =
            household_members.household_id
        and manager.user_id =
            (select auth.uid())
        and manager.role in (
            'manager',
            'co_manager'
        )
    )
    or (
        user_id = (select auth.uid())
        and role = 'manager'
    )
);


-- =========================================================
-- 12. BANK ACCOUNT POLICIES
-- =========================================================

create policy "Household members can view linked accounts"
on public.bank_accounts
for select
to authenticated
using (
    exists (
        select 1
        from public.household_members hm
        where hm.household_id =
            bank_accounts.household_id
        and hm.user_id =
            (select auth.uid())
    )
);

create policy "Managers can create linked accounts"
on public.bank_accounts
for insert
to authenticated
with check (
    exists (
        select 1
        from public.household_members hm
        where hm.household_id =
            bank_accounts.household_id
        and hm.user_id =
            (select auth.uid())
        and hm.role in (
            'manager',
            'co_manager'
        )
    )
);


-- =========================================================
-- 13. SAVINGS GOAL POLICIES
-- =========================================================

create policy "Household members can view savings goals"
on public.savings_goals
for select
to authenticated
using (
    exists (
        select 1
        from public.household_members hm
        where hm.household_id =
            savings_goals.household_id
        and hm.user_id =
            (select auth.uid())
    )
);

create policy "Household members can create goals"
on public.savings_goals
for insert
to authenticated
with check (
    exists (
        select 1
        from public.household_members hm
        where hm.household_id =
            savings_goals.household_id
        and hm.user_id =
            (select auth.uid())
    )
);


-- =========================================================
-- 14. DEPENDENT INVITATION POLICIES
-- =========================================================

create policy "Managers can view invitations"
on public.dependent_invitations
for select
to authenticated
using (
    exists (
        select 1
        from public.household_members hm
        where hm.id =
            dependent_invitations.created_by_member_id
        and hm.user_id =
            (select auth.uid())
        and hm.role in (
            'manager',
            'co_manager'
        )
    )
);

create policy "Managers can create invitations"
on public.dependent_invitations
for insert
to authenticated
with check (
    exists (
        select 1
        from public.household_members hm
        where hm.id =
            dependent_invitations.created_by_member_id
        and hm.user_id =
            (select auth.uid())
        and hm.role in (
            'manager',
            'co_manager'
        )
    )
);

-- =========================================================
-- ENABLE RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.savings_goals enable row level security;
alter table public.dependent_invitations enable row level security;


-- =========================================================
-- PROFILES
-- =========================================================

drop policy if exists "Users can view own profile"
on public.profiles;

drop policy if exists "Users can insert own profile"
on public.profiles;

drop policy if exists "Users can update own profile"
on public.profiles;


create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
    id = (select auth.uid())
);


create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (
    id = (select auth.uid())
);


create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
    id = (select auth.uid())
)
with check (
    id = (select auth.uid())
);


-- =========================================================
-- HOUSEHOLDS
-- =========================================================

drop policy if exists "Users can view their households"
on public.households;

drop policy if exists "Users can create households"
on public.households;


create policy "Users can view their households"
on public.households
for select
to authenticated
using (
    created_by = (select auth.uid())
    or
    exists (
        select 1
        from public.household_members hm
        where hm.household_id = households.id
        and hm.user_id = (select auth.uid())
    )
);


create policy "Users can create households"
on public.households
for insert
to authenticated
with check (
    created_by = (select auth.uid())
);


-- =========================================================
-- HOUSEHOLD MEMBERS
-- =========================================================

drop policy if exists "Members can view household members"
on public.household_members;

drop policy if exists "Managers can add household members"
on public.household_members;


create policy "Members can view household members"
on public.household_members
for select
to authenticated
using (
    exists (
        select 1
        from public.household_members viewer
        where viewer.household_id =
            household_members.household_id
        and viewer.user_id =
            (select auth.uid())
    )
);


create policy "Managers can add household members"
on public.household_members
for insert
to authenticated
with check (
    exists (
        select 1
        from public.household_members manager
        where manager.household_id =
            household_members.household_id
        and manager.user_id =
            (select auth.uid())
        and manager.role in (
            'manager',
            'co_manager'
        )
    )

    OR

    (
        user_id = (select auth.uid())
        and role = 'manager'
    )
);


-- =========================================================
-- BANK ACCOUNTS
-- =========================================================

drop policy if exists "Members can view household accounts"
on public.bank_accounts;

drop policy if exists "Managers can add household accounts"
on public.bank_accounts;


create policy "Members can view household accounts"
on public.bank_accounts
for select
to authenticated
using (
    exists (
        select 1
        from public.household_members hm
        where hm.household_id =
            bank_accounts.household_id
        and hm.user_id =
            (select auth.uid())
    )
);


create policy "Managers can add household accounts"
on public.bank_accounts
for insert
to authenticated
with check (
    exists (
        select 1
        from public.household_members hm
        where hm.household_id =
            bank_accounts.household_id
        and hm.user_id =
            (select auth.uid())
        and hm.role in (
            'manager',
            'co_manager'
        )
    )
);


-- =========================================================
-- SAVINGS GOALS
-- =========================================================

drop policy if exists "Members can view household goals"
on public.savings_goals;

drop policy if exists "Members can create goals"
on public.savings_goals;


create policy "Members can view household goals"
on public.savings_goals
for select
to authenticated
using (
    exists (
        select 1
        from public.household_members hm
        where hm.household_id =
            savings_goals.household_id
        and hm.user_id =
            (select auth.uid())
    )
);


create policy "Members can create goals"
on public.savings_goals
for insert
to authenticated
with check (
    exists (
        select 1
        from public.household_members hm
        where hm.household_id =
            savings_goals.household_id
        and hm.user_id =
            (select auth.uid())
    )
);


-- =========================================================
-- DEPENDENT INVITATIONS
-- =========================================================

drop policy if exists "Managers can view invitations"
on public.dependent_invitations;

drop policy if exists "Managers can create invitations"
on public.dependent_invitations;


create policy "Managers can view invitations"
on public.dependent_invitations
for select
to authenticated
using (
    exists (
        select 1
        from public.household_members hm
        where hm.id =
            dependent_invitations.created_by_member_id
        and hm.user_id =
            (select auth.uid())
        and hm.role in (
            'manager',
            'co_manager'
        )
    )
);


create policy "Managers can create invitations"
on public.dependent_invitations
for insert
to authenticated
with check (
    exists (
        select 1
        from public.household_members hm
        where hm.id =
            dependent_invitations.created_by_member_id
        and hm.user_id =
            (select auth.uid())
        and hm.role in (
            'manager',
            'co_manager'
        )
    )
);