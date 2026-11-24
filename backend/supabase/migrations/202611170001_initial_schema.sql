
-- ==========================================
-- PAWLOKA DATABASE MIGRATION
-- ==========================================

-- 1. Extension
create extension if not exists pgcrypto;


-- ==========================================
-- 2. TABLE: SHELTERS
-- ==========================================

create table if not exists public.shelters (
  id uuid primary key default gen_random_uuid(),
  name text not null
    check (char_length(btrim(name)) between 1 and 100),
  location text not null
    check (char_length(btrim(location)) between 1 and 200),
  phone text not null default '',
  email text not null default '',
  description text not null
    check (char_length(btrim(description)) between 1 and 2000),
  image_url text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shelters_image_url_https
    check (image_url = '' or image_url ~ '^https://')
);


-- ==========================================
-- 3. TABLE: PETS
-- ==========================================

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid not null
    references public.shelters(id) on delete restrict,
  name text not null
    check (char_length(btrim(name)) between 1 and 80),
  species text not null,
  breed text not null default ''
    check (char_length(breed) <= 100),
  age_months integer not null
    check (age_months between 0 and 600),
  sex text not null
    check (sex in ('male', 'female')),
  description text not null
    check (char_length(btrim(description)) between 1 and 2000),
  status text not null default 'available'
    check (status in ('available', 'reserved', 'adopted')),
  image_url text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pets_image_url_https
    check (image_url = '' or image_url ~ '^https://')
);


-- ==========================================
-- 4. UPDATE SPECIES CONSTRAINT
-- ==========================================

-- Menghapus batasan jenis hewan versi lama
alter table public.pets
drop constraint if exists pets_species_check;

-- Menambahkan 9 jenis hewan yang didukung PawLoka
alter table public.pets
add constraint pets_species_check
check (
  species in (
    'cat',
    'dog',
    'bird',
    'hamster',
    'sugar-glider',
    'rabbit',
    'turtle',
    'fish',
    'hedgehog'
  )
);


-- ==========================================
-- 5. TABLE: APPLICATIONS
-- ==========================================

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null
    references public.pets(id) on delete restrict,
  shelter_id uuid not null
    references public.shelters(id) on delete restrict,
  applicant_name text not null
    check (char_length(btrim(applicant_name)) between 2 and 80),
  email text,
  phone text,
  message text not null default ''
    check (char_length(message) <= 1000),
  consent_at timestamptz not null,
  status text not null default 'pending'
    check (
      status in (
        'pending',
        'reviewing',
        'approved',
        'declined',
        'closed'
      )
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_contact_required check (
    coalesce(nullif(btrim(email), ''), null) is not null
    or coalesce(nullif(btrim(phone), ''), null) is not null
  )
);


-- ==========================================
-- 6. INDEXES
-- ==========================================

create index if not exists pets_public_filters_idx
  on public.pets (species, status, age_months)
  where is_published = true;

create index if not exists pets_shelter_id_idx
  on public.pets (shelter_id);

create index if not exists applications_created_at_idx
  on public.applications (created_at desc);

create index if not exists applications_status_idx
  on public.applications (status);


-- ==========================================
-- 7. ROW LEVEL SECURITY
-- ==========================================

alter table public.shelters
enable row level security;

alter table public.pets
enable row level security;

alter table public.applications
enable row level security;


-- ==========================================
-- 8. DATABASE PERMISSIONS
-- ==========================================

revoke all on table public.shelters
from anon, authenticated;

revoke all on table public.pets
from anon, authenticated;

revoke all on table public.applications
from anon, authenticated;

grant usage on schema public to service_role;

grant all on table public.shelters
to service_role;

grant all on table public.pets
to service_role;

grant all on table public.applications
to service_role;


-- ==========================================
-- END OF PAWLOKA MIGRATION
-- ==========================================
