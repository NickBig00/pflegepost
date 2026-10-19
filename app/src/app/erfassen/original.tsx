import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCapture } from '@/features/capture/CaptureContext';
import { LetterPaper } from '@/features/capture/LetterPaper';
import { IconButton, Text } from '@/ui';

export default function OriginalScreen() {
  const insets = useSafeAreaInsets();
  const { letter, analysis } = useCapture();

  return (
    <View className="flex-1 bg-canvas">
      <View
        className="w-full max-w-[640px] flex-row items-center justify-between self-center px-5 pb-3"
        style={{ paddingTop: Math.max(insets.top, 12) + 8 }}
      >
        <View className="gap-0.5">
          <Text variant="title3">Original</Text>
          <Text variant="caption" tone="subtle">
            Seite 1 von {analysis.pageCount} · Frist markiert
          </Text>
        </View>
        <IconButton icon={X} accessibilityLabel="Schließen" onPress={() => router.back()} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View className="w-full max-w-[640px] self-center px-5 pt-2">
          <LetterPaper letter={letter} highlight={analysis.deadline?.sourceQuote} />
        </View>
      </ScrollView>
    </View>
  );
}
