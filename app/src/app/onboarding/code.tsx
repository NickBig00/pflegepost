import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { useOnboardingDraft } from '@/features/onboarding/draft';
import { errorMessage } from '@/lib/supabase';
import { Button, CodeField, haptics, Text, useTheme, useToast } from '@/ui';

const RESEND_AFTER_S = 60;

function useSecondsLeft(since: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (since === null) return 0;
  return Math.max(0, RESEND_AFTER_S - Math.floor((now - since) / 1000));
}

export default function CodeScreen() {
  const { verifyCode, sendCode, guard } = useAuth();
  const { draft, setDraft } = useOnboardingDraft();
  const { colors } = useTheme();
  const toast = useToast();
  const input = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const secondsLeft = useSecondsLeft(draft.codeSentAt);

  // After a successful check the account loads; the route guard then moves on.
  const busy = verifying || (guard.status === 'loading' && code.length === 6 && !error);

  const verify = async (value: string) => {
    setError(undefined);
    setVerifying(true);
    try {
      await verifyCode(draft.email, value);
      haptics.success();
    } catch (e) {
      haptics.warning();
      setError(errorMessage(e));
      setCode('');
      input.current?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await sendCode(draft.email);
      setDraft({ codeSentAt: Date.now() });
      setError(undefined);
      setCode('');
      toast({ message: 'Wir haben dir einen neuen Code geschickt.' });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setResending(false);
    }
  };

  const countdown = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return (
    <OnboardingFrame
      step={0}
      showBack
      title="Schau in dein Postfach."
      intro={`Wir haben dir einen Code an ${draft.email} geschickt.`}
      footer={
        <>
          <Button
            label={secondsLeft > 0 ? `Neuen Code schicken (${countdown})` : 'Neuen Code schicken'}
            variant="secondary"
            align="stretch"
            disabled={secondsLeft > 0 || busy}
            loading={resending}
            onPress={resend}
          />
          <Button
            label="Andere E-Mail-Adresse"
            variant="ghost"
            align="center"
            disabled={busy}
            onPress={() => router.back()}
          />
        </>
      }
    >
      <View className="gap-3">
        <CodeField
          ref={input}
          value={code}
          onChangeText={(value) => {
            setCode(value);
            if (error && value) setError(undefined);
          }}
          onComplete={verify}
          invalid={Boolean(error)}
          disabled={busy}
          autoFocus
        />
        <View className="min-h-[48px] justify-center" accessibilityLiveRegion="polite">
          {busy ? (
            <View className="flex-row items-center justify-center gap-2">
              <ActivityIndicator color={colors.primary} />
              <Text variant="callout" tone="muted">
                Ich melde dich an …
              </Text>
            </View>
          ) : error ? (
            <Text variant="callout" tone="accent" className="text-center">
              {error}
            </Text>
          ) : (
            <Text variant="callout" tone="muted" className="text-center">
              Oder tipp in der E-Mail auf „In der App anmelden“.
            </Text>
          )}
        </View>
      </View>
    </OnboardingFrame>
  );
}
