import { Stack } from 'expo-router';

import { OnboardingDraftProvider } from '@/features/onboarding/draft';
import { useTheme } from '@/ui';

export default function OnboardingLayout() {
  const { colors } = useTheme();
  return (
    <OnboardingDraftProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} />
    </OnboardingDraftProvider>
  );
}
