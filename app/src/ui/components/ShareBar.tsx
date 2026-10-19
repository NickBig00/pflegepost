import { View } from 'react-native';

import { useTheme } from '../theme';
import type { ColorToken } from '../tokens';

export type ShareSegment = { key: string; share: number; color: ColorToken };

/**
 * A soft bar showing proportions (e.g. who carries how much). Deliberately
 * without numbers or labels inside – the words around it do the talking.
 */
export function ShareBar({
  segments,
  accessibilityLabel,
}: {
  segments: ShareSegment[];
  accessibilityLabel: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      className="h-3 flex-row gap-1 overflow-hidden rounded-full"
    >
      {segments
        .filter((s) => s.share > 0)
        .map((s) => (
          <View
            key={s.key}
            className="rounded-full"
            style={{ flex: s.share, backgroundColor: colors[s.color] }}
          />
        ))}
    </View>
  );
}
