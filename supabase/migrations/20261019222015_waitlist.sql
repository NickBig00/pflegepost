-- Waitlist for the landing page (double opt-in).
-- Only the server (secret key) may access it; RLS is on with no policies.

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 254),
  token_hash text not null,
  token_expires_at timestamptz not null default now() + interval '7 days',
  consented_at timestamptz not null default now(),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- New signup or repeated signup: refresh the token unless already confirmed.
create function public.waitlist_upsert_pending(p_email text, p_token_hash text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.waitlist (email, token_hash)
  values (lower(trim(p_email)), p_token_hash)
  on conflict (email) do update
    set token_hash = excluded.token_hash,
        token_expires_at = now() + interval '7 days',
        consented_at = now()
    where public.waitlist.confirmed_at is null;
$$;

-- Confirms by token hash; true if a pending, unexpired signup matched.
create function public.waitlist_confirm(p_token_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched int;
begin
  update public.waitlist
    set confirmed_at = now()
    where token_hash = p_token_hash
      and confirmed_at is null
      and token_expires_at > now();
  get diagnostics matched = row_count;
  return matched > 0;
end;
$$;

-- Only the service role (server) may call these.
revoke all on function public.waitlist_upsert_pending(text, text) from public, anon, authenticated;
revoke all on function public.waitlist_confirm(text) from public, anon, authenticated;
grant execute on function public.waitlist_upsert_pending(text, text) to service_role;
grant execute on function public.waitlist_confirm(text) to service_role;
