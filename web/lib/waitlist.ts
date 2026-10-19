import { createHash, randomBytes } from 'node:crypto';

import { z } from 'zod';

// Waitlist with double opt-in. Server-only: uses the Supabase secret key.
// Stores only the e-mail, a hash of the confirmation token and timestamps.

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  consent: z.literal(true),
});

export type Signup = z.infer<typeof signupSchema>;

export function createToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

type Config = { supabaseUrl: string; secretKey: string; siteUrl: string };

export function readConfig(env: NodeJS.ProcessEnv = process.env): Config | null {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY, SITE_URL } = env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !SITE_URL) return null;
  return { supabaseUrl: SUPABASE_URL, secretKey: SUPABASE_SECRET_KEY, siteUrl: SITE_URL };
}

function headers(config: Config) {
  return {
    apikey: config.secretKey,
    Authorization: `Bearer ${config.secretKey}`,
    'Content-Type': 'application/json',
  };
}

/** Inserts or refreshes a pending signup. Already confirmed addresses stay confirmed. */
export async function savePending(config: Config, email: string, tokenHash: string): Promise<void> {
  const res = await fetch(`${config.supabaseUrl}/rest/v1/rpc/waitlist_upsert_pending`, {
    method: 'POST',
    headers: headers(config),
    body: JSON.stringify({ p_email: email, p_token_hash: tokenHash }),
  });
  if (!res.ok) throw new Error(`waitlist upsert failed (${res.status})`);
}

/** Confirms a signup by token. Returns false for unknown or expired tokens. */
export async function confirm(config: Config, token: string): Promise<boolean> {
  const res = await fetch(`${config.supabaseUrl}/rest/v1/rpc/waitlist_confirm`, {
    method: 'POST',
    headers: headers(config),
    body: JSON.stringify({ p_token_hash: hashToken(token) }),
  });
  if (!res.ok) throw new Error(`waitlist confirm failed (${res.status})`);
  return (await res.json()) === true;
}
