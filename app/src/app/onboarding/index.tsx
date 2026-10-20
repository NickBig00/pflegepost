import { router } from 'expo-router';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { z } from 'zod';

import { LetterThumbnail } from '@/features/capture/LetterThumbnail';
import { useAuth } from '@/features/auth/AuthProvider';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { useOnboardingDraft } from '@/features/onboarding/draft';
import { useKeyboardVisible } from '@/features/onboarding/useKeyboardVisible';
import { errorMessage } from '@/lib/supabase';
import { Button, Chip, TextField } from '@/ui';

const emailSchema = z.email();

export default function WelcomeScreen() {
  const { sendCode, enterDemo } = useAuth();
  const { draft, setDraft } = useOnboardingDraft();
  const keyboardVisible = useKeyboardVisible();
  // On small phones (iPhone SE) the helper text must stay visible without scrolling.
  const compact = useWindowDimensions().height < 720;
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const email = draft.email.trim().toLowerCase();
    if (!emailSchema.safeParse(email).success) {
      setError(email ? 'Bitte prüf die E-Mail-Adresse.' : 'Bitte gib deine E-Mail-Adresse ein.');
      return;
    }
    setError(undefined);
    setSending(true);
    try {
      await sendCode(email);
      setDraft({ email, codeSentAt: Date.now() });
      router.push('/onboarding/code');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <OnboardingFrame
      step={0}
      title="Die Post für deine Eltern – gemeinsam im Griff."
      footer={
        <>
          <Button
            label="Code schicken"
            icon={ArrowRight}
            iconPosition="trailing"
            size="lg"
            align="stretch"
            loading={sending}
            onPress={submit}
          />
          <Button
            label="Erst mal nur umschauen"
            variant="ghost"
            align="center"
            disabled={sending}
            onPress={enterDemo}
          />
        </>
      }
    >
      {keyboardVisible ? null : (
        <View
          className={`items-center ${compact ? '' : 'py-2'}`}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={{ transform: [{ rotate: '-4deg' }] }}>
            <LetterThumbnail width={compact ? 84 : 120} />
          </View>
          <View className="-mt-5">
            <Chip label="Frist in 26 Tagen erkannt" icon={Sparkles} tone="primary" />
          </View>
        </View>
      )}
      <TextField
        label="Deine E-Mail-Adresse"
        placeholder="name@beispiel.de"
        helper="Wir schicken dir einen Code – ein Passwort brauchst du nicht."
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        value={draft.email}
        onChangeText={(email) => {
          setDraft({ email });
          if (error) setError(undefined);
        }}
        onSubmitEditing={submit}
        editable={!sending}
        error={error}
      />
    </OnboardingFrame>
  );
}
