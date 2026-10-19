-- Milestone 1: row level security, helper functions and the only write paths (RPCs).
-- Principle: clients may read what belongs to their cases; every multi-step or
-- privileged write goes through a security definer function that checks roles
-- and writes to audit_log.

-- ---------------------------------------------------------------------------
-- Table privileges: deny by default, then grant only what clients need.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.care_cases enable row level security;
alter table public.case_members enable row level security;
alter table public.case_invites enable row level security;
alter table public.consents enable row level security;
alter table public.audit_log enable row level security;

revoke all on table
  public.profiles, public.care_cases, public.case_members,
  public.case_invites, public.consents, public.audit_log
from anon, authenticated;

grant select on table
  public.profiles, public.care_cases, public.case_members,
  public.case_invites, public.consents
to authenticated;

-- The only direct writes: own first name, case name and legal basis (owners).
grant update (display_name) on table public.profiles to authenticated;
grant update (display_name, legal_basis) on table public.care_cases to authenticated;

-- audit_log: no client access at all.

-- ---------------------------------------------------------------------------
-- Helper functions (security definer to avoid RLS recursion on case_members).
-- ---------------------------------------------------------------------------

create function public.is_case_member(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.case_members
    where case_id = p_case_id and user_id = (select auth.uid())
  );
$$;

create function public.has_case_role(p_case_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.case_members
    where case_id = p_case_id and user_id = (select auth.uid()) and role = any (p_roles)
  );
$$;

-- True if the caller and p_user_id are members of at least one common case.
create function public.shares_case_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.case_members mine
    join public.case_members theirs on theirs.case_id = mine.case_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = p_user_id
  );
$$;

create function public.has_active_consent(p_user_id uuid, p_consent_type text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.consents
    where user_id = p_user_id and consent_type = p_consent_type and revoked_at is null
  );
$$;

create function public.write_audit(
  p_case_id uuid, p_action text, p_target_type text, p_target_id uuid
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_log (case_id, actor_id, action, target_type, target_id)
  values (p_case_id, (select auth.uid()), p_action, p_target_type, p_target_id);
$$;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------

create policy "Read own profile and profiles of fellow case members"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.shares_case_with(id));

create policy "Update own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Members read their cases"
  on public.care_cases for select to authenticated
  using (public.is_case_member(id));

create policy "Owners update their cases"
  on public.care_cases for update to authenticated
  using (public.has_case_role(id, array['owner']))
  with check (public.has_case_role(id, array['owner']));

create policy "Members read members of their cases"
  on public.case_members for select to authenticated
  using (public.is_case_member(case_id));

create policy "Owners read invites of their cases"
  on public.case_invites for select to authenticated
  using (public.has_case_role(case_id, array['owner']));

create policy "Read own consents"
  on public.consents for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- RPCs. Errors use stable codes in the message (e.g. 'invite_expired') that
-- the app maps to friendly German texts. Messages never contain personal data.
-- ---------------------------------------------------------------------------

create function public.record_consent(p_consent_type text, p_version text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_id uuid;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;
  -- Keep exactly one active consent per type; a new version supersedes the old one.
  update public.consents set revoked_at = now()
    where user_id = v_user and consent_type = p_consent_type and revoked_at is null;
  insert into public.consents (user_id, consent_type, version)
    values (v_user, p_consent_type, p_version)
    returning id into v_id;
  perform public.write_audit(null, 'consent.recorded', 'consent', v_id);
end;
$$;

create function public.revoke_consent(p_consent_type text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_id uuid;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;
  for v_id in
    update public.consents set revoked_at = now()
      where user_id = v_user and consent_type = p_consent_type and revoked_at is null
      returning id
  loop
    perform public.write_audit(null, 'consent.revoked', 'consent', v_id);
  end loop;
end;
$$;

create function public.create_case(p_display_name text, p_legal_basis text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_case_id uuid;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;
  if not public.has_active_consent(v_user, 'health_data') then
    raise exception 'consent_required';
  end if;
  insert into public.care_cases (display_name, legal_basis, created_by)
    values (trim(p_display_name), p_legal_basis, v_user)
    returning id into v_case_id;
  insert into public.case_members (case_id, user_id, role)
    values (v_case_id, v_user, 'owner');
  perform public.write_audit(v_case_id, 'case.created', 'case', v_case_id);
  return v_case_id;
end;
$$;

-- Returns the plain token exactly once. The link is built by the app.
create function public.create_invite(p_case_id uuid, p_role text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text;
  v_invite_id uuid;
begin
  if not public.has_case_role(p_case_id, array['owner']) then
    raise exception 'not_allowed';
  end if;
  -- 24 random bytes, base64url without padding (32 characters).
  v_token := translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/', '-_');
  insert into public.case_invites (case_id, token_hash, role, created_by)
    values (p_case_id, encode(sha256(convert_to(v_token, 'UTF8')), 'hex'), p_role, (select auth.uid()))
    returning id into v_invite_id;
  perform public.write_audit(p_case_id, 'invite.created', 'invite', v_invite_id);
  return v_token;
end;
$$;

create function public.revoke_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_case_id uuid;
begin
  select case_id into v_case_id from public.case_invites where id = p_invite_id;
  if v_case_id is null or not public.has_case_role(v_case_id, array['owner']) then
    raise exception 'not_allowed';
  end if;
  update public.case_invites set revoked_at = now()
    where id = p_invite_id and used_at is null and revoked_at is null;
  perform public.write_audit(v_case_id, 'invite.revoked', 'invite', p_invite_id);
end;
$$;

-- Shown on the invite screen before joining: case name and inviter's first name.
-- Requires a valid token, so it reveals nothing to someone without the link.
create function public.preview_invite(p_token text)
returns table (case_name text, inviter_name text, role text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_invite public.case_invites;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;
  select * into v_invite from public.case_invites
    where token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
  if v_invite.id is null or v_invite.revoked_at is not null then
    raise exception 'invite_invalid';
  end if;
  if v_invite.used_at is not null then
    raise exception 'invite_used';
  end if;
  if v_invite.expires_at <= now() then
    raise exception 'invite_expired';
  end if;
  return query
    select c.display_name, p.display_name, v_invite.role
    from public.care_cases c
    left join public.profiles p on p.id = v_invite.created_by
    where c.id = v_invite.case_id;
end;
$$;

create function public.accept_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_invite public.case_invites;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;
  if not public.has_active_consent(v_user, 'health_data') then
    raise exception 'consent_required';
  end if;
  select * into v_invite from public.case_invites
    where token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
    for update;
  if v_invite.id is null or v_invite.revoked_at is not null then
    raise exception 'invite_invalid';
  end if;
  -- Already a member (e.g. tapped the link twice): succeed without using up the token.
  if exists (select 1 from public.case_members where case_id = v_invite.case_id and user_id = v_user) then
    return v_invite.case_id;
  end if;
  if v_invite.used_at is not null then
    raise exception 'invite_used';
  end if;
  if v_invite.expires_at <= now() then
    raise exception 'invite_expired';
  end if;
  update public.case_invites set used_at = now(), used_by = v_user where id = v_invite.id;
  insert into public.case_members (case_id, user_id, role)
    values (v_invite.case_id, v_user, v_invite.role);
  perform public.write_audit(v_invite.case_id, 'invite.accepted', 'invite', v_invite.id);
  return v_invite.case_id;
end;
$$;

create function public.change_member_role(p_case_id uuid, p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current text;
begin
  if not public.has_case_role(p_case_id, array['owner']) then
    raise exception 'not_allowed';
  end if;
  if p_role not in ('owner', 'member', 'viewer') then
    raise exception 'invalid_role';
  end if;
  -- Lock all owner rows of the case so concurrent changes cannot remove the last owner.
  perform 1 from public.case_members where case_id = p_case_id and role = 'owner' for update;
  select role into v_current from public.case_members
    where case_id = p_case_id and user_id = p_user_id;
  if v_current is null then
    raise exception 'member_not_found';
  end if;
  if v_current = 'owner' and p_role <> 'owner'
     and (select count(*) from public.case_members where case_id = p_case_id and role = 'owner') = 1 then
    raise exception 'last_owner';
  end if;
  update public.case_members set role = p_role where case_id = p_case_id and user_id = p_user_id;
  perform public.write_audit(p_case_id, 'member.role_changed', 'user', p_user_id);
end;
$$;

-- Shared by remove_member and leave_case; callers check permissions.
create function public.delete_membership(p_case_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
begin
  perform 1 from public.case_members where case_id = p_case_id and role = 'owner' for update;
  select role into v_role from public.case_members
    where case_id = p_case_id and user_id = p_user_id;
  if v_role is null then
    raise exception 'member_not_found';
  end if;
  if v_role = 'owner'
     and (select count(*) from public.case_members where case_id = p_case_id and role = 'owner') = 1 then
    raise exception 'last_owner';
  end if;
  delete from public.case_members where case_id = p_case_id and user_id = p_user_id;
end;
$$;

create function public.remove_member(p_case_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_case_role(p_case_id, array['owner']) then
    raise exception 'not_allowed';
  end if;
  perform public.delete_membership(p_case_id, p_user_id);
  perform public.write_audit(p_case_id, 'member.removed', 'user', p_user_id);
end;
$$;

create function public.leave_case(p_case_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if not public.is_case_member(p_case_id) then
    raise exception 'not_allowed';
  end if;
  perform public.delete_membership(p_case_id, v_user);
  perform public.write_audit(p_case_id, 'member.left', 'user', v_user);
end;
$$;

-- ---------------------------------------------------------------------------
-- Function privileges: nothing for anon; internal helpers not callable directly.
-- ---------------------------------------------------------------------------

revoke all on function
  public.is_case_member(uuid),
  public.has_case_role(uuid, text[]),
  public.shares_case_with(uuid),
  public.has_active_consent(uuid, text),
  public.write_audit(uuid, text, text, uuid),
  public.record_consent(text, text),
  public.revoke_consent(text),
  public.create_case(text, text),
  public.create_invite(uuid, text),
  public.revoke_invite(uuid),
  public.preview_invite(text),
  public.accept_invite(text),
  public.change_member_role(uuid, uuid, text),
  public.delete_membership(uuid, uuid),
  public.remove_member(uuid, uuid),
  public.leave_case(uuid)
from public, anon, authenticated;

-- Policy helpers must be executable by the role evaluating the policy.
grant execute on function
  public.is_case_member(uuid),
  public.has_case_role(uuid, text[]),
  public.shares_case_with(uuid)
to authenticated;

grant execute on function
  public.record_consent(text, text),
  public.revoke_consent(text),
  public.create_case(text, text),
  public.create_invite(uuid, text),
  public.revoke_invite(uuid),
  public.preview_invite(text),
  public.accept_invite(text),
  public.change_member_role(uuid, uuid, text),
  public.remove_member(uuid, uuid),
  public.leave_case(uuid)
to authenticated;
