import { router } from 'expo-router';
import { ListChecks } from 'lucide-react-native';

import type { Task } from '@/demo/schemas';
import { useDemo } from '@/demo/store';
import { senderStyle } from '@/features/documents/sender';
import { formatShortDate } from '@/lib/dates';
import { firstName } from '@/lib/greeting';
import { TaskCard, useToast } from '@/ui';

/** Task card wired to the demo store: claim, tick off, undo, open the letter. */
export function TaskItem({ task, withDoneToggle = false }: { task: Task; withDoneToggle?: boolean }) {
  const { currentUser, memberById, documentById, assignTask, setTaskDone } = useDemo();
  const toast = useToast();
  const doc = documentById(task.documentId);
  const style = doc ? senderStyle[doc.senderType] : { icon: ListChecks, tone: 'muted' as const };
  const assignee = memberById(task.assigneeId);
  const done = task.status === 'done';

  return (
    <TaskCard
      title={task.title}
      meta={doc ? `${doc.sender} · ${doc.title}` : 'Eigene Aufgabe'}
      icon={style.icon}
      tone={style.tone}
      due={task.dueDate}
      done={done}
      doneLabel={task.completedAt ? `Erledigt am ${formatShortDate(task.completedAt)}` : 'Erledigt'}
      assignee={
        assignee
          ? {
              name: assignee.displayName,
              label: assignee.id === currentUser.id ? 'Du' : firstName(assignee.displayName),
            }
          : undefined
      }
      onClaim={() => {
        assignTask(task.id, currentUser.id);
        toast({
          message: 'Du hast die Aufgabe übernommen.',
          action: { label: 'Rückgängig', onPress: () => assignTask(task.id, null) },
        });
      }}
      onToggleDone={
        withDoneToggle
          ? () => {
              const wasUnassigned = task.assigneeId === null;
              setTaskDone(task.id, !done);
              if (!done) {
                toast({
                  message: 'Erledigt. Danke dir!',
                  action: {
                    label: 'Rückgängig',
                    onPress: () => {
                      setTaskDone(task.id, false);
                      if (wasUnassigned) assignTask(task.id, null);
                    },
                  },
                });
              }
            }
          : undefined
      }
      onPress={doc ? () => router.push({ pathname: '/dokument/[id]', params: { id: doc.id } }) : undefined}
    />
  );
}
