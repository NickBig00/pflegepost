import { readSupabaseEnv } from '../env';
import { errorMessage, toAppErrorCode } from '../errors';
import { careCaseRowSchema, invitePreviewSchema, inviteTokenSchema } from '../rows';

describe('env', () => {
  test('accepts the project URL and publishable key', () => {
    expect(
      readSupabaseEnv({
        url: 'https://mukgwltgwuqtuqjrveer.supabase.co',
        publishableKey: 'sb_publishable_abc',
      }).url,
    ).toBe('https://mukgwltgwuqtuqjrveer.supabase.co');
  });

  test('rejects secret keys and missing values', () => {
    expect(() =>
      readSupabaseEnv({ url: 'https://x.supabase.co', publishableKey: 'sb_secret_abc' }),
    ).toThrow();
    expect(() => readSupabaseEnv({ url: undefined, publishableKey: undefined })).toThrow();
  });
});

describe('errors', () => {
  test('maps RPC error codes from the database', () => {
    expect(toAppErrorCode({ message: 'invite_expired', code: 'P0001' })).toBe('invite_expired');
    expect(toAppErrorCode({ message: 'last_owner' })).toBe('last_owner');
  });

  test('detects network failures', () => {
    expect(toAppErrorCode(new TypeError('Network request failed'))).toBe('network');
    expect(toAppErrorCode({ name: 'AuthRetryableFetchError', message: '' })).toBe('network');
  });

  test('never passes raw messages through', () => {
    const raw = { message: 'duplicate key value violates unique constraint for anna@example.com' };
    expect(toAppErrorCode(raw)).toBe('unknown');
    expect(errorMessage(raw)).not.toContain('anna');
    expect(errorMessage(null)).toMatch(/nicht geklappt/);
  });
});

describe('rows', () => {
  test('parses a care case row', () => {
    const row = careCaseRowSchema.parse({
      id: '3f1c2a5e-8d4b-4c1a-9e2f-6b7a8c9d0e1f',
      display_name: 'Mama',
      legal_basis: 'power_of_attorney',
      created_by: null,
      created_at: '2026-10-19T22:20:00+00:00',
    });
    expect(row.legal_basis).toBe('power_of_attorney');
  });

  test('rejects unknown legal basis and owner invites', () => {
    expect(() =>
      careCaseRowSchema.parse({
        id: '3f1c2a5e-8d4b-4c1a-9e2f-6b7a8c9d0e1f',
        display_name: 'Mama',
        legal_basis: 'other',
        created_by: null,
        created_at: 'x',
      }),
    ).toThrow();
    expect(
      invitePreviewSchema.safeParse({ case_name: 'Mama', inviter_name: 'Nick', role: 'owner' }).success,
    ).toBe(false);
  });

  test('invite tokens are 32 base64url characters', () => {
    expect(inviteTokenSchema.safeParse('Ab3_-Ab3_-Ab3_-Ab3_-Ab3_-Ab3_-Ab').success).toBe(true);
    expect(inviteTokenSchema.safeParse('too-short').success).toBe(false);
    expect(inviteTokenSchema.safeParse('Ab3+/Ab3_-Ab3_-Ab3_-Ab3_-Ab3_-Ab').success).toBe(false);
  });
});
