import { CalendarClock } from 'lucide-react-native';

import { daysUntil, deadlineLabel, deadlineUrgency, formatLongDate, type DeadlineUrgency } from '@/lib/dates';
import { Chip, type ChipTone } from './Chip';

const urgencyTone: Record<DeadlineUrgency, ChipTone> = {
  overdue: 'accent',
  today: 'accent',
  soon: 'accent',
  week: 'ochre',
  later: 'neutral',
};

/**
 * Deadline as a calm label. Urgency is carried by words first and
 * a soft tone second – never alarm red.
 */
export function DeadlineBadge({ due, today }: { due: string; today?: Date }) {
  const tone = urgencyTone[deadlineUrgency(daysUntil(due, today))];
  return <Chip label={deadlineLabel(due, today)} icon={CalendarClock} tone={tone} />;
}

export function deadlineAccessibilityLabel(due: string, today?: Date): string {
  return `Frist: ${deadlineLabel(due, today)}, ${formatLongDate(due)}`;
}
