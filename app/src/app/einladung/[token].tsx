import { router, useLocalSearchParams } from 'expo-router';
import { Check, Link2Off, WifiOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, useWindowDimensions, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import {
  errorMessage,
  getSupabase,
  inviteTokenSchema,
  toAppErrorCode,
  type AppErrorCode,
  type InvitePreview,
} from '@/lib/supabase';
import { joinCase, previewInvite } from '@/lib/supabase/family';
import { Button, Card, CheckRow, EmptyState, Text, TextField, useTheme, useToast } from '@/ui';

type Loaded = { token: string; key: number; result: InvitePreview | AppErrorCode };

const failureTitle: Partial<Record<AppErrorCode, string>> = {
  invite_used: 'Dieser Link wurde schon benutzt.',
  invite_expired: 'Dieser Link ist abgelaufen.',
  network: 'Gerade keine Verbindung',
};

/** "Anna lädt dich zu „Mama“ ein": first name and consent if missing, then join. */
export default function InviteScreen() {
  const { token: rawToken } = useLocalSearchParams<{ token: string }>();
  const parsed = inviteTokenSchema.safeParse(rawToken);
  const token = parsed.success ? parsed.data : null;
  const { account, userId, refreshAccount } = useAuth();
  const { colors } = useTheme();
  const toast = useToast();
  // Small phones: drop the intro so the consent checkbox is visible without scrolling.
  const compact = useWindowDimensions().height < 720;

  const [key, setKey] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [firstName, setFirstName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string>();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    previewInvite(getSupabase(), token).then(
      (preview) => !cancelled && setLoaded({ token, key, result: preview }),
      (e) => !cancelled && setLoaded({ token, key, result: toAppErrorCode(e) }),
    );
    return () => {
      cancelled = true;
    };
  }, [token, key]);

  const needsName = !account?.profile.display_name;
  const needsConsent = !account?.hasConsent;
  const leave = () => router.replace(account && account.cases.length > 0 ? '/' : '/onboarding/fall');

  const result: InvitePreview | AppErrorCode | null = !token
    ? 'invite_invalid'
    : loaded && loaded.token === token && loaded.key === key
      ? loaded.result
      : null;

  if (result === null) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-canvas" accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.primary} size="large" />
        <Text variant="body" tone="muted">
          Ich schaue mir die Einladung an …
        </Text>
      </View>
    );
  }

  if (typeof result === 'string') {
    const offline = result === 'network';
    return (
      <View className="flex-1 justify-center bg-canvas">
        <EmptyState
          icon={offline ? WifiOff : Link2Off}
          title={failureTitle[result] ?? 'Dieser Link funktioniert nicht.'}
          message={
            offline
              ? 'Die Einladung lässt sich gerade nicht laden. Versuch es gleich noch einmal.'
              : 'Frag am besten nach einem neuen Link – Einladungen gelten 7 Tage und nur einmal.'
          }
        />
        <View className="w-full max-w-[400px] gap-2 self-center px-6">
          {offline ? (
            <Button
              label="Noch einmal versuchen"
              size="lg"
              align="stretch"
              onPress={() => setKey((k) => k + 1)}
            />
          ) : null}
          <Button
            label="Weiter zur App"
            variant={offline ? 'ghost' : 'primary'}
            size={offline ? 'md' : 'lg'}
            align={offline ? 'center' : 'stretch'}
            onPress={leave}
          />
        </View>
      </View>
    );
  }

  const preview = result;
  const join = async () => {
    setTried(true);
    if ((needsName && !firstName.trim()) || (needsConsent && !agreed) || !token || !userId) return;
    setError(undefined);
    setJoining(true);
    try {
      await joinCase(getSupabase(), userId, {
        token,
        firstName: needsName ? firstName : null,
        consent: needsConsent,
      });
      await refreshAccount();
      if (router.canDismiss()) router.dismissAll();
      router.replace('/');
      toast({ message: `Willkommen! Du bist jetzt bei „${preview.case_name}“ dabei.` });
    } catch (e) {
      setError(errorMessage(e));
      setJoining(false);
    }
  };

  return (
    <OnboardingFrame
      step={0}
      showProgress={false}
      title={
        preview.inviter_name
          ? `${preview.inviter_name} lädt dich zu „${preview.case_name}“ ein.`
          : `Du wurdest zu „${preview.case_name}“ eingeladen.`
      }
      intro={
        compact && (needsName || needsConsent)
          ? undefined
          : preview.role === 'viewer'
            ? 'Du kannst alles mitlesen, was die Familie erfasst. Ändern können die anderen.'
            : 'Ihr kümmert euch gemeinsam um die Post. Du kannst Briefe ansehen und Aufgaben übernehmen.'
      }
      footer={
        <>
          <Button
            label="Beitreten"
            icon={Check}
            size="lg"
            align="stretch"
            loading={joining}
            disabled={needsConsent && !agreed}
            onPress={join}
            accessibilityHint={
              needsConsent && !agreed ? 'Bitte zuerst die Einwilligung ankreuzen' : undefined
            }
          />
          <Button label="Nicht jetzt" variant="ghost" align="center" disabled={joining} onPress={leave} />
        </>
      }
    >
      {needsName ? (
        <TextField
          label="Dein Vorname"
          placeholder="z. B. Thomas"
          helper="So sieht dich deine Familie in der App."
          autoComplete="given-name"
          textContentType="givenName"
          value={firstName}
          onChangeText={setFirstName}
          error={tried && !firstName.trim() ? 'Bitte gib deinen Vornamen ein.' : undefined}
        />
      ) : null}
      {needsConsent ? (
        <Card tone="muted">
          <CheckRow
            label={`Ich bin einverstanden, dass Pflegepost Gesundheitsdaten von ${preview.case_name} verarbeitet, um Briefe zu erklären und Aufgaben zu organisieren.`}
            description="Verschlüsselt gespeichert in Frankfurt, nur für eingeladene Menschen sichtbar. Jederzeit widerrufbar."
            checked={agreed}
            onToggle={() => setAgreed((a) => !a)}
          />
        </Card>
      ) : null}
      {error ? (
        <Text variant="callout" tone="accent" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </OnboardingFrame>
  );
}
