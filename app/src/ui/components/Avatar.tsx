import { View } from 'react-native';

import { fontFamily } from '../tokens';
import { Text } from './Text';

const palettes = [
  { bg: 'bg-primary-soft', text: 'onPrimarySoft' },
  { bg: 'bg-accent-soft', text: 'onAccentSoft' },
  { bg: 'bg-ochre-soft', text: 'onOchreSoft' },
  { bg: 'bg-info-soft', text: 'onInfoSoft' },
] as const;

const sizes = { sm: 28, md: 40, lg: 56 } as const;

export type AvatarSize = keyof typeof sizes;

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Stable palette per name, so a person always has the same color. */
export function paletteIndex(name: string): number {
  // FNV-1a: spreads similar names (same family name) across palettes.
  let hash = 0x811c9dc5;
  for (const ch of name) hash = Math.imul(hash ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  return hash % palettes.length;
}

/** Background the avatar sits on, so the separating ring blends in. */
type RingOn = 'surface' | 'canvas';
const ringClass: Record<RingOn, string> = {
  surface: 'border-2 border-surface',
  canvas: 'border-2 border-canvas',
};

export type AvatarProps = { name: string; size?: AvatarSize; ring?: RingOn };

export function Avatar({ name, size = 'md', ring }: AvatarProps) {
  const px = sizes[size];
  const p = palettes[paletteIndex(name)]!;
  return (
    <View
      accessibilityLabel={name}
      accessible
      className={`items-center justify-center rounded-full ${p.bg} ${ring ? ringClass[ring] : ''}`}
      style={{ width: px, height: px }}
    >
      <Text
        variant="caption"
        tone={p.text}
        allowFontScaling={false}
        style={{
          fontFamily: fontFamily.semibold,
          fontSize: Math.round(px * 0.38),
          lineHeight: Math.round(px * 0.5),
        }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

/** Overlapping avatars, e.g. everyone in a family. */
export function AvatarGroup({
  names,
  size = 'sm',
  max = 4,
  on = 'surface',
}: {
  names: string[];
  size?: AvatarSize;
  max?: number;
  on?: RingOn;
}) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  const px = sizes[size];
  return (
    <View className="flex-row" accessible accessibilityLabel={names.join(', ')}>
      {shown.map((n, i) => (
        <View key={n + i} style={{ marginLeft: i === 0 ? 0 : -px * 0.22 }}>
          <Avatar name={n} size={size} ring={on} />
        </View>
      ))}
      {rest > 0 ? (
        <View
          className={`items-center justify-center rounded-full bg-surface-muted ${ringClass[on]}`}
          style={{ width: px, height: px, marginLeft: -px * 0.22 }}
        >
          <Text variant="caption" tone="muted" allowFontScaling={false}>
            +{rest}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
