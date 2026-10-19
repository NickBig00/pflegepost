-- Milestone 1: accounts, care cases, members, invites, consents, audit log.
-- Access rules (RLS, functions) live in the next migration.

-- Profiles: one per auth user, created by trigger on sign-up.
-- display_name stays null until the person enters a first name in onboarding.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(trim(display_name)) between 1 and 60),
  created_at timestamptz not null default now()
);

-- A care case is the person being cared for (e.g. "Mama").
create table public.care_cases (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(trim(display_name)) between 1 and 60),
  legal_basis text not null default 'unknown'
    check (legal_basis in ('consent', 'power_of_attorney', 'legal_guardian', 'unknown')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.case_members (
  case_id uuid not null references public.care_cases (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'member', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (case_id, user_id)
);

create index case_members_user_id_idx on public.case_members (user_id);

-- Only the SHA-256 hash of the invite token is stored; the plain token is
-- returned once by create_invite() and travels only inside the invite link.
create table public.case_invites (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.care_cases (id) on delete cascade,
  token_hash text not null unique,
  role text not null check (role in ('member', 'viewer')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  revoked_at timestamptz,
  used_at timestamptz,
  used_by uuid references auth.users (id) on delete set null
);

create index case_invites_case_id_idx on public.case_invites (case_id);

-- Proof of consent (Art. 9 GDPR) including the version of the consent text.
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  consent_type text not null check (consent_type in ('health_data')),
  version text not null check (char_length(version) between 1 and 20),
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index consents_user_id_idx on public.consents (user_id);

-- Who did what, without any content data. Written only by security definer functions.
create table public.audit_log (
  id bigint generated always as identity primary key,
  case_id uuid references public.care_cases (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  created_at timestamptz not null default now()
);

create index audit_log_case_id_idx on public.audit_log (case_id);

-- Create the profile row for every new auth user.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
