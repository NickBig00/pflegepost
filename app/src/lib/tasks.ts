import type { Task } from '@/demo/schemas';

/** Open tasks, earliest deadline first; tasks without a deadline last. */
export function upcomingTasks(tasks: Task[], limit?: number): Task[] {
  const open = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31'));
  return limit === undefined ? open : open.slice(0, limit);
}
