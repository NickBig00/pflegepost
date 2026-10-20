import { useGlobalSearchParams, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { WifiOff } from 'lucide-react-native';
import { useEffect, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDemo } from '@/demo/store';
import { guardRedirect } from '@/lib/routeGuard';
import { EmptyState } from '@/ui';

import { useAuth } from './AuthProvider';

/** Sends people to sign-in, setup or the tabs, depending on their account state. */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { guard, reload, setPendingInvite } = useAuth();
  const segments = useSegments();
  const { token } = useGlobalSearchParams<{ token?: string }>();
  const inviteToken = segments[0] === 'einladung' && typeof token === 'string' ? token : null;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const target = guardRedirect(guard, segments);

  // Keep an invite token across the sign-in; drop it once the invite screen shows.
  useEffect(() => {
    if (!inviteToken) return;
    setPendingInvite(guard.status === 'signedIn' ? null : inviteToken);
  }, [inviteToken, guard.status, setPendingInvite]);

  useEffect(() => {
    if (!target) return;
    if (router.canDismiss()) router.dismissAll();
    router.replace(target);
  }, [target, router]);

  // Keep the splash screen until we know where to go.
  useEffect(() => {
    if (guard.status !== 'loading') SplashScreen.hideAsync();
  }, [guard.status]);

  useDemoPersonalization();

  return (
    <>
      {children}
      {guard.status === 'error' ? (
        <View
          className="absolute inset-0 justify-center bg-canvas"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <EmptyState
            icon={WifiOff}
            title="Gerade keine Verbindung"
            message="Wir konnten deine Daten nicht laden. Prüf dein Internet und versuch es noch einmal."
            action={{ label: 'Noch einmal versuchen', onPress: reload }}
          />
        </View>
      ) : null}
    </>
  );
}

// Letters and tasks stay demo data until milestone 2/3; they speak about the real case.
function useDemoPersonalization() {
  const { account } = useAuth();
  const { completeOnboarding } = useDemo();
  const applied = useRef<string | null>(null);
  const careCase = account?.cases[0];

  useEffect(() => {
    if (!account || !careCase || applied.current === careCase.id) return;
    applied.current = careCase.id;
    completeOnboarding({
      firstName: account.profile.display_name ?? '',
      caseName: careCase.display_name,
      legalBasis: careCase.legal_basis,
    });
  }, [account, careCase, completeOnboarding]);
}
