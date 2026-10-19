import { router } from 'expo-router';
import { Camera, CircleCheck, Mic } from 'lucide-react-native';
import { View } from 'react-native';

import { useDemo } from '@/demo/store';
import { senderStyle } from '@/features/documents/sender';
import { TaskItem } from '@/features/tasks/TaskItem';
import { receivedLabel } from '@/lib/dates';
import { firstName, greeting } from '@/lib/greeting';
import { upcomingTasks } from '@/lib/tasks';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  HeroAction,
  Icon,
  IconTile,
  ListGroup,
  ListItem,
  Screen,
  SectionHeader,
  useToast,
  type ColorToken,
} from '@/ui';

const tileIconColor: Record<string, ColorToken> = {
  primary: 'onPrimarySoft',
  accent: 'onAccentSoft',
  ochre: 'onOchreSoft',
  info: 'onInfoSoft',
  muted: 'fgMuted',
};

export default function HomeScreen() {
  const { careCase, currentUser, tasks, documents } = useDemo();
  const toast = useToast();
  const upcoming = upcomingTasks(tasks, 3);
  const latest = [...documents].sort((a, b) => b.receivedOn.localeCompare(a.receivedOn))[0];

  // Voice notes follow in a later demo step.
  const voiceComingNext = () =>
    toast({ message: 'Sprachnotizen zeigen wir in einem späteren Schritt.', tone: 'info' });

  return (
    <Screen
      eyebrow={`Für ${careCase.displayName}`}
      title={`${greeting()}, ${firstName(currentUser.displayName)}`}
      headerAccessory={<Avatar name={currentUser.displayName} />}
    >
      <View className="gap-3">
        <HeroAction
          icon={Camera}
          title="Brief erfassen"
          subtitle="Foto oder PDF – ich erkläre ihn dir"
          onPress={() => router.push('/erfassen')}
        />
        <Button
          label="Sprachnotiz aufnehmen"
          icon={Mic}
          variant="secondary"
          size="lg"
          align="stretch"
          onPress={voiceComingNext}
        />
      </View>

      <View className="gap-3 pt-2">
        <SectionHeader
          title="Das steht an"
          action={{ label: 'Alle', onPress: () => router.navigate('/aufgaben') }}
        />
        {upcoming.length > 0 ? (
          upcoming.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <Card padding="none">
            <EmptyState
              icon={CircleCheck}
              title="Alles erledigt"
              message="Gerade steht nichts an. Wenn ein neuer Brief kommt, fotografiere ihn einfach."
            />
          </Card>
        )}
      </View>

      {latest ? (
        <View className="gap-3 pt-2">
          <SectionHeader title="Zuletzt erfasst" />
          <ListGroup>
            <ListItem
              title={latest.title}
              subtitle={`${latest.sender} · ${receivedLabel(latest.receivedOn)}`}
              leading={
                <IconTile tone={senderStyle[latest.senderType].tone}>
                  <Icon
                    icon={senderStyle[latest.senderType].icon}
                    size={20}
                    color={tileIconColor[senderStyle[latest.senderType].tone]}
                  />
                </IconTile>
              }
              onPress={() => router.navigate('/dokumente')}
              accessibilityHint="Öffnet deine Dokumente"
            />
          </ListGroup>
        </View>
      ) : null}
    </Screen>
  );
}
