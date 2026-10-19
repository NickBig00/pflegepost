import { router } from 'expo-router';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { View } from 'react-native';

import { useDemo } from '@/demo/store';
import { LetterThumbnail } from '@/features/capture/LetterThumbnail';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { Button, Chip, Text } from '@/ui';

const promises = [
  ['Fotografieren', 'Brief abfotografieren oder als PDF hinzufügen.'],
  ['Verstehen', 'Ich erkläre ihn dir in einfachen Worten – mit allen Fristen.'],
  ['Gemeinsam erledigen', 'Aufgaben in der Familie fair aufteilen.'],
] as const;

export default function WelcomeScreen() {
  const { completeOnboarding } = useDemo();
  return (
    <OnboardingFrame
      step={0}
      title="Die Post für deine Eltern – gemeinsam im Griff."
      footer={
        <>
          <Button
            label="Los geht’s"
            icon={ArrowRight}
            iconPosition="trailing"
            size="lg"
            align="stretch"
            onPress={() => router.push('/onboarding/fall')}
          />
          <Button
            label="Erst mal nur umschauen"
            variant="ghost"
            align="center"
            onPress={() => {
              completeOnboarding();
              router.replace('/');
            }}
          />
        </>
      }
    >
      <View className="items-center py-2">
        <View style={{ transform: [{ rotate: '-4deg' }] }}>
          <LetterThumbnail width={140} />
        </View>
        <View className="-mt-5">
          <Chip label="Frist in 26 Tagen erkannt" icon={Sparkles} tone="primary" />
        </View>
      </View>
      <View className="gap-4">
        {promises.map(([title, text], i) => (
          <View key={title} className="flex-row gap-3.5">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-primary-soft">
              <Text variant="calloutStrong" tone="onPrimarySoft">
                {i + 1}
              </Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="bodyStrong">{title}</Text>
              <Text variant="callout" tone="muted">
                {text}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </OnboardingFrame>
  );
}
