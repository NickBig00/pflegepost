import '@/global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DemoProvider } from '@/demo/store';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { RouteGuard } from '@/features/auth/RouteGuard';
import { ThemeProvider, ToastProvider, useTheme } from '@/ui';

SplashScreen.preventAutoHideAsync();

function Navigator() {
  const { scheme, colors } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RouteGuard>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
          <Stack.Screen
            name="erfassen"
            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="original/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="rueckblick" options={{ presentation: 'modal' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        </Stack>
      </RouteGuard>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // The splash screen hides in RouteGuard once fonts and the session are ready.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <DemoProvider>
          <AuthProvider>
            <ToastProvider>
              <Navigator />
            </ToastProvider>
          </AuthProvider>
        </DemoProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
