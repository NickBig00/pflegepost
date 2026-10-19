import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDemo } from '@/demo/store';
import { LetterPaper } from '@/features/capture/LetterPaper';
import { IconButton, Text } from '@/ui';

export default function StoredOriginalScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { originalById, documentById } = useDemo();
  const original = id ? originalById(id) : undefined;
  const doc = documentById(id ?? null);

  return (
    <View className="flex-1 bg-canvas">
      <View
        className="w-full max-w-[640px] flex-row items-center justify-between self-center px-5 pb-3"
        style={{ paddingTop: Math.max(insets.top, 12) + 8 }}
      >
        <View className="flex-1 gap-0.5">
          <Text variant="title3">Original</Text>
          <Text variant="caption" tone="subtle" numberOfLines={1}>
            {doc ? `${doc.sender} · ${doc.title}` : 'Dokument'}
            {original?.highlight ? ' · Frist markiert' : ''}
          </Text>
        </View>
        <IconButton icon={X} accessibilityLabel="Schließen" onPress={() => router.back()} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View className="w-full max-w-[640px] self-center px-5 pt-2">
          {original ? (
            <LetterPaper letter={original.letter} highlight={original.highlight} />
          ) : (
            <Text variant="body" tone="muted">
              Für dieses Dokument gibt es kein gespeichertes Original.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
