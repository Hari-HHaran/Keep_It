-- ============================================================
-- KEEPIT GIG INCOME & CPF RESILIENCE
-- ============================================================


-- ============================================================
-- 1. GIG WORKER PROFILE
-- ============================================================

create table if not exists public.gig_profiles (
    id uuid primary key
        default gen_random_uuid(),

    household_id uuid not null
        references public.households(id)
        on delete cascade,

    member_id uuid not null
        references public.household_members(id)
        on delete cascade,

    vehicle_type text not null
        check (
            vehicle_type in (
                'car_van_lorry',
                'motorcycle_pmd',
                'bicycle_walking_public'
            )
        ),

    /*
     * CPF contribution rate used for the worker's
     * take-home calculation.
     *
     * Stored per worker so that the rate can be updated
     * without changing application code.
     */
    cpf_rate numeric(6,5)
        not null default 0.13
        check (
            cpf_rate >= 0
            and cpf_rate <= 1
        ),

    buffer_balance numeric(12,2)
        not null default 0
        check (buffer_balance >= 0),

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now(),

    unique(household_id, member_id)
);


-- ============================================================
-- 2. GIG PAYOUT HISTORY
-- ============================================================

create table if not exists public.gig_payouts (
    id uuid primary key
        default gen_random_uuid(),

    household_id uuid not null
        references public.households(id)
        on delete cascade,

    member_id uuid not null
        references public.household_members(id)
        on delete cascade,

    platform_name text not null,

    gross_payout numeric(12,2)
        not null
        check (gross_payout >= 0),

    payout_date date not null,

    source text not null default 'manual'
        check (
            source in (
                'bank',
                'paynow',
                'paylah',
                'manual'
            )
        ),

    source_reference text,

    created_at timestamptz
        not null default now()
);


-- ============================================================
-- 3. PREVENT DUPLICATE AUTOMATIC PAYOUTS
-- ============================================================

create unique index if not exists
gig_payouts_source_reference_unique
on public.gig_payouts (
    source,
    source_reference
)
where source_reference is not null;


-- ============================================================
-- 4. INDEXES
-- ============================================================

create index if not exists
gig_payouts_member_date_idx
on public.gig_payouts (
    member_id,
    payout_date desc
);

create index if not exists
gig_payouts_household_date_idx
on public.gig_payouts (
    household_id,
    payout_date desc
);


-- ============================================================
-- 5. ENABLE RLS
-- ============================================================

alter table public.gig_profiles
enable row level security;

alter table public.gig_payouts
enable row level security;


-- ============================================================
-- 6. HOUSEHOLD MEMBERS CAN READ GIG PROFILES
-- ============================================================

drop policy if exists
"Household members can view gig profiles"
on public.gig_profiles;

create policy
"Household members can view gig profiles"
on public.gig_profiles
for select
to authenticated
using (
    exists (
        select 1
        from public.household_members hm
        where hm.household_id = gig_profiles.household_id
        and hm.user_id = auth.uid()
    )
);


-- ============================================================
-- 7. HOUSEHOLD MEMBERS CAN READ GIG PAYOUTS
-- ============================================================

drop policy if exists
"Household members can view gig payouts"
on public.gig_payouts;

create policy
"Household members can view gig payouts"
on public.gig_payouts
for select
to authenticated
using (
    exists (
        select 1
        from public.household_members hm
        where hm.household_id = gig_payouts.household_id
        and hm.user_id = auth.uid()
    )
);