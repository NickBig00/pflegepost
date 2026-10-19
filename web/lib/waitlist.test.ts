import { describe, expect, test } from 'vitest';

import { confirmationMail, mailConfigured } from './mail';
import { createToken, hashToken, readConfig, signupSchema } from './waitlist';

describe('signupSchema', () => {
  test('normalises the e-mail and requires consent', () => {
    expect(signupSchema.parse({ email: '  Anna@Example.DE ', consent: true }).email).toBe('anna@example.de');
    expect(signupSchema.safeParse({ email: 'anna@example.de', consent: false }).success).toBe(false);
    expect(signupSchema.safeParse({ email: 'keine-mail', consent: true }).success).toBe(false);
  });
});

describe('tokens', () => {
  test('only the hash is derived and stored', () => {
    const { token, hash } = createToken();
    expect(token.length).toBeGreaterThanOrEqual(43);
    expect(hash).toBe(hashToken(token));
    expect(hash).not.toContain(token);
    expect(createToken().token).not.toBe(token);
  });
});

describe('configuration', () => {
  test('waitlist stays closed without full configuration', () => {
    expect(readConfig({ SUPABASE_URL: 'x' } as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(mailConfigured({} as unknown as NodeJS.ProcessEnv)).toBe(false);
  });

  test('confirmation mail contains the link', () => {
    expect(confirmationMail('https://example.de/bestaetigen?token=abc').text).toContain('token=abc');
  });
});
