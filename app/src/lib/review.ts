import type { Member, Task } from '@/demo/schemas';

import { isoInDays } from './dates';
import { firstName } from './greeting';
import { upcomingTasks } from './tasks';

export type WeeklyReview = {
  greeting: string;
  intro: string;
  done: { title: string; by: string }[];
  next: Task[];
  closing: string;
};

/** The weekly review reads like a short, appreciative letter – not a report. */
export function weeklyReview(
  tasks: Task[],
  members: Member[],
  currentUserId: string,
  caseName: string,
  today: Date = new Date(),
): WeeklyReview {
  const since = isoInDays(-7, today);
  const doneThisWeek = tasks.filter((t) => t.status === 'done' && (t.completedAt ?? '') >= since);
  const nameOf = (id: string | null) => {
    if (id === currentUserId) return 'Du';
    const m = members.find((x) => x.id === id);
    return m ? firstName(m.displayName) : 'Jemand';
  };
  const me = members.find((m) => m.id === currentUserId);

  const count = doneThisWeek.length;
  const intro =
    count === 0
      ? `diese Woche war ruhig. Manchmal ist das genau richtig – für dich und für ${caseName}.`
      : `diese Woche habt ihr ${count === 1 ? 'eine Sache' : `${count} Dinge`} für ${caseName} erledigt. Das ist viel, und es ist nicht selbstverständlich.`;

  return {
    greeting: `Liebe${me ? ` ${firstName(me.displayName)}` : 's Familienmitglied'},`,
    intro,
    done: doneThisWeek.map((t) => ({ title: t.title, by: nameOf(t.assigneeId) })),
    next: upcomingTasks(tasks, 2),
    closing: 'Danke, dass ihr euch so kümmert. Pass auch gut auf dich auf.',
  };
}
