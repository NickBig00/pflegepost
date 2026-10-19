import { ListChecks } from 'lucide-react-native';

import { Card, EmptyState, Screen } from '@/ui';

// Placeholder until this view is built in the next demo steps.
export default function AufgabenScreen() {
  return (
    <Screen eyebrow="Für Mama" title="Aufgaben">
      <Card padding="none">
        <EmptyState
          icon={ListChecks}
          title="Kommt als Nächstes"
          message="Diese Ansicht bauen wir in einem der nächsten Schritte der Demo."
        />
      </Card>
    </Screen>
  );
}
