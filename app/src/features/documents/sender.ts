import { Building2, HeartHandshake, Landmark, Stethoscope, type LucideIcon } from 'lucide-react-native';

import type { SenderType } from '@/demo/schemas';
import type { TaskTone } from '@/ui';

/** Consistent icon and tone per kind of sender across all screens. */
export const senderStyle: Record<SenderType, { icon: LucideIcon; tone: TaskTone }> = {
  pflegekasse: { icon: Building2, tone: 'primary' },
  medizinischer_dienst: { icon: Stethoscope, tone: 'ochre' },
  pflegedienst: { icon: HeartHandshake, tone: 'info' },
  arzt: { icon: Stethoscope, tone: 'info' },
  behoerde: { icon: Landmark, tone: 'muted' },
};
