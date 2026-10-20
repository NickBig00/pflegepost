import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { parseAuthCallback } from '@/lib/authCallback';
import type { GuardState } from '@/lib/routeGuard';
import { getSupabase } from '@/lib/supabase';
import { completeSetup, loadAccount, type Account, type CaseSetup } from '@/lib/supabase/account';

type AuthState = {
  guard: GuardState;
  account: Account | null;
  email: string | null;
  /** True after a sign-in link failed (expired or already used). */
  linkFailed: boolean;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  setUpCase: (setup: CaseSetup) => Promise<void>;
  reload: () => void;
  signOut: () => Promise<void>;
  enterDemo: () => void;
  leaveDemo: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

/** Result of loading the account for one user; stale results are ignored. */
type AccountLoad = { userId: string; key: number; result: Account | 'error' };

/** Session (Supabase Auth), the signed-in user's account data and demo mode. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabase();
  // undefined = still reading the stored session.
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [load, setLoad] = useState<AccountLoad | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [demo, setDemo] = useState(false);
  const [linkFailed, setLinkFailed] = useState(false);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    // INITIAL_SESSION delivers the stored session; later events follow sign-in/out and refreshes.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  // Sign-in link from the e-mail (opens the app with tokens in the URL fragment).
  useEffect(() => {
    const handled = new Set<string>();
    const handle = (url: string | null) => {
      if (!url || handled.has(url)) return;
      handled.add(url);
      const callback = parseAuthCallback(url);
      if (!callback) return;
      if (callback.type === 'error') {
        setLinkFailed(true);
        return;
      }
      supabase.auth
        .setSession({ access_token: callback.accessToken, refresh_token: callback.refreshToken })
        .then(({ error }) => setLinkFailed(Boolean(error)));
    };
    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', (event) => handle(event.url));
    return () => sub.remove();
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    loadAccount(supabase, userId).then(
      (account) => !cancelled && setLoad({ userId, key: reloadKey, result: account }),
      () => !cancelled && setLoad({ userId, key: reloadKey, result: 'error' }),
    );
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, reloadKey]);

  const sendCode = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: Linking.createURL('/onboarding/link') },
      });
      if (error) throw error;
      setLinkFailed(false);
    },
    [supabase],
  );

  const verifyCode = useCallback(
    async (email: string, code: string) => {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
      if (error) throw error;
    },
    [supabase],
  );

  const setUpCase = useCallback(
    async (setup: CaseSetup) => {
      if (!userId) throw new Error('not_authenticated');
      await completeSetup(supabase, userId, setup);
      const account = await loadAccount(supabase, userId);
      setLoad({ userId, key: reloadKey, result: account });
    },
    [supabase, userId, reloadKey],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const value = useMemo<AuthState>(() => {
    const current = load && load.userId === userId && load.key === reloadKey ? load.result : null;
    const account = current && current !== 'error' ? current : null;
    let guard: GuardState;
    if (session === undefined) guard = { status: 'loading' };
    else if (!session) guard = demo ? { status: 'demo' } : { status: 'signedOut' };
    else if (account) guard = { status: 'signedIn', hasCase: account.cases.length > 0 };
    else if (current === 'error') guard = { status: 'error' };
    else guard = { status: 'loading' };
    return {
      guard,
      account,
      email: session?.user.email ?? null,
      linkFailed,
      sendCode,
      verifyCode,
      setUpCase,
      reload: () => setReloadKey((k) => k + 1),
      signOut,
      enterDemo: () => setDemo(true),
      leaveDemo: () => setDemo(false),
    };
  }, [session, userId, reloadKey, demo, load, linkFailed, sendCode, verifyCode, setUpCase, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const state = useContext(AuthContext);
  if (!state) throw new Error('useAuth must be used inside AuthProvider');
  return state;
}
