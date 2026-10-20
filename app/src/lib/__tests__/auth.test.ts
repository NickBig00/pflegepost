import { parseAuthCallback } from '../authCallback';
import { guardRedirect, type GuardState } from '../routeGuard';
import { toAppErrorCode } from '../supabase/errors';

describe('sign-in link callback', () => {
  test('reads tokens from the fragment (app scheme and Expo Go)', () => {
    for (const base of ['pflegepost://onboarding/link', 'exp://192.168.0.2:8081/--/onboarding/link']) {
      expect(parseAuthCallback(`${base}#access_token=a.b.c&refresh_token=r1&type=magiclink`)).toEqual({
        type: 'session',
        accessToken: 'a.b.c',
        refreshToken: 'r1',
      });
    }
  });

  test('recognises expired or used links', () => {
    expect(
      parseAuthCallback(
        'pflegepost://onboarding/link#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid',
      ),
    ).toEqual({ type: 'error' });
    expect(parseAuthCallback('pflegepost://onboarding/link?error=server_error')).toEqual({ type: 'error' });
  });

  test('ignores unrelated links', () => {
    expect(parseAuthCallback('pflegepost://dokument/1')).toBeNull();
    expect(parseAuthCallback(null)).toBeNull();
    expect(parseAuthCallback('pflegepost://onboarding/link#access_token=only')).toBeNull();
  });
});

describe('route guard', () => {
  const signedOut: GuardState = { status: 'signedOut' };
  const noCase: GuardState = { status: 'signedIn', hasCase: false };
  const ready: GuardState = { status: 'signedIn', hasCase: true };

  test('waits while loading or offline', () => {
    expect(guardRedirect({ status: 'loading' }, ['(tabs)'])).toBeNull();
    expect(guardRedirect({ status: 'error' }, ['onboarding', 'fall'])).toBeNull();
  });

  test('signed-out users only see the sign-in screens', () => {
    expect(guardRedirect(signedOut, ['(tabs)'])).toBe('/onboarding');
    expect(guardRedirect(signedOut, ['dokument', '[id]'])).toBe('/onboarding');
    expect(guardRedirect(signedOut, ['onboarding', 'fall'])).toBe('/onboarding');
    expect(guardRedirect(signedOut, ['onboarding'])).toBeNull();
    expect(guardRedirect(signedOut, ['onboarding', 'code'])).toBeNull();
    expect(guardRedirect(signedOut, ['onboarding', 'link'])).toBeNull();
  });

  test('signed-in users without a case finish the setup first', () => {
    expect(guardRedirect(noCase, ['(tabs)'])).toBe('/onboarding/fall');
    expect(guardRedirect(noCase, ['onboarding', 'code'])).toBe('/onboarding/fall');
    expect(guardRedirect(noCase, ['onboarding', 'fall'])).toBeNull();
    expect(guardRedirect(noCase, ['onboarding', 'einwilligung'])).toBeNull();
  });

  test('set-up users land in the tabs and leave onboarding', () => {
    expect(guardRedirect(ready, ['onboarding', 'einwilligung'])).toBe('/');
    expect(guardRedirect(ready, ['(tabs)', 'familie'])).toBeNull();
  });

  test('demo mode shows the tabs without an account', () => {
    expect(guardRedirect({ status: 'demo' }, ['(tabs)'])).toBeNull();
    expect(guardRedirect({ status: 'demo' }, ['onboarding'])).toBe('/');
  });

  test('the design system showcase is always reachable', () => {
    expect(guardRedirect(signedOut, ['designsystem'])).toBeNull();
  });
});

describe('auth errors', () => {
  test('maps Supabase Auth error codes', () => {
    expect(toAppErrorCode({ name: 'AuthApiError', code: 'otp_expired', status: 403 })).toBe('code_invalid');
    expect(toAppErrorCode({ code: 'over_email_send_rate_limit', status: 429 })).toBe('rate_limited');
    expect(toAppErrorCode({ code: 'email_address_invalid', status: 400 })).toBe('email_invalid');
    expect(toAppErrorCode({ status: 429, message: 'whatever' })).toBe('rate_limited');
  });
});
