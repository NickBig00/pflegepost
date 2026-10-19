import type { SenderType } from '@/demo/schemas';
import { Icon, IconTile, type ColorToken, type TaskTone } from '@/ui';

import { senderStyle } from './sender';

const iconColor: Record<TaskTone, ColorToken> = {
  primary: 'onPrimarySoft',
  accent: 'onAccentSoft',
  ochre: 'onOchreSoft',
  info: 'onInfoSoft',
  muted: 'fgMuted',
};

/** Icon tile for a sender, the same on every screen. */
export function SenderTile({ senderType }: { senderType: SenderType }) {
  const { icon, tone } = senderStyle[senderType];
  return (
    <IconTile tone={tone}>
      <Icon icon={icon} size={20} color={iconColor[tone]} />
    </IconTile>
  );
}
