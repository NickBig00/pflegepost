import { isoInDays } from './dates';
import type { Task } from '@/demo/schemas';

/** Open tasks, earliest deadline first; tasks without a deadline last. */
export function upcomingTasks(tasks: Task[], limit?: number): Task[] {
  const open = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31'));
  return limit === undefined ? open : open.slice(0, limit);
}

export type TaskFilter = 'all' | 'mine' | 'open' | 'done';

export function filterTasks(tasks: Task[], filter: TaskFilter, userId: string): Task[] {
  switch (filter) {
    case 'mine':
      return upcomingTasks(tasks.filter((t) => t.assigneeId === userId));
    case 'open':
      return upcomingTasks(tasks.filter((t) => t.assigneeId === null));
    case 'done':
      return tasks
        .filter((t) => t.status === 'done')
        .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
    default:
      return upcomingTasks(tasks);
  }
}

export type TaskGroup = { key: 'week' | 'later' | 'undated'; title: string; tasks: Task[] };

/** Groups open tasks into "Diese Woche" (incl. overdue), "Später" and "Ohne Frist". */
export function groupByDue(tasks: Task[], today: Date = new Date()): TaskGroup[] {
  const weekEnd = isoInDays(7, today);
  const groups: TaskGroup[] = [
    {
      key: 'week',
      title: 'Diese Woche',
      tasks: tasks.filter((t) => t.dueDate !== null && t.dueDate <= weekEnd),
    },
    { key: 'later', title: 'Später', tasks: tasks.filter((t) => t.dueDate !== null && t.dueDate > weekEnd) },
    { key: 'undated', title: 'Ohne Frist', tasks: tasks.filter((t) => t.dueDate === null) },
  ];
  return groups.filter((g) => g.tasks.length > 0);
}
