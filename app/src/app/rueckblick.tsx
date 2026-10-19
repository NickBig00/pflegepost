import { router } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDemo } from '@/demo/store';
import { deadlineLabel } from '@/lib/dates';
import { weeklyReview } from '@/lib/review';
import { Icon, IconButton, Text } from '@/ui';

// The weekly review reads like a short, appreciative letter (DESIGN.md).

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export default function WeeklyReviewScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, careCase, currentUser } = useDemo();
  const review = weeklyReview(tasks, careCase.members, currentUser.id, careCase.displayName);

  return (
    <View className="flex-1 bg-canvas">
      <View
        className="w-full max-w-[640px] flex-row items-center justify-between self-center px-5 pb-2"
        style={{ paddingTop: Math.max(insets.top, 12) + 8 }}
      >
        <Text variant="eyebrow" tone="subtle">
          Euer Wochenrückblick
        </Text>
        <IconButton icon={X} accessibilityLabel="Schließen" onPress={() => router.back()} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View className="w-full max-w-[560px] gap-6 self-center px-6 pt-4">
          <Text variant="title1">{review.greeting}</Text>
          <Text variant="body">{review.intro}</Text>

          {review.done.length > 0 ? (
            <View className="gap-3">
              {review.done.map((d) => (
                <View key={d.title} className="flex-row gap-3">
                  <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-primary-soft">
                    <Icon icon={Check} size={14} color="onPrimarySoft" strokeWidth={2.75} />
                  </View>
                  <Text variant="body" className="flex-1">
                    {d.title}
                    <Text variant="body" tone="muted">
                      {' '}
                      · {d.by}
                    </Text>
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {review.next.length > 0 ? (
            <Text variant="body">
              Als Nächstes steht an:{' '}
              {review.next
                .map((t) => `${t.title}${t.dueDate ? ` (${lowerFirst(deadlineLabel(t.dueDate))})` : ''}`)
                .join(' und ')}
              . Ihr müsst das nicht allein schaffen – teilt euch auf, was geht.
            </Text>
          ) : null}

          <Text variant="body">{review.closing}</Text>
          <Text variant="bodyStrong" tone="primary">
            Deine Pflegepost
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
