import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, StepDots, Text } from '@/ui';

/** Shared frame for the three onboarding steps: dots, title, body, one main action. */
export function OnboardingFrame({
  step,
  title,
  intro,
  children,
  footer,
  showBack = step > 0,
  showProgress = true,
}: {
  step: number;
  /** Step dots; hidden on screens outside the three onboarding steps. */
  showProgress?: boolean;
  /** Back arrow; defaults to every step but the first. */
  showBack?: boolean;
  title: string;
  intro?: string;
  children?: ReactNode;
  footer: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        className="w-full max-w-[560px] flex-row items-center justify-between self-center px-5"
        style={{ paddingTop: insets.top + 8, minHeight: insets.top + 52 }}
      >
        {showBack ? (
          <IconButton icon={ChevronLeft} accessibilityLabel="Zurück" onPress={() => router.back()} />
        ) : (
          <View className="w-11" />
        )}
        {showProgress ? <StepDots count={3} active={step} /> : null}
        <View className="w-11" />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full max-w-[560px] flex-1 gap-6 self-center px-6 pt-6">
          <View className="gap-3">
            <Text variant="display">{title}</Text>
            {intro ? (
              <Text variant="body" tone="muted">
                {intro}
              </Text>
            ) : null}
          </View>
          {children}
        </View>
      </ScrollView>
      <View
        className="w-full max-w-[560px] gap-2 self-center px-6 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        {footer}
      </View>
    </KeyboardAvoidingView>
  );
}
