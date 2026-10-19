import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LetterThumbnail } from '@/features/capture/LetterThumbnail';
import { Button, haptics, ProgressSteps, Text, useTheme, type Step } from '@/ui';

// Simulated analysis with honest intermediate steps. In milestone 2 the
// steps follow the real progress of the analyze-document function.

const STEP_LABELS = [
  'Ich lese den Brief…',
  'Ich suche nach Fristen…',
  'Ich erkläre ihn dir in einfachen Worten…',
];
const STEP_MS = 1300;
const THUMB = 150;

function ScanLine() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    if (!reduceMotion) {
      y.set(
        withRepeat(
          withTiming(THUMB * 1.414 - 6, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
          -1,
          true,
        ),
      );
    }
  }, [y, reduceMotion]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  if (reduceMotion) return null;
  return (
    <Animated.View
      pointerEvents="none"
      className="absolute inset-x-0 top-0 h-1.5 rounded-full"
      style={[{ backgroundColor: colors.primary, opacity: 0.45 }, style]}
    />
  );
}

export default function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active < STEP_LABELS.length) {
      const t = setTimeout(() => {
        haptics.select();
        setActive((a) => a + 1);
      }, STEP_MS);
      return () => clearTimeout(t);
    }
    haptics.success();
    const t = setTimeout(() => router.replace('/erfassen/ergebnis'), 450);
    return () => clearTimeout(t);
  }, [active]);

  const steps: Step[] = STEP_LABELS.map((label, i) => ({
    label,
    state: i < active ? 'done' : i === active ? 'active' : 'pending',
  }));

  return (
    <View
      className="flex-1 bg-canvas px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 16) + 8 }}
    >
      <View className="flex-1 items-center justify-center gap-10">
        <View>
          <LetterThumbnail width={THUMB} />
          <ScanLine />
        </View>
        <View className="w-full max-w-[360px] gap-6">
          <View className="gap-1.5">
            <Text variant="title2">Einen Moment…</Text>
            <Text variant="callout" tone="muted">
              Ich schaue mir den Brief genau an. Das dauert nur ein paar Sekunden.
            </Text>
          </View>
          <ProgressSteps steps={steps} />
        </View>
      </View>
      <Button label="Abbrechen" variant="ghost" align="center" onPress={() => router.dismissTo('/')} />
    </View>
  );
}
