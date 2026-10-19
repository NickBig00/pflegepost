import { Stack } from 'expo-router';

import { CaptureProvider } from '@/features/capture/CaptureContext';
import { useTheme } from '@/ui';

export default function CaptureLayout() {
  const { colors } = useTheme();
  return (
    <CaptureProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
        <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: colors.camera } }} />
        <Stack.Screen name="analyse" options={{ animation: 'fade' }} />
        <Stack.Screen name="ergebnis" options={{ animation: 'fade' }} />
        <Stack.Screen name="original" options={{ presentation: 'modal' }} />
      </Stack>
    </CaptureProvider>
  );
}
