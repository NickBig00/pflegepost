import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import type { LegalBasis } from '@/demo/schemas';

import {
  careCaseRowSchema,
  consentRowSchema,
  profileRowSchema,
  type CareCaseRow,
  type ProfileRow,
} from './rows';

/** Version of the consent text in onboarding/einwilligung.tsx. Bump when the text changes. */
export const CONSENT_VERSION = '2026-10';

export type Account = {
  profile: ProfileRow;
  hasConsent: boolean;
  cases: CareCaseRow[];
};

/** Loads everything the route guard and the first screens need. RLS limits it to the caller. */
export async function loadAccount(supabase: SupabaseClient, userId: string): Promise<Account> {
  const [profile, consents, cases] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('consents').select('*').is('revoked_at', null),
    supabase.from('care_cases').select('*').order('created_at'),
  ]);
  for (const result of [profile, consents, cases]) {
    if (result.error) throw result.error;
  }
  return {
    profile: profileRowSchema.parse(profile.data),
    hasConsent: z.array(consentRowSchema).parse(consents.data).length > 0,
    cases: z.array(careCaseRowSchema).parse(cases.data),
  };
}

export type CaseSetup = { firstName: string; caseName: string; legalBasis: LegalBasis };

/** Last onboarding step: own first name, consent, then the case (needs consent). */
export async function completeSetup(supabase: SupabaseClient, userId: string, setup: CaseSetup) {
  const profile = await supabase
    .from('profiles')
    .update({ display_name: setup.firstName.trim() })
    .eq('id', userId);
  if (profile.error) throw profile.error;

  const consent = await supabase.rpc('record_consent', {
    p_consent_type: 'health_data',
    p_version: CONSENT_VERSION,
  });
  if (consent.error) throw consent.error;

  const created = await supabase.rpc('create_case', {
    p_display_name: setup.caseName.trim(),
    p_legal_basis: setup.legalBasis,
  });
  if (created.error) throw created.error;
  return z.uuid().parse(created.data);
}
