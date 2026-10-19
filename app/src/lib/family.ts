import type { Member, Task } from '@/demo/schemas';

import { isoInDays } from './dates';
import { firstName } from './greeting';

export type MemberLoad = { member: Member; share: number; openTitles: string[] };

/**
 * Who carries what: tasks done in the last 7 days plus tasks currently taken.
 * Used for a gentle visual only – never shown as numbers or a ranking.
 */
export function familyLoad(members: Member[], tasks: Task[], today: Date = new Date()): MemberLoad[] {
  const since = isoInDays(-7, today);
  const counts = members.map((member) => {
    const mine = tasks.filter((t) => t.assigneeId === member.id);
    const doneRecently = mine.filter((t) => t.status === 'done' && (t.completedAt ?? '') >= since).length;
    const open = mine.filter((t) => t.status !== 'done');
    return { member, weight: doneRecently + open.length, openTitles: open.map((t) => t.title) };
  });
  const total = counts.reduce((sum, c) => sum + c.weight, 0);
  return counts.map(({ member, weight, openTitles }) => ({
    member,
    share: total === 0 ? 1 / members.length : weight / total,
    openTitles,
  }));
}

/** Friendly, never blaming suggestion from the current user's perspective. */
export function loadSuggestion(
  loads: MemberLoad[],
  currentUserId: string,
): { text: string; askMemberId: string | null } {
  const me = loads.find((l) => l.member.id === currentUserId);
  const others = loads.filter((l) => l.member.id !== currentUserId);
  if (!me || others.length === 0) {
    return {
      text: 'Lade jemanden aus der Familie ein, dann könnt ihr euch die Aufgaben teilen.',
      askMemberId: null,
    };
  }
  const fairShare = 1 / loads.length;
  if (me.share > fairShare + 0.15) {
    const helper = [...others].sort((a, b) => a.share - b.share)[0]!;
    const name = firstName(helper.member.displayName);
    return {
      text: `Du trägst gerade einen großen Teil. Vielleicht mag ${name} etwas übernehmen – zum Beispiel eine der offenen Aufgaben.`,
      askMemberId: helper.member.id,
    };
  }
  return {
    text: 'Ihr teilt euch die Aufgaben gerade gut auf. Schön, dass ihr zusammenhaltet.',
    askMemberId: null,
  };
}
