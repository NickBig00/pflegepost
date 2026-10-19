import { router } from 'expo-router';
import { Camera, FileText } from 'lucide-react-native';
import { View } from 'react-native';

import type { CareDocument } from '@/demo/schemas';
import { useDemo } from '@/demo/store';
import { SenderTile } from '@/features/documents/SenderTile';
import { parseDay, receivedLabel } from '@/lib/dates';
import { Card, Chip, EmptyState, ListGroup, ListItem, Screen, Text } from '@/ui';

const monthFormat = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });

function byMonth(documents: CareDocument[]) {
  const sorted = [...documents].sort((a, b) => b.receivedOn.localeCompare(a.receivedOn));
  const groups = new Map<string, CareDocument[]>();
  for (const d of sorted) {
    const key = monthFormat.format(parseDay(d.receivedOn));
    groups.set(key, [...(groups.get(key) ?? []), d]);
  }
  return [...groups.entries()];
}

export default function DocumentsScreen() {
  const { careCase, documents, tasks } = useDemo();

  return (
    <Screen eyebrow={`Für ${careCase.displayName}`} title="Dokumente">
      {documents.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={FileText}
            title="Noch keine Briefe"
            message="Fotografiere den ersten Brief – ich erkläre ihn dir und lege ihn hier ab."
            action={{ label: 'Brief erfassen', icon: Camera, onPress: () => router.push('/erfassen') }}
          />
        </Card>
      ) : (
        byMonth(documents).map(([month, docs]) => (
          <View key={month} className="gap-3">
            <Text variant="eyebrow" tone="subtle">
              {month}
            </Text>
            <ListGroup>
              {docs.map((d) => {
                const open = tasks.filter((t) => t.documentId === d.id && t.status !== 'done').length;
                return (
                  <ListItem
                    key={d.id}
                    title={d.title}
                    subtitle={`${d.sender} · ${receivedLabel(d.receivedOn)}`}
                    leading={<SenderTile senderType={d.senderType} />}
                    trailing={open > 0 ? <Chip label={`${open} offen`} tone="ochre" /> : undefined}
                    onPress={() => router.push({ pathname: '/dokument/[id]', params: { id: d.id } })}
                  />
                );
              })}
            </ListGroup>
          </View>
        ))
      )}
    </Screen>
  );
}
