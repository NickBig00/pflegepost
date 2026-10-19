import { ListChecks } from 'lucide-react-native';

import { useDemo } from '@/demo/store';
import type { Task } from '@/demo/schemas';
import { senderStyle } from '@/features/documents/sender';
import { firstName } from '@/lib/greeting';
import { TaskCard, useToast } from '@/ui';

/** Task card wired to the demo store, with "Übernehmen" and undo. */
export function TaskItem({ task }: { task: Task }) {
  const { currentUser, memberById, documentById, assignTask } = useDemo();
  const toast = useToast();
  const doc = documentById(task.documentId);
  const style = doc ? senderStyle[doc.senderType] : { icon: ListChecks, tone: 'muted' as const };
  const assignee = memberById(task.assigneeId);

  return (
    <TaskCard
      title={task.title}
      meta={doc ? `${doc.sender} · ${doc.title}` : 'Eigene Aufgabe'}
      icon={style.icon}
      tone={style.tone}
      due={task.dueDate}
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
    />
  );
}
