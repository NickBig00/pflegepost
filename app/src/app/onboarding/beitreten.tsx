import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';

import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { extractInviteToken } from '@/lib/invite';
import { Button, TextField } from '@/ui';

/** Fallback while invite links are not tappable in every messenger: paste the link or message. */
export default function PasteInviteScreen() {
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();

  const next = () => {
    const token = extractInviteToken(text);
    if (!token) {
      setError(
        text.trim()
          ? 'Das sieht nicht nach einem Einladungslink aus. Kopier am besten die ganze Nachricht hier hinein.'
          : 'Bitte füg den Link aus der Nachricht ein.',
      );
      return;
    }
    router.push(`/einladung/${token}`);
  };

  return (
    <OnboardingFrame
      step={1}
      showBack
      showProgress={false}
      title="Du wurdest eingeladen?"
      intro="Füg den Link aus der Nachricht hier ein – oder einfach die ganze Nachricht."
      footer={
        <Button
          label="Weiter"
          icon={ArrowRight}
          iconPosition="trailing"
          size="lg"
          align="stretch"
          onPress={next}
        />
      }
    >
      <TextField
        label="Einladungslink"
        placeholder="pflegepost://einladung/…"
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        value={text}
        onChangeText={(value) => {
          setText(value);
          if (error) setError(undefined);
        }}
        error={error}
      />
    </OnboardingFrame>
  );
}
