import { z } from 'zod';

import { legalBasisSchema } from '@/demo/schemas';

// Zod schemas for rows and RPC results as returned by Supabase (snake_case).
// Every response is parsed before it reaches the UI.

const timestamp = z.string().min(1);

export const roleSchema = z.enum(['owner', 'member', 'viewer']);
export const inviteRoleSchema = z.enum(['member', 'viewer']);

export const profileRowSchema = z.object({
  id: z.uuid(),
  display_name: z.string().nullable(),
  created_at: timestamp,
});

export const careCaseRowSchema = z.object({
  id: z.uuid(),
  display_name: z.string().min(1),
  legal_basis: legalBasisSchema,
  created_by: z.uuid().nullable(),
  created_at: timestamp,
});

export const caseMemberRowSchema = z.object({
  case_id: z.uuid(),
  user_id: z.uuid(),
  role: roleSchema,
  joined_at: timestamp,
});

export const consentRowSchema = z.object({
  id: z.uuid(),
  consent_type: z.literal('health_data'),
  version: z.string().min(1),
  accepted_at: timestamp,
  revoked_at: timestamp.nullable(),
});

export const invitePreviewSchema = z.object({
  case_name: z.string().min(1),
  inviter_name: z.string().nullable(),
  role: inviteRoleSchema,
});

/** Invite tokens are 24 random bytes in base64url (32 characters). */
export const inviteTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32}$/);

export type ProfileRow = z.infer<typeof profileRowSchema>;
export type CareCaseRow = z.infer<typeof careCaseRowSchema>;
export type CaseMemberRow = z.infer<typeof caseMemberRowSchema>;
export type ConsentRow = z.infer<typeof consentRowSchema>;
export type InvitePreview = z.infer<typeof invitePreviewSchema>;
export type Role = z.infer<typeof roleSchema>;
export type InviteRole = z.infer<typeof inviteRoleSchema>;
