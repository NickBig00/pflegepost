// Parses the URL the sign-in link in the e-mail redirects to, e.g.
// pflegepost://onboarding/link#access_token=…&refresh_token=…
// or …#error=access_denied&error_code=otp_expired&error_description=…

export type AuthCallback = { type: 'session'; accessToken: string; refreshToken: string } | { type: 'error' };

export function parseAuthCallback(url: string | null | undefined): AuthCallback | null {
  if (!url) return null;
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const params = new URLSearchParams();
  // Tokens arrive in the fragment; errors may come in the query or the fragment.
  if (queryIndex !== -1) {
    const end = hashIndex > queryIndex ? hashIndex : url.length;
    new URLSearchParams(url.slice(queryIndex + 1, end)).forEach((v, k) => params.set(k, v));
  }
  if (hashIndex !== -1) {
    new URLSearchParams(url.slice(hashIndex + 1)).forEach((v, k) => params.set(k, v));
  }
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) return { type: 'session', accessToken, refreshToken };
  if (params.has('error') || params.has('error_code')) return { type: 'error' };
  return null;
}
