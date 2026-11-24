alter table public.applications
  add column if not exists domicile text,
  add column if not exists adoption_reason text,
  add column if not exists pet_experience text,
  add column if not exists access_token_hash text;

alter table public.applications
  drop constraint if exists applications_domicile_length,
  drop constraint if exists applications_adoption_reason_length,
  drop constraint if exists applications_pet_experience_length,
  drop constraint if exists applications_access_token_hash_format;

alter table public.applications
  add constraint applications_domicile_length
    check (domicile is null or char_length(btrim(domicile)) between 2 and 150),
  add constraint applications_adoption_reason_length
    check (adoption_reason is null or char_length(btrim(adoption_reason)) between 10 and 1000),
  add constraint applications_pet_experience_length
    check (pet_experience is null or char_length(btrim(pet_experience)) between 2 and 1000),
  add constraint applications_access_token_hash_format
    check (access_token_hash is null or access_token_hash ~ '^[0-9a-f]{64}$');

create unique index if not exists applications_access_token_hash_unique_idx
  on public.applications (access_token_hash)
  where access_token_hash is not null;
