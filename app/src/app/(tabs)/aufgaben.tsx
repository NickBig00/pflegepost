import { CircleCheck, HandHelping, ListChecks, PartyPopper } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { useDemo } from '@/demo/store';
import { TaskItem } from '@/features/tasks/TaskItem';
import { filterTasks, groupByDue, type TaskFilter } from '@/lib/tasks';
import { Card, Chip, EmptyState, motion, Screen, Text } from '@/ui';

const filters: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'mine', label: 'Meine' },
  { value: 'open', label: 'Noch offen' },
  { value: 'done', label: 'Erledigt' },
];

const empty = {
  all: {
    icon: PartyPopper,
    title: 'Alles erledigt',
    message: 'Gerade steht nichts an. Genieß die ruhige Zeit.',
  },
  mine: {
    icon: ListChecks,
    title: 'Du hast gerade nichts übernommen',
    message: 'Unter „Noch offen“ siehst du, wo noch jemand gebraucht wird.',
  },
  open: {
    icon: HandHelping,
    title: 'Alles ist verteilt',
    message: 'Für jede Aufgabe hat sich schon jemand gemeldet.',
  },
  done: {
    icon: CircleCheck,
    title: 'Noch nichts erledigt',
    message: 'Wenn du eine Aufgabe abhakst, findest du sie hier wieder.',
  },
} as const;

const layout = LinearTransition.duration(motion.base);

export default function TasksScreen() {
  const { careCase, currentUser, tasks } = useDemo();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const list = filterTasks(tasks, filter, currentUser.id);
  const groups = filter === 'done' ? [{ key: 'done', title: 'Erledigt', tasks: list }] : groupByDue(list);

  return (
    <Screen eyebrow={`Für ${careCase.displayName}`} title="Aufgaben">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {filters.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            selected={filter === f.value}
            onPress={() => setFilter(f.value)}
          />
        ))}
      </ScrollView>

      {list.length === 0 ? (
        <Card padding="none">
          <EmptyState {...empty[filter]} />
        </Card>
      ) : (
        groups.map((g) => (
          <Animated.View
            key={`${filter}-${g.key}`}
            layout={layout}
            entering={FadeIn.duration(motion.base)}
            style={{ gap: 12 }}
          >
            {filter !== 'done' || groups.length > 1 ? (
              <Text variant="eyebrow" tone="subtle">
                {g.title}
              </Text>
            ) : null}
            {g.tasks.map((task) => (
              <Animated.View
                key={task.id}
                layout={layout}
                entering={FadeIn.duration(motion.base)}
                exiting={FadeOut.duration(motion.fast)}
              >
                <TaskItem task={task} withDoneToggle />
              </Animated.View>
            ))}
          </Animated.View>
        ))
      )}
      <View className="h-2" />
    </Screen>
  );
}
