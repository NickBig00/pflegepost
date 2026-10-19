import { Check } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { useTheme } from '../theme';
import { motion } from '../tokens';
import { Icon } from './Icon';
import { Text } from './Text';

export type StepState = 'pending' | 'active' | 'done';
export type Step = { label: string; state: StepState };

function PulseDot() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (!reduceMotion) opacity.set(withRepeat(withTiming(0.35, { duration: 900 }), -1, true));
  }, [opacity, reduceMotion]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <View className="h-7 w-7 items-center justify-center rounded-full bg-primary-soft">
      <Animated.View
        className="h-2.5 w-2.5 rounded-full"
        style={[{ backgroundColor: colors.primary }, style]}
      />
    </View>
  );
}

function Marker({ state }: { state: StepState }) {
  const { colors } = useTheme();
  if (state === 'done') {
    return (
      <Animated.View
        entering={ZoomIn.duration(motion.base)}
        className="h-7 w-7 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.primary }}
      >
        <Icon icon={Check} size={16} color="onPrimary" strokeWidth={2.5} />
      </Animated.View>
    );
  }
  if (state === 'active') return <PulseDot />;
  return <View className="h-7 w-7 rounded-full border-[1.5px] border-border-strong" />;
}

/** Honest, friendly progress while the AI works ("Ich lese den Brief…"). */
export function ProgressSteps({ steps }: { steps: Step[] }) {
  const active = steps.find((s) => s.state === 'active');
  return (
    <View className="gap-4" accessibilityLiveRegion="polite" accessibilityLabel={active?.label}>
      {steps.map((step) => (
        <Animated.View
          key={step.label}
          entering={FadeIn.duration(motion.base)}
          className="flex-row items-center gap-3.5"
        >
          <Marker state={step.state} />
          <Text
            variant={step.state === 'active' ? 'bodyStrong' : 'body'}
            tone={step.state === 'pending' ? 'subtle' : 'default'}
            className="flex-1"
          >
            {step.label}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}
