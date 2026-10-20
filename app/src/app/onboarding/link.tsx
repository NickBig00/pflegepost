import { router } from 'expo-router';
import { MailWarning } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { Button, EmptyState, Text, useTheme } from '@/ui';

/** Target of the sign-in link in the e-mail. The route guard moves on once signed in. */
export default function SignInLinkScreen() {
  const { linkFailed } = useAuth();
  const { colors } = useTheme();

  if (linkFailed) {
    return (
      <View className="flex-1 justify-center bg-canvas">
        <EmptyState
          icon={MailWarning}
          title="Der Link hat nicht geklappt."
          message="Er ist vielleicht abgelaufen oder wurde schon benutzt. Lass dir einfach einen neuen Code schicken."
        />
        <View className="w-full max-w-[400px] self-center px-6">
          <Button
            label="Neuen Code anfordern"
            size="lg"
            align="stretch"
            onPress={() => router.replace('/onboarding')}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-canvas" accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.primary} size="large" />
      <Text variant="body" tone="muted">
        Ich melde dich an …
      </Text>
    </View>
  );
}
