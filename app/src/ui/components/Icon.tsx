import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '../theme';
import type { ColorToken } from '../tokens';

export type IconProps = {
  icon: LucideIcon;
  size?: number;
  color?: ColorToken;
  strokeWidth?: number;
};

/** Lucide icons with a calm, consistent stroke. Decorative by default (hidden from screen readers). */
export function Icon({ icon: Glyph, size = 22, color = 'fg', strokeWidth = 1.75 }: IconProps) {
  const { colors } = useTheme();
  return (
    <View aria-hidden>
      <Glyph size={size} color={colors[color]} strokeWidth={strokeWidth} />
    </View>
  );
}
