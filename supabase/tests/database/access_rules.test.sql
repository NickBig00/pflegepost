-- RLS and RPC tests for milestone 1 (cases, members, invites, consents, audit log)
-- and the waitlist table from milestone 0.
-- Run with `npx supabase test db` or, without Docker, `scripts/test-db.sh`.

begin;

select plan(66);

-- ---------------------------------------------------------------------------
-- Test helpers: act as a signed-in user, as an anonymous visitor, or as admin.
-- ---------------------------------------------------------------------------

create schema tests;
grant usage on schema tests to anon, authenticated;

create function tests.act_as(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  select set_config('role', 'authenticated', true);
$$;

create function tests.act_as_anon() returns void language sql as $$
  select set_config('request.jwt.claims', '{"role":"anon"}', true);
  select set_config('role', 'anon', true);
$$;

create function tests.act_as_admin() returns void language sql as $$
  select set_config('role', 'none', true);
  select set_config('request.jwt.claims', '', true);
$$;

grant execute on all functions in schema tests to anon, authenticated;

-- Users: Nick (owner), sister (member), stranger, viewer.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'nick@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'sister@example.test'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@example.test'),
  ('00000000-0000-0000-0000-00000000000d', 'viewer@example.test');

\set nick '''00000000-0000-0000-0000-00000000000a'''
\set sister '''00000000-0000-0000-0000-00000000000b'''
\set stranger '''00000000-0000-0000-0000-00000000000c'''
\set viewer '''00000000-0000-0000-0000-00000000000d'''

-- ---------------------------------------------------------------------------
-- Profiles are created on sign-up
-- ---------------------------------------------------------------------------

select is(
  (select count(*)::int from public.profiles),
  4,
  'sign-up trigger creates a profile per user'
);

-- ---------------------------------------------------------------------------
-- Consent is required before creating a case
-- ---------------------------------------------------------------------------

select tests.act_as(:nick);

select throws_ok(
  $$ select public.create_case('Mama', 'consent') $$,
  'P0001', 'consent_required',
  'creating a case without consent fails'
);

select lives_ok(
  $$ select public.record_consent('health_data', '2026-10') $$,
  'user records consent'
);

select is(
  (select count(*)::int from public.consents where revoked_at is null),
  1,
  'user sees own active consent'
);

select lives_ok(
  $$ update public.profiles set display_name = 'Nick' where id = auth.uid() $$,
  'user sets own first name'
);

select public.create_case('Mama', 'power_of_attorney') as case_id \gset

select is(
  (select legal_basis from public.care_cases where id = :'case_id'),
  'power_of_attorney',
  'creator sees the new case'
);

select is(
  (select role from public.case_members where case_id = :'case_id' and user_id = auth.uid()),
  'owner',
  'creator becomes owner'
);

select throws_ok(
  $$ select public.create_case('Papa', 'something_else') $$,
  '23514', null,
  'invalid legal basis is rejected'
);

select throws_ok(
  $$ select public.create_case('   ', 'unknown') $$,
  '23514', null,
  'blank case name is rejected'
);

-- ---------------------------------------------------------------------------
-- Invites
-- ---------------------------------------------------------------------------

select public.create_invite(:'case_id', 'member') as member_token \gset
select public.create_invite(:'case_id', 'viewer') as viewer_token \gset
select public.create_invite(:'case_id', 'member') as spare_token \gset

select is(length(:'member_token'), 32, 'invite token has 32 characters');

select is(
  (select count(*)::int from public.case_invites where case_id = :'case_id'),
  3,
  'owner sees invites of own case'
);

select is(
  (select count(*)::int from public.case_invites where token_hash = :'member_token'),
  0,
  'only the hash of the token is stored'
);

select throws_ok(
  format('select public.create_invite(%L, %L)', :'case_id', 'owner'),
  '23514', null,
  'invites cannot grant the owner role'
);

-- ---------------------------------------------------------------------------
-- Strangers see nothing
-- ---------------------------------------------------------------------------

select tests.act_as(:stranger);

select is_empty($$ select * from public.care_cases $$, 'stranger sees no case');
select is_empty($$ select * from public.case_members $$, 'stranger sees no members');
select is_empty($$ select * from public.case_invites $$, 'stranger sees no invites');
select is_empty(
  $$ select * from public.profiles where id <> auth.uid() $$,
  'stranger sees no other profiles'
);
select is_empty($$ select * from public.consents $$, 'stranger sees no consents of others');

select throws_ok(
  format('select public.create_invite(%L, %L)', :'case_id', 'member'),
  'P0001', 'not_allowed',
  'stranger cannot create invites'
);

select throws_ok(
  format('insert into public.case_members (case_id, user_id, role) values (%L, auth.uid(), %L)', :'case_id', 'owner'),
  '42501', null,
  'stranger cannot insert themselves into case_members'
);

select throws_ok(
  format('insert into public.case_invites (case_id, token_hash, role) values (%L, %L, %L)', :'case_id', 'x', 'member'),
  '42501', null,
  'clients cannot insert invites directly'
);

select throws_ok(
  $$ insert into public.care_cases (display_name) values ('Fremd') $$,
  '42501', null,
  'clients cannot insert cases directly'
);

select throws_ok(
  format('delete from public.care_cases where id = %L', :'case_id'),
  '42501', null,
  'clients cannot delete cases directly'
);

-- Stranger tries to join without consent, then with consent but a wrong token.
select throws_ok(
  format('select public.accept_invite(%L)', :'member_token'),
  'P0001', 'consent_required',
  'joining requires consent'
);

select public.record_consent('health_data', '2026-10');

select throws_ok(
  $$ select public.accept_invite('not-a-real-token') $$,
  'P0001', 'invite_invalid',
  'wrong token is rejected'
);

select throws_ok(
  $$ select * from public.preview_invite('not-a-real-token') $$,
  'P0001', 'invite_invalid',
  'preview with wrong token is rejected'
);

-- ---------------------------------------------------------------------------
-- Sister joins as member
-- ---------------------------------------------------------------------------

select tests.act_as(:sister);
select public.record_consent('health_data', '2026-10');

select results_eq(
  format('select case_name, inviter_name, role from public.preview_invite(%L)', :'member_token'),
  $$ values ('Mama'::text, 'Nick'::text, 'member'::text) $$,
  'preview shows case name, inviter and role'
);

select is(
  public.accept_invite(:'member_token'),
  :'case_id'::uuid,
  'sister accepts the invite'
);

select is(
  public.accept_invite(:'member_token'),
  :'case_id'::uuid,
  'accepting again as member is harmless'
);

select is(
  (select count(*)::int from public.case_members where case_id = :'case_id'),
  2,
  'member sees all members of the case'
);

select is(
  (select display_name from public.profiles where id = :nick),
  'Nick',
  'member sees profiles of fellow members'
);

select is_empty($$ select * from public.case_invites $$, 'member sees no invites');

select throws_ok(
  format('select public.create_invite(%L, %L)', :'case_id', 'viewer'),
  'P0001', 'not_allowed',
  'member cannot create invites'
);

select throws_ok(
  format('select public.change_member_role(%L, auth.uid(), %L)', :'case_id', 'owner'),
  'P0001', 'not_allowed',
  'member cannot change roles'
);

select throws_ok(
  format('select public.remove_member(%L, %L)', :'case_id', :nick),
  'P0001', 'not_allowed',
  'member cannot remove others'
);

select throws_ok(
  format('update public.case_members set role = %L where case_id = %L', 'owner', :'case_id'),
  '42501', null,
  'member cannot change roles directly'
);

-- Updating the case is owner-only; for members RLS hides the row from UPDATE.
update public.care_cases set display_name = 'Geändert' where id = :'case_id';
select is(
  (select display_name from public.care_cases where id = :'case_id'),
  'Mama',
  'member cannot rename the case'
);

update public.profiles set display_name = 'Gekapert' where id = :nick;
select is(
  (select display_name from public.profiles where id = :nick),
  'Nick',
  'nobody can change another person''s profile'
);

-- ---------------------------------------------------------------------------
-- Token is single use; expired and revoked tokens fail
-- ---------------------------------------------------------------------------

select tests.act_as(:stranger);

select throws_ok(
  format('select public.accept_invite(%L)', :'member_token'),
  'P0001', 'invite_used',
  'used token cannot be used again'
);

select tests.act_as_admin();
update public.case_invites set expires_at = now() - interval '1 minute'
  where token_hash = encode(sha256(convert_to(:'spare_token', 'UTF8')), 'hex');

select tests.act_as(:stranger);
select throws_ok(
  format('select public.accept_invite(%L)', :'spare_token'),
  'P0001', 'invite_expired',
  'expired token is rejected'
);

select tests.act_as(:nick);
select public.create_invite(:'case_id', 'member') as revoked_token \gset
select public.revoke_invite(
  (select id from public.case_invites where token_hash = encode(sha256(convert_to(:'revoked_token', 'UTF8')), 'hex'))
);

select tests.act_as(:stranger);
select throws_ok(
  format('select public.accept_invite(%L)', :'revoked_token'),
  'P0001', 'invite_invalid',
  'revoked token is rejected'
);

-- ---------------------------------------------------------------------------
-- Viewer can read but not write
-- ---------------------------------------------------------------------------

select tests.act_as(:viewer);
select public.record_consent('health_data', '2026-10');
select public.accept_invite(:'viewer_token');

select is(
  (select role from public.case_members where case_id = :'case_id' and user_id = auth.uid()),
  'viewer',
  'viewer joins with viewer role'
);

select is(
  (select count(*)::int from public.care_cases),
  1,
  'viewer can read the case'
);

update public.care_cases set legal_basis = 'unknown' where id = :'case_id';
select is(
  (select legal_basis from public.care_cases where id = :'case_id'),
  'power_of_attorney',
  'viewer cannot change the case'
);

select throws_ok(
  format('select public.create_invite(%L, %L)', :'case_id', 'member'),
  'P0001', 'not_allowed',
  'viewer cannot create invites'
);

-- ---------------------------------------------------------------------------
-- Owner rules: last owner is protected
-- ---------------------------------------------------------------------------

select tests.act_as(:nick);

select throws_ok(
  format('select public.change_member_role(%L, auth.uid(), %L)', :'case_id', 'member'),
  'P0001', 'last_owner',
  'last owner cannot be downgraded'
);

select throws_ok(
  format('select public.remove_member(%L, auth.uid())', :'case_id'),
  'P0001', 'last_owner',
  'last owner cannot be removed'
);

select throws_ok(
  format('select public.leave_case(%L)', :'case_id'),
  'P0001', 'last_owner',
  'last owner cannot leave'
);

select throws_ok(
  format('select public.change_member_role(%L, %L, %L)', :'case_id', :stranger, 'member'),
  'P0001', 'member_not_found',
  'role change for non-members fails'
);

update public.care_cases set display_name = 'Mutti' where id = :'case_id';
select is(
  (select display_name from public.care_cases where id = :'case_id'),
  'Mutti',
  'owner can rename the case'
);

select lives_ok(
  format('select public.change_member_role(%L, %L, %L)', :'case_id', :sister, 'owner'),
  'owner can promote a member to owner'
);

select lives_ok(
  format('select public.remove_member(%L, %L)', :'case_id', :viewer),
  'owner can remove a member'
);

select lives_ok(
  format('select public.leave_case(%L)', :'case_id'),
  'former owner can leave once another owner exists'
);

select is_empty($$ select * from public.care_cases $$, 'after leaving, the case is no longer visible');

select tests.act_as(:viewer);
select is_empty($$ select * from public.care_cases $$, 'removed member no longer sees the case');

-- ---------------------------------------------------------------------------
-- Consent can be revoked; afterwards joining is blocked
-- ---------------------------------------------------------------------------

select tests.act_as(:stranger);
select public.revoke_consent('health_data');

select is_empty(
  $$ select * from public.consents where revoked_at is null $$,
  'revoked consent is no longer active'
);

-- ---------------------------------------------------------------------------
-- Audit log: written by functions, invisible and read-only for clients
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ select * from public.audit_log $$,
  '42501', null,
  'clients cannot read the audit log'
);

select throws_ok(
  $$ insert into public.audit_log (action) values ('fake') $$,
  '42501', null,
  'clients cannot write the audit log'
);

select tests.act_as_admin();

select set_eq(
  $$ select distinct action from public.audit_log $$,
  array[
    'consent.recorded', 'consent.revoked', 'case.created', 'invite.created',
    'invite.revoked', 'invite.accepted', 'member.role_changed', 'member.removed', 'member.left'
  ],
  'every write path leaves an audit entry'
);

-- ---------------------------------------------------------------------------
-- Anonymous visitors and the waitlist (milestone 0)
-- ---------------------------------------------------------------------------

select tests.act_as_anon();

select throws_ok($$ select * from public.care_cases $$, '42501', null, 'anon cannot read cases');
select throws_ok($$ select * from public.profiles $$, '42501', null, 'anon cannot read profiles');
select throws_ok(
  $$ select public.create_case('Mama', 'unknown') $$,
  '42501', null,
  'anon cannot call create_case'
);
select is_empty($$ select * from public.waitlist $$, 'anon sees no waitlist entries');
select throws_ok(
  $$ insert into public.waitlist (email, token_hash) values ('a@example.test', 'x') $$,
  '42501', null,
  'anon cannot write the waitlist'
);
select throws_ok(
  $$ select public.waitlist_confirm('x') $$,
  '42501', null,
  'anon cannot call waitlist functions'
);

select tests.act_as(:nick);
select is_empty($$ select * from public.waitlist $$, 'authenticated users see no waitlist entries');

select * from finish();

rollback;
