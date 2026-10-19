import { router } from 'expo-router';
import { Check, Lock, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { useDemo } from '@/demo/store';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { useOnboardingDraft } from '@/features/onboarding/draft';
import { Button, Card, CheckRow, Icon, Text, useToast } from '@/ui';

const points = [
  { icon: MapPin, text: 'Deine Daten liegen auf Servern in Deutschland (Frankfurt).' },
  { icon: Lock, text: 'Alles ist verschlüsselt – bei der Übertragung und beim Speichern.' },
  { icon: Users, text: 'Nur Menschen, die du einlädst, sehen den Fall.' },
  { icon: Sparkles, text: 'Die KI macht Vorschläge. Entscheiden und verschicken tust immer du.' },
  {
    icon: ShieldCheck,
    text: 'Keine Rechts- oder Medizinberatung – bei Fragen verweisen wir an Fachstellen.',
  },
];

export default function ConsentScreen() {
  const { draft } = useOnboardingDraft();
  const { completeOnboarding } = useDemo();
  const toast = useToast();
  const [agreed, setAgreed] = useState(false);
  const person = draft.caseName.trim() || 'die Person';

  const finish = () => {
    completeOnboarding({
      firstName: draft.firstName.trim(),
      caseName: draft.caseName.trim(),
      legalBasis: draft.legalBasis,
    });
    router.dismissAll();
    router.replace('/');
    toast({ message: `Willkommen, ${draft.firstName.trim()}. Schön, dass du da bist.` });
  };

  return (
    <OnboardingFrame
      step={2}
      title="Deine Daten sind bei uns sicher."
      intro="Es geht um Gesundheit und Familie. Deshalb ist uns das besonders wichtig."
      footer={
        <Button
          label="Einverstanden, los geht’s"
          icon={Check}
          size="lg"
          align="stretch"
          disabled={!agreed}
          onPress={finish}
          accessibilityHint={agreed ? undefined : 'Bitte zuerst die Einwilligung ankreuzen'}
        />
      }
    >
      <View className="gap-4">
        {points.map((p) => (
          <View key={p.text} className="flex-row gap-3.5">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
              <Icon icon={p.icon} size={18} color="onPrimarySoft" />
            </View>
            <Text variant="body" className="flex-1 pt-1">
              {p.text}
            </Text>
          </View>
        ))}
      </View>
      <Card tone="muted">
        <CheckRow
          label={`Ich bin einverstanden, dass Pflegepost Gesundheitsdaten von ${person} verarbeitet, um Briefe zu erklären und Aufgaben zu organisieren.`}
          description="Du kannst das jederzeit in den Einstellungen widerrufen."
          checked={agreed}
          onToggle={() => setAgreed((a) => !a)}
        />
      </Card>
      <Button
        label="Datenschutzerklärung lesen"
        variant="ghost"
        size="sm"
        className="-ml-3.5"
        onPress={() => toast({ message: 'Die Datenschutzerklärung folgt vor dem Start.', tone: 'info' })}
      />
    </OnboardingFrame>
  );
}
