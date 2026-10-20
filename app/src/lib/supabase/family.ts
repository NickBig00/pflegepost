import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { CONSENT_VERSION } from './account';
import {
  caseMemberRowSchema,
  invitePreviewSchema,
  profileRowSchema,
  roleSchema,
  type InvitePreview,
  type InviteRole,
  type Role,
} from './rows';

export type FamilyMember = { userId: string; displayName: string | null; role: Role };

export type PendingInvite = { id: string; role: InviteRole; expiresAt: string };

export type Family = { members: FamilyMember[]; invites: PendingInvite[] };

const roleOrder: Record<Role, number> = { owner: 0, member: 1, viewer: 2 };

const pendingInviteRowSchema = z.object({
  id: z.uuid(),
  role: z.enum(['member', 'viewer']),
  expires_at: z.string().min(1),
});

/** Members with first names, plus open invites (only owners can read those; RLS returns none otherwise). */
export async function loadFamily(supabase: SupabaseClient, caseId: string): Promise<Family> {
  const [members, invites] = await Promise.all([
    supabase.from('case_members').select('*').eq('case_id', caseId).order('joined_at'),
    supabase
      .from('case_invites')
      .select('id, role, expires_at')
      .eq('case_id', caseId)
      .is('used_at', null)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at'),
  ]);
  if (members.error) throw members.error;
  if (invites.error) throw invites.error;
  const memberRows = z.array(caseMemberRowSchema).parse(members.data);

  const profiles = await supabase
    .from('profiles')
    .select('*')
    .in(
      'id',
      memberRows.map((m) => m.user_id),
    );
  if (profiles.error) throw profiles.error;
  const names = new Map(
    z
      .array(profileRowSchema)
      .parse(profiles.data)
      .map((p) => [p.id, p.display_name]),
  );

  return {
    members: memberRows
      .map((m) => ({ userId: m.user_id, displayName: names.get(m.user_id) ?? null, role: m.role }))
      .sort((a, b) => roleOrder[a.role] - roleOrder[b.role]),
    invites: z
      .array(pendingInviteRowSchema)
      .parse(invites.data)
      .map((i) => ({ id: i.id, role: i.role, expiresAt: i.expires_at })),
  };
}

async function rpc(supabase: SupabaseClient, fn: string, args: Record<string, unknown>) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw error;
  return data as unknown;
}

/** Returns the plain token once; only its hash is stored. */
export async function createInvite(supabase: SupabaseClient, caseId: string, role: InviteRole) {
  return z
    .string()
    .min(1)
    .parse(await rpc(supabase, 'create_invite', { p_case_id: caseId, p_role: role }));
}

export async function revokeInvite(supabase: SupabaseClient, inviteId: string) {
  await rpc(supabase, 'revoke_invite', { p_invite_id: inviteId });
}

export async function changeMemberRole(supabase: SupabaseClient, caseId: string, userId: string, role: Role) {
  await rpc(supabase, 'change_member_role', {
    p_case_id: caseId,
    p_user_id: userId,
    p_role: roleSchema.parse(role),
  });
}

export async function removeMember(supabase: SupabaseClient, caseId: string, userId: string) {
  await rpc(supabase, 'remove_member', { p_case_id: caseId, p_user_id: userId });
}

export async function leaveCase(supabase: SupabaseClient, caseId: string) {
  await rpc(supabase, 'leave_case', { p_case_id: caseId });
}

export async function previewInvite(supabase: SupabaseClient, token: string): Promise<InvitePreview> {
  const rows = z.array(invitePreviewSchema).parse(await rpc(supabase, 'preview_invite', { p_token: token }));
  if (!rows[0]) throw new Error('invite_invalid');
  return rows[0];
}

export type JoinSetup = { token: string; firstName: string | null; consent: boolean };

/** Sets the first name and consent if still missing, then joins the case. */
export async function joinCase(supabase: SupabaseClient, userId: string, setup: JoinSetup) {
  if (setup.firstName !== null) {
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: setup.firstName.trim() })
      .eq('id', userId);
    if (error) throw error;
  }
  if (setup.consent) {
    await rpc(supabase, 'record_consent', { p_consent_type: 'health_data', p_version: CONSENT_VERSION });
  }
  return z.uuid().parse(await rpc(supabase, 'accept_invite', { p_token: setup.token }));
}
