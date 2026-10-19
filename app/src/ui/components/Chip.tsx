import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { haptics } from '../haptics';
import type { ColorToken } from '../tokens';
import { Icon } from './Icon';
import { Text, type TextTone } from './Text';

export type ChipTone = 'neutral' | 'primary' | 'accent' | 'ochre' | 'info' | 'success';

const tones: Record<ChipTone, { bg: string; text: TextTone; icon: ColorToken }> = {
  neutral: { bg: 'bg-surface-muted', text: 'muted', icon: 'fgMuted' },
  primary: { bg: 'bg-primary-soft', text: 'onPrimarySoft', icon: 'onPrimarySoft' },
  accent: { bg: 'bg-accent-soft', text: 'onAccentSoft', icon: 'onAccentSoft' },
  ochre: { bg: 'bg-ochre-soft', text: 'onOchreSoft', icon: 'onOchreSoft' },
  info: { bg: 'bg-info-soft', text: 'onInfoSoft', icon: 'onInfoSoft' },
  success: { bg: 'bg-success-soft', text: 'onSuccessSoft', icon: 'onSuccessSoft' },
};

export type ChipProps = {
  label: string;
  icon?: LucideIcon;
  tone?: ChipTone;
  /** Makes the chip a toggle (filter chip). */
  selected?: boolean;
  onPress?: () => void;
};

/** Small status label, or a selectable filter chip when `onPress` is set. */
export function Chip({ label, icon, tone = 'neutral', selected, onPress }: ChipProps) {
  const selectable = onPress !== undefined;
  // Filter chips: outlined when off, filled sage when on. Status chips: soft tone.
  const t = selectable
    ? selected
      ? { bg: 'bg-primary', text: 'onPrimary' as TextTone, icon: 'onPrimary' as ColorToken }
      : {
          bg: 'border border-border-strong bg-surface',
          text: 'default' as TextTone,
          icon: 'fgMuted' as ColorToken,
        }
    : tones[tone];

  const body = (
    <View
      className={`flex-row items-center gap-1.5 self-start rounded-full ${t.bg} ${
        selectable ? 'min-h-[36px] px-3.5' : 'min-h-[28px] px-2.5'
      }`}
    >
      {icon ? <Icon icon={icon} size={selectable ? 16 : 14} color={t.icon} strokeWidth={2} /> : null}
      <Text variant={selectable ? 'calloutStrong' : 'caption'} tone={t.text}>
        {label}
      </Text>
    </View>
  );

  if (!selectable) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      hitSlop={4}
      onPress={() => {
        haptics.select();
        onPress();
      }}
      className="self-start"
    >
      {body}
    </Pressable>
  );
}
