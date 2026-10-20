// Decides where the app must go for a given account state. Pure, so it is
// unit-tested; the RouteGuard component applies the result with the router.

export type GuardState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'demo' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; hasCase: boolean; pendingInvite?: string | null };

export type GuardTarget = '/' | '/onboarding' | '/onboarding/fall' | `/einladung/${string}`;

const SIGN_IN_SCREENS = new Set([undefined, 'index', 'code', 'link']);
const SETUP_SCREENS = new Set(['fall', 'einwilligung', 'beitreten']);

/** Returns the route to replace the current one with, or null to stay. */
export function guardRedirect(state: GuardState, segments: readonly string[]): GuardTarget | null {
  const [group, screen] = segments;
  // The design system showcase is a developer route and always reachable.
  if (group === 'designsystem') return null;
  const inOnboarding = group === 'onboarding';
  // Invite links: signed-out people sign in first (the token is kept as pendingInvite).
  const inInvite = group === 'einladung';

  switch (state.status) {
    case 'loading':
    case 'error':
      return null;
    case 'demo':
      return inOnboarding ? '/' : null;
    case 'signedOut':
      return inOnboarding && SIGN_IN_SCREENS.has(screen) ? null : '/onboarding';
    case 'signedIn':
      if (inInvite) return null;
      if (state.pendingInvite) return `/einladung/${state.pendingInvite}`;
      if (!state.hasCase) {
        return inOnboarding && SETUP_SCREENS.has(screen) ? null : '/onboarding/fall';
      }
      return inOnboarding ? '/' : null;
  }
}
