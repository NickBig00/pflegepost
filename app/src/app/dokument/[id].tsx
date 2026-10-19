import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, FileQuestion, FileText } from 'lucide-react-native';
import { View } from 'react-native';

import { useDemo } from '@/demo/store';
import { TaskItem } from '@/features/tasks/TaskItem';
import { formatLongDate } from '@/lib/dates';
import { AiNotice, Button, Card, EmptyState, IconButton, Screen, Text } from '@/ui';

export default function DocumentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { documentById, originalById, tasks } = useDemo();
  const doc = documentById(id ?? null);

  const back = <IconButton icon={ChevronLeft} accessibilityLabel="Zurück" onPress={() => router.back()} />;

  if (!doc) {
    return (
      <Screen title="Dokument" headerAccessory={back}>
        <Card padding="none">
          <EmptyState
            icon={FileQuestion}
            title="Dokument nicht gefunden"
            message="Vielleicht wurde es entfernt. Alle Briefe findest du unter „Dokumente“."
          />
        </Card>
      </Screen>
    );
  }

  const related = tasks.filter((t) => t.documentId === doc.id);
  const open = related.filter((t) => t.status !== 'done');
  const done = related.filter((t) => t.status === 'done');

  return (
    <Screen eyebrow={doc.sender} title={doc.title} headerAccessory={back}>
      <View className="-mt-3 gap-1">
        <Text variant="callout" tone="muted">
          Eingegangen am {formatLongDate(doc.receivedOn)}
        </Text>
        {originalById(doc.id) ? (
          <Button
            label="Original ansehen"
            icon={FileText}
            variant="ghost"
            size="sm"
            className="-ml-3.5"
            onPress={() => router.push({ pathname: '/original/[id]', params: { id: doc.id } })}
          />
        ) : null}
      </View>

      <Card tone="primary">
        <View className="gap-3">
          <Text variant="eyebrow" tone="onPrimarySoft">
            Worum geht es?
          </Text>
          <Text variant="body" tone="onPrimarySoft">
            {doc.summaryPlain}
          </Text>
          <AiNotice />
        </View>
      </Card>

      <View className="gap-3">
        <Text variant="title3">Aufgaben aus diesem Brief</Text>
        {related.length === 0 ? (
          <Text variant="callout" tone="muted">
            Zu diesem Brief ist nichts zu tun. Er ist hier sicher abgelegt.
          </Text>
        ) : (
          [...open, ...done].map((t) => <TaskItem key={t.id} task={t} withDoneToggle />)
        )}
      </View>
    </Screen>
  );
}
