import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import type { LegalBasis } from '@/demo/schemas';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { useOnboardingDraft } from '@/features/onboarding/draft';
import { Button, Chip, Text, TextField } from '@/ui';

const bases: { value: LegalBasis; label: string }[] = [
  { value: 'consent', label: 'Sie/er ist einverstanden' },
  { value: 'power_of_attorney', label: 'Ich habe eine Vorsorgevollmacht' },
  { value: 'legal_guardian', label: 'Ich bin rechtliche Betreuung' },
  { value: 'unknown', label: 'Weiß ich noch nicht' },
];

export default function CaseScreen() {
  const { draft, setDraft } = useOnboardingDraft();
  const [tried, setTried] = useState(false);
  const missingName = draft.firstName.trim() === '';
  const missingCase = draft.caseName.trim() === '';

  const next = () => {
    setTried(true);
    if (!missingName && !missingCase) router.push('/onboarding/einwilligung');
  };

  return (
    <OnboardingFrame
      step={1}
      // Signed in by now; going back to the code screen would make no sense.
      showBack={false}
      title="Für wen kümmerst du dich?"
      intro="Ein paar Angaben, damit sich deine Familie gleich zurechtfindet."
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
        label="Dein Vorname"
        placeholder="z. B. Anna"
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
        value={draft.firstName}
        onChangeText={(firstName) => setDraft({ firstName })}
        error={tried && missingName ? 'Bitte gib deinen Vornamen ein.' : undefined}
      />
      <TextField
        label="Wie nennt ihr die Person?"
        placeholder="z. B. Mama"
        helper="So erscheint der Fall in der App, z. B. „Mama“ oder „Opa Heinz“."
        value={draft.caseName}
        onChangeText={(caseName) => setDraft({ caseName })}
        error={
          tried && missingCase
            ? 'Bitte gib einen Namen ein, damit deine Familie den Fall erkennt.'
            : undefined
        }
      />
      <View className="gap-3">
        <Text variant="calloutStrong">Darfst du dich um ihre Post kümmern?</Text>
        <View className="flex-row flex-wrap gap-2">
          {bases.map((b) => (
            <Chip
              key={b.value}
              label={b.label}
              selected={draft.legalBasis === b.value}
              onPress={() => setDraft({ legalBasis: b.value })}
            />
          ))}
        </View>
        <Text variant="callout" tone="muted">
          Wir fragen das, weil es um Gesundheitsdaten geht. Du kannst es später jederzeit ändern.
        </Text>
      </View>
    </OnboardingFrame>
  );
}
