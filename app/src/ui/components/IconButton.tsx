import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { ColorToken } from '../tokens';
import { Icon } from './Icon';

export type IconButtonProps = {
  icon: LucideIcon;
  /** Required: icon-only buttons need a spoken label. */
  accessibilityLabel: string;
  onPress: () => void;
  /** "muted" on normal surfaces, "camera" on the dark camera view. */
  variant?: 'muted' | 'camera';
};

const variants: Record<NonNullable<IconButtonProps['variant']>, { bg: string; icon: ColorToken }> = {
  muted: { bg: 'bg-surface-muted', icon: 'fg' },
  camera: { bg: 'bg-on-camera/15', icon: 'onCamera' },
};

/** Round 44-pt icon button, e.g. for closing a flow. */
export function IconButton({ icon, accessibilityLabel, onPress, variant = 'muted' }: IconButtonProps) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={6}
    >
      {({ pressed }) => (
        <View
          className={`h-11 w-11 items-center justify-center rounded-full ${v.bg} ${pressed ? 'opacity-70' : ''}`}
        >
          <Icon icon={icon} size={22} color={v.icon} strokeWidth={2} />
        </View>
      )}
    </Pressable>
  );
}
